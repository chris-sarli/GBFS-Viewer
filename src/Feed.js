import L from "leaflet";

import {Station} from "./Station";
import {Vehicle} from "./Vehicle";

export class Feed {
    constructor(obj, files) {
        this.url = obj.url;
        this.name = obj.name;
        this.displayOpts = obj.displayOpts;
        this.urlParams = "";
        if (Object.keys(obj).includes('urlParams')) {
            this.urlParams = "?";
            this.urlParams += Object.keys(obj.urlParams).map(i => i + "=" + obj.urlParams[i]).join("&");
        }

        this.freeVehicles = obj.freeVehicles;
        this.hubs = obj.hubs;
        this.files = files;

        this.vehicles = [];
        this.stations = [];

        // this.featureGroups = this.makeFeatureGroups();
    }

    getUrls() {
        return getUrl(this.url + "gbfs", this.urlParams).then(gbfsFile => {
            return gbfsFile.data["en"].feeds;
        }).then(urlObjs => {
            return parseFeeds(urlObjs, this.files);
        })
    }

    generateFeatureGroup(objects, options) {
        let displayOpts = options.displayOpts;
        let popup = options.popup;
        let layers = objects.filter(obj => (obj.lat != null && obj.lon != null)).map(obj => {
            let marker = generateMarker(obj, displayOpts);
            if (typeof popup !== 'undefined') {

                marker.bindPopup(toPopupDisplay(dissolve(obj)));
            }
            return marker;
        });
        let lg = L.featureGroup(layers);
        if (options.hideDefault) {
            lg.on('add', function(mapObj) {
                mapObj.target._map.removeLayer(lg);
                lg.off('add');
            })
        }
        return [lg, options.hideDefault];
    }

    generateFeatureGroups(data) {
        let featureGroups = {};
        if (typeof this.freeVehicles !== 'undefined') {
            let fg = this.generateFeatureGroup(data.vehicles, this.freeVehicles);
            featureGroups[this.freeVehicles.layerName] = fg[0];
            this.freeVehicles.hideDefault = fg[1];
        }
        if (this.hubs !== undefined) {
            let fg = this.generateFeatureGroup(data.stations, this.hubs);
            featureGroups[this.hubs.layerName] = fg[0];
            this.hubs.hideDefault = fg[1];
        }
        return featureGroups;
    }

    loadData() {
        return this.getUrls().then(gbfsUrls => {

            let promises = [];

            if (typeof gbfsUrls.free_status !== 'undefined') {
                promises.push(getUrl(gbfsUrls.free_status, this.urlParams).then(response => response.data.bikes));
            } else {
                promises.push(Promise.resolve({}));
            }

            if (typeof gbfsUrls.station_info !== 'undefined') {
                promises.push(getUrl(gbfsUrls.station_info, this.urlParams).then(response => response.data.stations));
            } else {
                promises.push(Promise.resolve({}));
            }

            if (typeof gbfsUrls.station_status !== 'undefined') {
                promises.push(getUrl(gbfsUrls.station_status, this.urlParams).then(response => response.data.stations));
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
    console.log(obj);
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

/**
 * Converts Array of JSON Objects into HTML with keys bolded and followed with a colon.
 * @param {Object[]} objects Array of JSON objects representing keys and values
 */
export function toPopupDisplay(objects) {
    let str = "";

    for (let obj in objects) {
        for (let l in objects[obj]) {
            str += "<strong>" + l + ":</strong> " + objects[obj][l].toString().replace(/,/g, ", ") + "<br />";
        }
    }
    return str;
}

function getUrl(url, urlParams) {
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
            xmlhttp.open("GET", url + urlParams, true);
            xmlhttp.send();
        });
    }
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

export function dissolve(json) {

    let toWrite = [];

    for (let i in json) {
        let toAdd = [function () {
            switch (i) {
                case "id":
                    return {"ID": json[i]};
                case "lat":
                    return {"Latitude": precise_round(parseFloat(json[i]), 3)};
                case "lon":
                    return {"Longitude": precise_round(parseFloat(json[i]), 3)};
                case "name":
                    return {"Name": json[i]};
                case "num_docks_available":
                    return {"Available Docks": json[i]};
                case "num_bikes_available":
                    return {"Available Bikes": json[i]};
                case "info":
                case "status":
                    return dissolve(json[i]);
                default:
                    let o = {};
                    o[i] = json[i];
                    return o;
            }
        }()];

        toWrite = toAdd.flat().concat(toWrite);
    }
    return toWrite.sort((a, b) => {
        return getRank(Object.keys(a)[0]) >= getRank(Object.keys(b)[0]);
    });
}

function getRank(str) {
    switch (str) {
        case "Name":
            return 1;
        case "Available Bikes":
            return 2;
        case "Available Docks":
            return 3;
        case "ID":
            return 4;
        case "Latitude":
            return 5;
        case "Longitude":
            return 6;
        default:
            return 10;
    }

}