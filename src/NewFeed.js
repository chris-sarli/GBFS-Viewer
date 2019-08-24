import L from "leaflet";

import {Station} from "./Station";
import {Vehicle} from "./Vehicle";

export class NewFeed {
    constructor(obj, files) {
        this.url = obj.url;
        this.name = obj.name;
        this.displayOpts = obj.displayOpts;

        this.freeVehicles = obj.freeVehicles;
        this.hubs = obj.hubs;
        this.files = files;


        this.vehicles = [];
        this.stations = [];

        // this.featureGroups = this.makeFeatureGroups();
    }

    getUrls() {
        return getUrl(this.url + "gbfs.json").then(gbfsFile => {
            return gbfsFile.data["en"].feeds;
        }).then(urlObjs => {
            return parseFeeds(urlObjs, this.files);
        })
    }

    generateFeatureGroupAndLayers(objects, displayOpts) {
        let layers = objects.map(obj => {
            let marker = generateMarker(obj, displayOpts);
            return marker;
        });
        return L.featureGroup(layers);
    }

    generateFeatureGroups(data) {
        let featureGroups = {};
        if (typeof this.freeVehicles !== 'undefined') {
            featureGroups[this.freeVehicles.layerName] = this.generateFeatureGroupAndLayers(data.vehicles, this.freeVehicles.displayOpts);
        }
        if (this.hubs !== undefined) {
            featureGroups[this.hubs.layerName] = this.generateFeatureGroupAndLayers(data.stations, this.hubs.displayOpts);
        }
        return featureGroups;
    }

    loadData() {
        return this.getUrls().then(gbfsUrls => {

            let promises = [];

            if (typeof gbfsUrls.free_status !== 'undefined') {
                promises.push(getUrl(gbfsUrls.free_status).then(response => response.data.bikes));
            } else {
                promises.push(Promise.resolve({}));
            }

            if (typeof gbfsUrls.station_info !== 'undefined') {
                promises.push(getUrl(gbfsUrls.station_info).then(response => response.data.stations));
            } else {
                promises.push(Promise.resolve({}));
            }

            if (typeof gbfsUrls.station_status !== 'undefined') {
                promises.push(getUrl(gbfsUrls.station_status).then(response => response.data.stations));
            } else {
                promises.push(Promise.resolve({}));
            }


            return promises;
        }).then(promises => {

            return Promise.all(promises).then(data => {

                let vehicles = data[0].map(v => {
                    return new Vehicle(v);
                });

                let createdStations = {};
                for (let info in data[1]) {
                    let station = data[1][info];
                    createdStations[station["station_id"]] = new Station(station);
                }

                for (let status in data[2]) {
                    if (createdStations[data[2][status]["station_id"]] !== undefined) {
                        createdStations[data[2][status]["station_id"]].addStatus(data[2][status]);
                    }
                }
                let stations = Object.values(createdStations);

                return {vehicles: vehicles, stations: stations};
            })
        })
    }

    makeLeafletObjects() {
        return this.loadData().then(loaded => {
            return this.generateFeatureGroups(loaded);
        });
    }

    // getFeatureGroups() {
    //     return this.featureGroups;
    // }


}

/**
 * Matches JSON for specific fields, used to parsing gbfs.json.
 * @param {Object} obj JSON to parse
 * @param {String[]} fields Strings to look for
 */
function parseFeeds(obj, fields) {

    let values = {};
    for (let v in obj) {
        values[obj[v].name] = obj[v].url;
    }

    let dict = {};
    for (let k in fields) {
        dict[k] = values[fields[k]];
    }

    return dict;
}

/**
 * Produces a Leaflet marker object for a specified object with specified visual characteristics.
 * @param {Object} obj An object that will be displayed with a leaflet marker.
 * @param {Object} displayOpts JSON representing the options which the marker will be displayed with.
 */
function generateMarker(obj, displayOpts) {
    let marker;
    switch (displayOpts.type) {
        case "icon":
            marker = new L.marker([obj.lat, obj.lon], displayOpts.options);
            break;
        case "circle":
            marker = new L.circleMarker([obj.lat, obj.lon], displayOpts.options);
            break;
    }
    return marker;
}

function getUrl(url) {
    if (typeof url === 'undefined') {
        console.log("Rejected null url.");
        return {};
    } else {
        return new Promise(resolve => {
            const xmlhttp = new XMLHttpRequest();

            // var parsedFeedURLs;
            xmlhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve(JSON.parse(this.responseText));
                }
            };
            xmlhttp.open("GET", url, true);
            xmlhttp.send();
        });
    }
}