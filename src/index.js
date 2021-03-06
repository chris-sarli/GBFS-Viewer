import './index.html';
import './style.css';
import L from 'leaflet';

import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';
import { getGeom } from '@turf/invariant';
import { featureEach } from '@turf/meta';

import { options } from './options';
import { Feed, toPopupDisplay } from './Feed';

let app = {};

app.options = options;

// Holds the OldFeed objects
app.feeds = [];

app.zs = L.marker();

// Create the basemaps that will be available
app.basemaps = (function() {
	let out = {};
	for (let mapName in app.options.basemaps) {
		out[mapName] = L.tileLayer(app.options.basemaps[mapName].url, app.options.basemaps[mapName].opts);
	}
	return out;
})();

app.zones = {};

// Holds the Overlay Layers for each OldFeed object
app.feedLayers = {};

// The leaflet Control.Layer
app.layersControl = L.control.layers(app.basemaps, app.feedLayers, { collapsed: false });

app.map = L.map(app.options.mapObject, {
	layers: Object.values(app.basemaps),
});

// Custom button control
app.customButtons = L.Control.extend({
	options: {
		position: 'bottomright',
	},
	onAdd: function(map) {
		let container = L.DomUtil.create('div', '');
		container.innerHTML = `

        <div class='custom-collection'>
    
        <div class='leaflet-bar leaflet-control leaflet-control-custom' onclick='document.getElementById("modal-container").style.display = ""'><span class='symbol'>ⓘ</span> About</div>

        <div id="reload" class='leaflet-bar leaflet-control leaflet-control-custom fix-margin'><span class='symbol'>↻</span> Reload Data...</div>
        
        </div>
        `;
		return container;
	},
});

// Create an instance of the custom control buttons and add it to the map
let custom = new app.customButtons();
custom.addTo(app.map);

function getZoneCounts(zone) {
	let keys = Object.keys(app.zones[zone].objs);
	return keys.map(key => {
		let o = {};
		o[key] = app.zones[zone].objs[key];
		return o;
	});
}

// Add Zone geoJSON to map if specified
if (typeof app.options.zones !== 'undefined') {
	// Create the polygons
	app.systemZones = L.geoJSON(app.options.zones.data, app.options.zones.display);

	featureEach(getGeom(app.options.zones.data), (c, i) => {
		app.zones[c.properties.zone] = { objs: {} };
		app.zones[c.properties.zone].poly = c.geometry;
	});
}

/**
 * Creates OldFeed objects from indicated feeds.
 * @param {Object[]} specified Array of Objects representing feeds to be added to map.
 */
function createFeeds(specified) {
	let feeds = [];
	for (let f in specified) {
		let feedToAdd = specified[f];
		let feed = new Feed(feedToAdd, options.files);
		// feed.getFeatureGroups(app.options.files);
		feeds.push([feed]);
	}

	return feeds;
}

// This is here because of CORS
(function() {
	let cors_api_host = 'cors-service.chris.sarl';
	let cors_api_url = 'https://' + cors_api_host + '/';
	let slice = [].slice;
	let origin = window.location.protocol + '//' + window.location.host;
	let open = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function() {
		let args = slice.call(arguments);
		let targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
		if (targetOrigin && targetOrigin[0].toLowerCase() !== origin && targetOrigin[1] !== cors_api_host) {
			args[1] = cors_api_url + args[1];
		}
		return open.apply(this, args);
	};
})();

// Variable to track loading state of view
let loading = false;

function clearZoneCounts() {
	for (let z in app.zones) {
		app.zones[z].objs = {};
	}
	app.UNZONED = {};
}

// Clear map and load
function load() {
	deactivateReloader();
	clearZoneCounts();
	return new Promise(function(resolve) {
		for (let feedLayer in app.feedLayers) {
			app.feedLayers[feedLayer].eachLayer(function(layerToRemove) {
				app.feedLayers[feedLayer].removeLayer(layerToRemove);
			});
			app.layersControl.removeLayer(app.feedLayers[feedLayer]);
		}

		app.feeds = createFeeds(app.options.feeds);

		app.map.fitBounds(app.options.bounds);

		let featurePromises = [];

		for (let f in app.feeds) {
			featurePromises = featurePromises.concat(
				app.feeds[f].map(feed => {
					return feed.makeLeafletObjects();
				})
			);
		}

		Promise.all(featurePromises)
			.then(feedGroups => {
				let userLayers = {};
				feedGroups.map(feedGroup => {
					userLayers = { ...userLayers, ...feedGroup };
				});
				return userLayers;
			})
			.then(userLayers => {
				app.map.addControl(app.layersControl);
				Object.keys(userLayers).forEach(key => {
					userLayers[key].eachLayer(m => {
						if (m.getLatLng() != null) {
							let ll = m.getLatLng();
							distributeToZones(ll.lat, ll.lng, key);
						}
					});
				});
				return userLayers;
			})
			.then(userLayers => {
				app.zs.removeFrom(app.map);
				app.zs = (function() {
					// If specified, bind popups to individual polygon zones
					if (typeof app.options.zones.popup !== 'undefined') {
						return app.systemZones.bindPopup(function(layer) {
							let str = app.options.zones.popup.title + layer.feature.properties[app.options.zones.popup.geoJsonField];
							str += `<br />`;
							str += toPopupDisplay(getZoneCounts(layer.feature.properties[app.options.zones.popup.geoJsonField]));
							return str;
						});
					} else {
						return app.systemZones;
					}
				})();
				app.zs.addTo(app.map);
				return userLayers;
			})
			.then(userLayers => {
				Object.keys(userLayers).forEach(key => {
					app.map.addLayer(userLayers[key]);
					app.feedLayers[key] = userLayers[key];
					app.layersControl.addOverlay(userLayers[key], key);
				});
			})
			.finally(_f => {
				// if (document.getElementById('loader') != undefined) {
				//     document.getElementById('loader').remove();
				// }

				resolve(true);
			});
	}).then(() => {
		activateReloader();
	});
}

function distributeToZones(lat, lon, feed) {
	let zoned = false;
	for (let z in app.zones) {
		let zone = app.zones[z];
		if (!zoned && booleanPointInPolygon([lon, lat], zone.poly)) {
			let a = zone.objs[feed];
			if (typeof a === 'undefined') {
				app.zones[z].objs[feed] = 1;
			} else {
				app.zones[z].objs[feed] = a + 1;
			}
			zoned = true;
		}
	}
	if (!zoned) {
		let a = app.UNZONED;
		if (typeof a === 'undefined') {
			app.UNZONED = {};
		}
		let b = app.UNZONED[feed];
		if (typeof b === 'undefined') {
			app.UNZONED[feed] = 0;
		}
		b = app.UNZONED[feed];
		app.UNZONED[feed] = b + 1;
	}
}

function activateReloader() {
	let elem = document.getElementById('reload');
	elem.classList.remove('buttonLoading');
	elem.innerHTML = "<span class='symbol'>↻</span> Reload Data...";
	elem.onclick = function() {
		load();
	};
}

function deactivateReloader() {
	let elem = document.getElementById('reload');
	elem.innerHTML = "<span class='symbol spin'>↻</span> Loading...";
	elem.onclick = function() {};
	elem.classList.add('buttonLoading');
}

// Load on load :)
load();
