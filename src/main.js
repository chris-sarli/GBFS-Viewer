
import turf from "@turf";

var pt = turf.point([-77, 44]);
var poly = turf.polygon([[
    [-81, 41],
    [-81, 47],
    [-72, 47],
    [-72, 41],
    [-81, 41]
]]);


console.log(turf.booleanPointInPolygon(pt, poly));

// Holds the Feed objects
var feeds;

// Create the basemaps that will be available
let basemaps = function () {
    var out = {};
    for (mapName in options.basemaps) {
        out[mapName] = L.tileLayer(options.basemaps[mapName].url, options.basemaps[mapName].opts);
    }
    return out;
}();

// Holds the Overlay Layers for each Feed object
var feedLayers = {};

// The leaflet Control.Layer
var layersControl = L.control.layers(basemaps, feedLayers, { collapsed: false });

// The map object
var gbfsMap = L.map(options.mapObject, {
    layers: Object.values(basemaps)
});

// Custom button control
var customButtons = L.Control.extend({

    options: {
        position: 'bottomright'
    },
    onAdd: function (map) {

        var container = L.DomUtil.create('div', '');
        container.innerHTML = `

        <div class='custom-collection'>
    
        <div class='leaflet-bar leaflet-control leaflet-control-custom' onclick='openModal()'><span class='symbol'>ⓘ</span> About</div>

        <div class='leaflet-bar leaflet-control leaflet-control-custom fix-margin' onclick='load()'><span class='symbol'>↻</span> Reload Data...</div>
        
        </div>
        `;
        return container;
    },
});

// Create an instance of the custom control buttons and add it to the map
let custom = new customButtons();
custom.addTo(gbfsMap);

// Add Zone geoJSON to map if speicified
if (options.zones != undefined) {

    // Create the polygons
    let systemZones = L.geoJSON(options.zones.data, options.zones.display);

    (function () {
        // If specified, bind popups to individual polygon zones
        if (options.zones.popup != undefined) {
            return systemZones.bindPopup(function (layer) {
                return options.zones.popup.title + layer.feature.properties[options.zones.popup.geoJsonField];
            });
        }
        else {
            return systemZones
        }
    })().addTo(gbfsMap);
}

/**
 * Class representing a feed
 */
class Feed {

    /**
     * Creates a new feed.
     * @param {String} url The base URL of a feed, in which gbfs.json, system_information.json, etc. reside.
     * @param {String} name The user-facing name which this feed will be identified by
     * @param {Object} displayOpts JSON representing the display options that will be applied to the markers of this feed on the map.
     * @param {Object} hubs Object which specifies inclusion and parameters of GBFS stations indicated in this feed.
     */
    constructor(url, name, displayOpts, hubs) {
        this.url = url;
        this.name = name;
        this.displayOpts = displayOpts;
        this.hubs = hubs;

        // The group of features which will be added to the map under a single feed identity
        this.featureGroup = L.featureGroup([]);

        // An array of Vehicle objects indicated by this feed
        this.vehicles = [];

        // A simple value to assist with loading
        this.isVisable = false;

        // Automatically begin adding to map.
        this.process();
    }

    process() {

        // First, load the gbfs.json file, which contains URLs of other files.
        loadGBFS(this.url).then(available => {
            var gbfsUrls = available;
            this.featureGroup.addTo(gbfsMap);

            // Get the available vehicles
            getAvailable(gbfsUrls.free_status).then(available => {

                for (var v in available) {
                    // Add each available Vehicle to the array for this Feed
                    this.vehicles[v] = available[v];

                    // Add each Vehcile tho the FeatureGroup
                    addLayerToGroup(this.featureGroup, this.vehicles[v], this.displayOpts, this.name);
                }

                // Add this Feed's FeatureGroup to the map's feed layers
                feedLayers[this.name] = this.featureGroup;

                // If the feed is not visible, make it so
                if (!this.isVisable) {

                    // And add the layer to the layer control object
                    addLayerToControl(this.name);
                    this.isVisable = true;
                }
            });

            // Handle hub/station loading if specified
            if (this.hubs != undefined) {

                // First, get the static info about the hubs themselves
                parseHubInfo(gbfsUrls.station_info).then(recieved => {

                    // A variable to represent the hubs of this feed
                    var stations = {};
                    for (var r in recieved) {

                        // Add each indicated station/hub
                        stations[recieved[r].station_id] = new Station(recieved[r])
                    }

                    // Now, get the current status of these hubs
                    parseHubInfo(gbfsUrls.station_status).then(current => {
                        for (var s in current) {
                            var status = current[s];
                            if (stations[status.station_id] != undefined) {

                                // Update the status of each active hub
                                stations[status.station_id].addStatus(status);
                            }
                        }

                        // A feature group for the hubs
                        var hubLayerGroup = L.featureGroup([]);

                        for (var s in stations) {

                            var station = stations[s]

                            // Handle popup binding if specified, add to feature group
                            if (this.hubs.popup) {
                                hubLayerGroup.addLayer(
                                    display(station, this.hubs.display)
                                        .bindPopup(
                                            toPopupDisplay([
                                                {
                                                    "Station Name": station.name,
                                                    "Station ID": station.id,
                                                    "Latitude": precise_round(station.lat, 3),
                                                    "Longitude": precise_round(station.lon, 3),
                                                    "Available Bikes": station.num_bikes_available,
                                                    "Available Docks": station.num_docks_available
                                                },
                                                station.info,
                                                station.status])
                                        )
                                );
                            }
                            else {
                                hubLayerGroup.addLayer(display(station, this.hubs.display));
                            }
                        }

                        // Add the hubs layer as a feed layer
                        feedLayers[this.hubs.layerName] = hubLayerGroup;

                        // Add the layer to the control
                        addLayerToControl(this.hubs.layerName);

                        // Add the layer to the map
                        feedLayers[this.hubs.layerName].addTo(gbfsMap);

                        // Hide this feature group by default if indicated
                        if (this.hubs.hideDefault) {
                            feedLayers[this.hubs.layerName].removeFrom(gbfsMap);
                        }
                    })

                })
            }

        });
    }

}

