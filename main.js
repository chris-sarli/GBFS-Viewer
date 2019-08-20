
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
    constructor(url, name, displayOpts) {
        this.url = url;
        this.name = name;
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

            this.parseAvailable(gbfsUrls.free_status).then(available => {
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
        });
    }

    parseAvailable(specificUrl) {
        return new Promise(resolve => {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    var response = JSON.parse(this.responseText);

                    var available = response.data.bikes

                    var vehicles = {};

                    for (var r in available) {
                        var i = available[r];
                        vehicles[r] = new Vehicle(i, "dunno");
                    }
                    resolve(vehicles);
                }
            };

            xmlhttp.open("GET", specificUrl, true);
            xmlhttp.send();
        })
    }

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
        featureGroup.addLayer(vehicleToAdd.display(feedDisplayOpts).bindPopup(
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
    constructor(json, operator) {

        this.operator = operator;

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

    display(displayOpts) {
        switch (displayOpts.type) {
            case "icon":
                return L.marker([this.lat, this.lon], displayOpts.options);
                break;
            case "circle":
                return L.circleMarker([this.lat, this.lon], displayOpts.options);
                break;
        }

        return L.circleMarker([this.lat, this.lon], {
            radius: 5,
            color: "#FFFFFF",
            fillColor: "#FF0A2D",
            fillOpacity: 0.9,
            opacity: 0.9
        })
    }
}

function createFeeds(specified) {

    var feeds = [];

    for (f in specified) {
        var feedToAdd = specified[f];
        feeds.push(new Feed(feedToAdd.url, feedToAdd.feed_name, feedToAdd.display));
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
