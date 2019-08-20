
var feeds;
let basemaps = function () {
    var out = {};
    for (mapName in options.basemaps) {
        out[mapName] = L.tileLayer(options.basemaps[mapName].url, options.basemaps[mapName].opts);
    }
    return out;
}();
var feedLayers = {};
var layersControl = L.control.layers(basemaps, feedLayers, { collapsed: false });

var gbfsMap = L.map('gbfsMap', {
    layers: Object.values(basemaps)
});

// Create the Leaflet layerControl object

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

let custom = new customButtons();

custom.addTo(gbfsMap);

if (options.zones != undefined) {
    var zoneOptions = {
        fillOpacity: 0.05
    };

    if (options.zonesColor != undefined) {
        zoneOptions.color = options.zonesColor
        zoneOptions.fillColor = options.zonesColor
    }
}

let systemZones = L.geoJSON(options.zones, zoneOptions);

(function () {
    if (options.popupZone == true) {
        return systemZones.bindPopup(function (layer) {
            return options.zonePopupTitle + layer.feature.properties.zone;
        })
    }
    else {
        return systemZones
    }
})().addTo(gbfsMap);

class Feed {
    constructor(url, name, displayOpts, hubs) {
        this.url = url;
        this.name = name;
        this.hubs = hubs;
        this.featureGroup = L.featureGroup([]);
        this.vehicles = [];
        this.displayOpts = displayOpts;
        this.isVisable = false;

        this.watch();
    }

    watch() {
        loadGBFS(this.url).then(available => {
            var gbfsUrls = available;
            this.featureGroup.addTo(gbfsMap);
            // this.reportedName = extractFromUrl(['data', 'name'], gbfsUrls.sysinfo);

            parseAvailable(gbfsUrls.free_status).then(available => {
                for (var v in available) {
                    this.vehicles[v] = available[v];

                    addLayerToGroup(this.featureGroup, this.vehicles[v], this.displayOpts, this.name);
                }
                feedLayers[this.name] = this.featureGroup;
                if (!this.isVisable) {
                    addLayerToControl(this.name);
                    this.isVisable = true;
                }
            });

            if (this.hubs != undefined && this.hubs != false) {
                parseHubInfo(gbfsUrls.station_info).then(recieved => {

                    var stations = {};

                    for (var r in recieved) {
                        stations[recieved[r].station_id] = new Station(recieved[r])
                    }

                    parseHubInfo(gbfsUrls.station_status).then(current => {
                        for (var s in current) {
                            var status = current[s];
                            if (stations[status.station_id] != undefined) {
                                stations[status.station_id].status = status;
                            }
                        }

                        var hubLayerGroup = L.featureGroup([]);

                        for (var s in stations) {

                            var station = stations[s]

                            if (this.hubs.popup) {
                                hubLayerGroup.addLayer(
                                    display(station, this.hubs.display)
                                        .bindPopup(
                                            toPopupDisplay([
                                                {
                                                    "Station Name": station.name,
                                                    "Station ID": station.id,
                                                    "Latitude": precise_round(station.lat, 3),
                                                    "Longitude": precise_round(station.lon, 3)
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

                        feedLayers[this.hubs.layerName] = hubLayerGroup;

                        feedLayers[this.hubs.layerName].addTo(gbfsMap);

                        addLayerToControl(this.hubs.layerName);

                        if (this.hubs.hideDefault) {
                            feedLayers[this.hubs.layerName].removeFrom(gbfsMap);
                        }
                    })

                })
            }

        });
    }

}

class Station {
    constructor(info) {
        this.id;
        this.name;
        this.lat;
        this.lon;
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
}

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

function parseHubInfo(url) {
    return new Promise(resolve => {
        parseFile(url).then(data => {

            var stations = data.stations

            resolve(stations);
        })
    });
}

function parseAvailable(specificUrl) {
    return new Promise(resolve => {
        parseFile(specificUrl).then(data => {

            var available = data.bikes

            var vehicles = {};

            for (var r in available) {
                var i = available[r];
                vehicles[r] = new Vehicle(i, "dunno");
            }

            resolve(vehicles);
        })
    });
}

function toPopupDisplay(objs) {
    var str = "";

    for (obj in objs) {
        for (l in objs[obj]) {
            str += "<strong>" + l + ":</strong> " + objs[obj][l] + "<br />";
        }
    }
    return str;
}

function precise_round(num, dec) {

    if ((typeof num !== 'number') || (typeof dec !== 'number'))
        return false;

    var num_sign = num >= 0 ? 1 : -1;

    return (Math.round((num * Math.pow(10, dec)) + (num_sign * 0.0001)) / Math.pow(10, dec)).toFixed(dec);
}

function addLayerToGroup(featureGroup, vehicleToAdd, feedDisplayOpts, operator) {
    if (options.popupVehicle == true) {
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
        featureGroup.addLayer(vehicleToAdd.display(feedDisplayOpts));
    }
}

class Vehicle {
    constructor(json) {

        var arr = [];
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
                    arr[i] = json[i];
                    break;
            }
        }

        this.misc = arr;
    }
}

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

function createFeeds(specified) {

    var feeds = [];

    for (f in specified) {
        var feedToAdd = specified[f];
        feeds.push(new Feed(feedToAdd.url, feedToAdd.feed_name, feedToAdd.display, feedToAdd.hubs));
    }

    return feeds;
}



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

function loadGBFS(base) {
    return new Promise(resolve => {
        var xmlhttp = new XMLHttpRequest();

        // var parsedFeedURLs;
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response = JSON.parse(this.responseText);
                resolve(parseFeeds(response.data.en.feeds, files));
            }
        };
        xmlhttp.open("GET", base + "gbfs.json", true);
        xmlhttp.send();
    });
}

function extractFromUrl(field, url) {
    return new Promise(resolve => {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response = JSON.parse(this.responseText);
                resolve(extract(field, response))
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    });
}

function extract(field, from) {
    if (field.length == 1) {
        from[field[0]];
    }
    else {
        var drill = field.shift();
        extract(field, from[drill]);
    }
}

function openModal() {
    document.getElementById("modal-container").style.display = "";
}

function closeModal() {
    document.getElementById("modal-container").style.display = "none";
}

var loading = false;

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

load();