/**
 * Represents a GBFS Hub/Station
 */
class Station {

    /**
     * Creates a new Station from the station's station_information.json data.  
     * @param {Object} info The JSON object extracted from station_information.json which represents the static metadata about the station.
     */
    constructor(info) {
        this.id;
        this.name;
        this.lat;
        this.lon;
        this.num_bikes_available;
        this.num_docks_available;
        this.info = {};
        this.status = {};
        for (var i in info) {
            switch (i) {
                case "station_id":
                    this.id = info[i];
                    break;
                case "name":
                    this.name = info[i];
                    break;
                case "lat":
                    this.lat = info[i];
                    break;
                case "lon":
                    this.lon = info[i];
                    break;
                default:
                    this.info[i] = info[i];
                    break;
            }
        }
    }

    /**
     * Uses JSON from station_status.json for a specific station to update the corresponding Station's data.
     * @param {Object} json JSON representing the realtime status of the Station, sourced from station_status.json.
     */
    addStatus(json) {
        for (var s in json) {
            switch (s) {
                case "num_bikes_available":
                    this.num_bikes_available = json[s];
                    break;
                case "num_docks_available":
                    this.num_docks_available = json[s];
                    break;
                default:
                    this.status[s] = json[s];
                    break;
            }
        }
    }
}

/**
 * Parses a remote JSON file for its 'data' object.
 * @param {String} url URL of JSON to parse.
 */
function parseFile(url) {
    return new Promise(resolve => {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response = JSON.parse(this.responseText);
                var data = response.data
                resolve(data);
            }
        };

        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    });
}

/**
 * Parses a remote JSON file for its 'data.stations' object.
 * @param {String} url URL of JSON to parse.
 */
function parseHubInfo(url) {
    return new Promise(resolve => {

        // First get the data object
        parseFile(url).then(data => {
            var stations = data.stations
            resolve(stations);
        })
    });
}

/**
 * Parses remote free_bike_status.json and returns a JSON object of corresponding Vehicles.
 * @param {String} url URL of JSON free_bike_status.json to parse.
 */
function getAvailable(url) {
    return new Promise(resolve => {

        // First get the data object
        parseFile(url).then(data => {
            var available = data.bikes
            var vehicles = {};

            for (var r in available) {
                var i = available[r];
                vehicles[r] = new Vehicle(i);
            }

            resolve(vehicles);
        })
    });
}

/**
 * Converts Array of JSON Objects into HTML with keys bolded and followed with a colon.
 * @param {Object[]} objects Array of JSON objects representing keys and values
 */
function toPopupDisplay(objects) {
    var str = "";

    for (obj in objects) {
        for (l in objects[obj]) {
            str += "<strong>" + l + ":</strong> " + objects[obj][l].toString().replace(/,/g, ", ") + "<br />";
        }
    }
    return str;
}

/**
 * Rounds a number to a given number of decimal places. 
 * @param {Number} num Number to round
 * @param {Number} dec Decimals to round to
 */
function precise_round(num, dec) {

    if ((typeof num !== 'number') || (typeof dec !== 'number'))
        return false;

    var num_sign = num >= 0 ? 1 : -1;

    return (Math.round((num * Math.pow(10, dec)) + (num_sign * 0.0001)) / Math.pow(10, dec)).toFixed(dec);
}

