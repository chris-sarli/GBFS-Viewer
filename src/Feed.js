import options from './options'
import L from "leaflet";

import { Station } from "./Station";
import { Vehicle } from "./Vehicle";

/**
 * Class representing a feed
 */
export class Feed {

    /**
     * Creates a new feed.
     * @param {String} url The base URL of a feed, in which gbfs.json, system_information.json, etc. reside.
     * @param {String} name The user-facing name which this feed will be identified by
     * @param {Object} displayOpts JSON representing the display options that will be applied to the markers of this feed on the map.
     * @param {Object} hubs Object which specifies inclusion and parameters of GBFS stations indicated in this feed.
     */
    constructor(url, name, displayOpts, hubs, files) {
        this.url = url;
        this.name = name;
        this.displayOpts = displayOpts;
        this.hubs = hubs;
        this.files = files;

        // The group of features which will be added to the map under a single feed identity
        this.featureGroups = [L.featureGroup([])];

        // An array of Vehicle objects indicated by this feed
        this.vehicles = [];

        // A simple value to assist with loading
        this.isVisable = false;
    }

    render() {

        // First, load the gbfs.json file, which contains URLs of other files.
        loadGBFS(this.url, this.files).then(gbfsUrls => {
            // Get the available vehicles
            var a = getAvailable(gbfsUrls.free_status);

            var ret = [];

            a.then(available => {

                for (var v in available) {
                    // Add each available Vehicle to the array for this Feed
                    this.vehicles[v] = available[v];

                    // Add each Vehcile tho the FeatureGroup
                    addLayerToGroup(this.featureGroups[0], this.vehicles[v], this.displayOpts, this.name);

                }

                ret.push([this]);

                return ret;
            }).then(ret => {
                // Handle hub/station loading if specified
                if (this.hubs != undefined) {

                    // this.featureGroups.push([L.featureGroup([])]);

                    feedLayers[1] = L.featureGroup([]);

                    // First, get the static info about the hubs themselves
                    parseHubInfo(gbfsUrls.station_info).then(recieved => {

                        // A variable to represent the hubs of this feed
                        var stations = {};
                        for (var r in recieved) {
                            // Add each indicated station/hub
                            stations[recieved[r].station_id] = new Station(recieved[r])
                        }

                        return stations;
                    }).then(stations => {

                        // Now, get the current status of these hubs
                        parseHubInfo(gbfsUrls.station_status).then(current => {
                            for (var s in current) {
                                var status = current[s];
                                if (stations[status.station_id] != undefined) {
                                    // Update the status of each active hub
                                    stations[status.station_id].addStatus(status);
                                }
                            }
                        }).then(stations => {
                            for (var s in stations) {

                                var station = stations[s];

                                // Handle popup binding if specified, add to feature group
                                if (this.hubs.popup) {
                                    addLayerToGroup(feedLayers[1], station, this.hubs.displayOpts, this.name);
                                    feedLayers[1].addLayer(
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
                                    feedLayers[1].addLayer(display(station, this.hubs.display));
                                }
                            }
                        });

                        // Add the hubs layer as a feed layer
                        feedLayers[this.hubs.layerName] = feedLayers[1];

                        // Add the layer to the control
                        addLayerToControl(this.hubs.layerName);

                        // Add the layer to the map
                        feedLayers[this.hubs.layerName].addTo(gbfsMap);

                        // Hide this feature group by default if indicated
                        if (this.hubs.hideDefault) {
                            feedLayers[this.hubs.layerName].removeFrom(gbfsMap);
                        }
                    });
                });



        })
    }
})

});
    }

}

/**
 * Parses the gbfs.json file.
 * @param {url} url URL representing the GBFS feed base. Refers to the direcotry containing gbfs.json, not gbfs.json itself.
 */
function loadGBFS(url, files) {
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
 * Parses remote free_bike_status.json and returns a JSON object of corresponding Vehicles.
 * @param {String} url URL of JSON free_bike_status.json to parse.
 */
function getAvailable(url) {
    return (new Promise(resolve => {

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
    }));
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
 * Used to update the Leaflet layerControl with new layers.
 * @param {Integer} n The index of the layer in feedLayers to be added to the layerControl object.
 */
function addLayerToControl(fLayers, n, map) {
    layersControl.addOverlay(fLayers[n], n);
    layersControl.addTo(map);
}


/**
 * Adds a marker to a feature group for a specified vehicle.
 * @param {L.featureGroup} featureGroup The Leaflet featureGroup to add the marker to
 * @param {Vehicle, Station} markerToAdd The Vehicle for which a Leaflet marker will be added to the map
 * @param {Object} feedDisplayOpts The JSON representing display options for all markers on the layer
 * @param {String} operator The Operator of the Vehicle
 */
function addLayerToGroup(feed, operator) {

    if ()

        // Check if popup is desired
        if (options.vehicle != undefined && options.vehicle.popup == true) {
            featureGroup.addLayer(display(markerToAdd, feedDisplayOpts).bindPopup(
                toPopupDisplay(
                    [{
                        "Vehicle ID": markerToAdd.id,
                        "Vehicle Operator": operator,
                        "Latitude": precise_round(vehicleToAdd.lat, 3),
                        "Longitude": precise_round(vehicleToAdd.lon, 3),
                    }, vehicleToAdd.misc])));
        }
        else {
            featureGroup.addLayer(display(markerToAdd, feedDisplayOpts));
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
 * Converts Array of JSON Objects into HTML with keys bolded and followed with a colon.
 * @param {Object[]} objects Array of JSON objects representing keys and values
 */
function toPopupDisplay(objects) {
    var str = "";

    for (var obj in objects) {
        for (var l in objects[obj]) {
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