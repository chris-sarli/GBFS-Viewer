
// import turf from "@turf";
//
// var pt = turf.point([-77, 44]);
// var poly = turf.polygon([[
//     [-81, 41],
//     [-81, 47],
//     [-72, 47],
//     [-72, 41],
//     [-81, 41]
// ]]);
//
//
// console.log(turf.booleanPointInPolygon(pt, poly));

// Holds the Feed objects
let feeds;

// Create the basemaps that will be available
let basemaps = function () {
    let out = {};
    for (let m in options.basemaps) {
        out[m] = L.tileLayer(options.basemaps[m].url, options.basemaps[m].opts);
    }
    return out;
}();

// Holds the Overlay Layers for each Feed object
let feedLayers = {};

// The leaflet Control.Layer
let layersControl = L.control.layers(basemaps, feedLayers, { collapsed: false });

// The map object
let gbfsMap = L.map(options.mapObject, {
    layers: Object.values(basemaps)
});

// Custom button control
let customButtons = L.Control.extend({

    options: {
        position: 'bottomright'
    },
    onAdd: function (map) {

        var container = L.DomUtil.create('div', '');
        container.innerHTML = `<div class='custom-collection'>
<div class='leaflet-bar leaflet-control leaflet-control-custom' onclick='openModal()'><span class='symbol'>ⓘ</span> About</div>
        <div class='leaflet-bar leaflet-control leaflet-control-custom fix-margin' onclick='load()'><span class='symbol'>↻</span> Reload Data...</div>
        </div>`;
        return container;
    },
});

// Create an instance of the custom control buttons and add it to the map
let custom = new customButtons();
custom.addTo(gbfsMap);

// Add Zone geoJSON to map if specified
if (options.zones !== undefined) {

    // Create the polygons
    let systemZones = L.geoJSON(options.zones.data, options.zones.display);

    (function () {
        // If specified, bind popups to individual polygon zones
        if (options.zones.popup !== undefined) {
            return systemZones.bindPopup(function (layer) {
                return options.zones.popup.title + layer.feature.properties[options.zones.popup.geoJsonField];
            });
        }
        else {
            return systemZones
        }
    })().addTo(gbfsMap);
}



// Variable to track loading state of view
let loading;
loading = false;

// Clear map and load
function load() {

    if (!loading) {
        loading = true;

        for (let feedLayer in feedLayers) {
            feedLayers[feedLayer].eachLayer(function (layerToRemove) {
                feedLayers[feedLayer].removeLayer(layerToRemove);
            })
            layersControl.removeLayer(feedLayers[feedLayer]);
        }

        feeds = createFeeds(options.feeds);

        gbfsMap.fitBounds(options.bounds);

        checkIfLoaded();
    }
}


// Load on load :)
load();