/**
 * Adds a marker to a feature group for a specified vehicle.
 * @param {L.featureGroup} featureGroup The Leaflet featureGroup to add the marker to
 * @param {Vehicle} vehicleToAdd The Vehicle for which a Leaflet marker will be added to the map
 * @param {Object} feedDisplayOpts The JSON representing display options for all markers on the layer
 * @param {String} operator The Operator of the Vehicle
 */
function addLayerToGroup(featureGroup, vehicleToAdd, feedDisplayOpts, operator) {

    // Check if popup is desired
    if (options.vehicle != undefined && options.vehicle.popup == true) {
        featureGroup.addLayer(display(vehicleToAdd, feedDisplayOpts).bindPopup(
            toPopupDisplay(
                [{
                    "Vehicle ID": vehicleToAdd.id,
                    "Vehicle Operator": operator,
                    "Latitude": precise_round(vehicleToAdd.lat, 3),
                    "Longitude": precise_round(vehicleToAdd.lon, 3),
                }, vehicleToAdd.misc])));
    }
    else {
        featureGroup.addLayer(display(vehicleToAdd, feedDisplayOpts));
    }
}

/**
 * Represents a GBFS Vehicle/Bike.
 */
class Vehicle {

    /**
     * Constructs a Vehcile based on its JSON representation in free_bike_status.json.
     * @param {Object} json The JSON for this vehcile in free_bike_status.json.
     */
    constructor(json) {
        this.misc = {};

        for (var i in json) {
            switch (i) {
                case "bike_id":
                    this.id = json[i];
                    break;
                case "lat":
                    this.lat = json[i];
                    break;
                case "lon":
                    this.lon = json[i];
                    break;
                default:
                    this.misc[i] = json[i];
                    break;
            }
        }
    }
}

/**
 * Produces a Leaflet marker object for a specified object with specified visual characteristics.   
 * @param {Object} obj An object that will be displayed with a leaflet marker.
 * @param {Object} displayOpts JSON representing the options which the marker will be displayed with.
 */
function display(obj, displayOpts) {
    switch (displayOpts.type) {
        case "icon":
            return L.marker([obj.lat, obj.lon], displayOpts.options);
            break;
        case "circle":
            return L.circleMarker([obj.lat, obj.lon], displayOpts.options);
            break;
    }
}

/**
 * Creates Feed objects from indicated feeds.
 * @param {Object[]} specified Array of Objects representing feeds to be added to map.
 */
function createFeeds(specified) {
    var feeds = [];
    for (f in specified) {
        var feedToAdd = specified[f];
        feeds.push(new Feed(feedToAdd.url, feedToAdd.feed_name, feedToAdd.display, feedToAdd.hubs));
    }

    return feeds;
}

/**
 * Function checks if the map has loaded initially so as to remvoe the loader element.
 */
function checkIfLoaded() {

    setTimeout(function () {
        if (feeds.every(f => f.isVisable)) {
            loading = false;
            if (document.getElementById('loader') != undefined) {
                document.getElementById('loader').remove();
            }
        }
        else {
            checkIfLoaded();
        }
    }, 500);
}

// This is here because of CORS
(function () {
    var cors_api_host = 'cors-anywhere.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
})();

/**
 * Used to update the Leaflet layerControl with new layers.
 * @param {Integer} n The index of the layer in feedLayers to be added to the layerControl object.
 */
function addLayerToControl(n) {
    layersControl.addOverlay(feedLayers[n], n);
    layersControl.addTo(gbfsMap);
}

/**
 * Matches JSON for specific fields, used to parsing gbfs.json.
 * @param {Object} obj JSON to parse
 * @param {String[]} fields Strings to look for
 */
function parseFeeds(obj, fields) {
    var vals = {}
    for (var v in obj) {
        vals[obj[v].name] = obj[v].url;
    }

    var dict = {}
    for (var k in fields) {
        dict[k] = vals[fields[k]];
    }

    return dict;
}

/**
 * Parses the gbfs.json file.
 * @param {url} url URL representing the GBFS feed base. Refers to the direcotry containing gbfs.json, not gbfs.json itself.
 */
function loadGBFS(url) {
    return new Promise(resolve => {
        var xmlhttp = new XMLHttpRequest();

        // var parsedFeedURLs;
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response = JSON.parse(this.responseText);
                resolve(parseFeeds(response.data.en.feeds, files));
            }
        };
        xmlhttp.open("GET", url + "gbfs.json", true);
        xmlhttp.send();
    });
}

/**
 * Function to open the modal
 */
function openModal() {
    document.getElementById("modal-container").style.display = "";
}

/**
 * Function to close the modal
 */
function closeModal() {
    document.getElementById("modal-container").style.display = "none";
}

// Variable to track loading state of view
var loading = false;

// Clear map and load
function load() {

    if (!loading) {
        loading = true;

        for (feedLayer in feedLayers) {
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
