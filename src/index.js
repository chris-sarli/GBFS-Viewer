import './index.html';
import './style.css';
import L from "leaflet";

import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import {point, polygon} from "@turf/helpers";

import {options} from "./options";
import {Feed} from "./Feed";

let app = {}

app.options = options;

// Holds the OldFeed objects
app.feeds = [];

// Create the basemaps that will be available
app.basemaps = function () {
    let out = {};
    for (let mapName in app.options.basemaps) {
        out[mapName] = L.tileLayer(app.options.basemaps[mapName].url, app.options.basemaps[mapName].opts);
    }
    return out;
}();

// Holds the Overlay Layers for each OldFeed object
app.feedLayers = {};

// The leaflet Control.Layer
app.layersControl = L.control.layers(app.basemaps, app.feedLayers, {collapsed: false});

app.map = L.map(app.options.mapObject, {
    layers: Object.values(app.basemaps)
});

// Custom button control
app.customButtons = L.Control.extend({
    options: {
        position: 'bottomright'
    },
    onAdd: function (map) {

        let container = L.DomUtil.create('div', '');
        container.innerHTML = `

        <div class='custom-collection'>
    
        <div class='leaflet-bar leaflet-control leaflet-control-custom' onclick='document.getElementById("modal-container").style.display = ""'><span class='symbol'>ⓘ</span> About</div>

        <div class='leaflet-bar leaflet-control leaflet-control-custom fix-margin' onclick='load()'><span class='symbol'>↻</span> Reload Data...</div>
        
        </div>
        `;
        return container;
    },
});

// Create an instance of the custom control buttons and add it to the map
let custom = new app.customButtons();
custom.addTo(app.map);

// Add Zone geoJSON to map if speicified
if (typeof app.options.zones !== 'undefined') {

    // Create the polygons
    let systemZones = L.geoJSON(app.options.zones.data, app.options.zones.display);

    (function () {
        // If specified, bind popups to individual polygon zones
        if (app.options.zones.popup != undefined) {
            return systemZones.bindPopup(function (layer) {
                return app.options.zones.popup.title + layer.feature.properties[app.options.zones.popup.geoJsonField];
            });
        } else {
            return systemZones
        }
    })().addTo(app.map);
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
(function () {
    let cors_api_host = 'cors-anywhere.herokuapp.com';
    let cors_api_url = 'https://' + cors_api_host + '/';
    let slice = [].slice;
    let origin = window.location.protocol + '//' + window.location.host;
    let open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
        let args = slice.call(arguments);
        let targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
})();

// Variable to track loading state of view
let loading = false;

// Clear map and load
export function load() {

    if (!loading) {
        loading = true;

        for (let feedLayer in app.feedLayers) {
            app.feedLayers[feedLayer].eachLayer(function (layerToRemove) {
                app.feedLayers[feedLayer].removeLayer(layerToRemove);
            })
            app.layersControl.removeLayer(app.feedLayers[feedLayer]);
        }

        app.feeds = createFeeds(app.options.feeds);

        app.map.fitBounds(app.options.bounds);

        let featurePromises = [];

        for (let f in app.feeds) {
            featurePromises = featurePromises.concat(app.feeds[f].map(feed => {
                return feed.makeLeafletObjects();
            }));
        }

        Promise.all(featurePromises).then(feedGroups => {
            let userLayers = {};
            feedGroups.map(feedGroup => {
                userLayers = {...userLayers, ...feedGroup};
            });
            return userLayers;
        }).then(userLayers => {
            app.map.addControl(app.layersControl);
            Object.keys(userLayers).forEach(key => {
                app.map.addLayer(userLayers[key]);
                app.feedLayers[key] = userLayers[key];
                app.layersControl.addOverlay(userLayers[key], key);
            });
        }).finally(_f => {
            if (document.getElementById('loader') != undefined) {
                document.getElementById('loader').remove();
            }
        });
    }
}


// Load on load :)
load();
