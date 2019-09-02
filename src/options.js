const isos = require('json-loader!./isochrones.geojson');
const zones = require('json-loader!./zones.geojson');


let files = {
    'sysinfo': 'system_information',
    'free_status': 'free_bike_status',
    'station_info': 'station_information',
    'station_status': 'station_status'
};

let tileBasemapsToInclude = {
    // "ESRI World Imagery": {
    //     url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    //     opts: {
    //         attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    //     }
    // },
    // "Rhode Island Aerial Photographs (1951-1952)": {
    //     url: 'https://tiles.arcgis.com/tiles/S8zZg9pg23JUEexQ/arcgis/rest/services/atlas_img_1951_1952/MapServer/tile/{z}/{y}/{x}',
    //     opts: {
    //         attribution: '<a href="https://www.edc.uri.edu">URI EDC</a>, <a href="http://www.rigis.org">RIGIS</a>'
    //     }
    // },
    "Rhode Island Aerial Photographs (2011)": {
        url: 'https://tiles.arcgis.com/tiles/S8zZg9pg23JUEexQ/arcgis/rest/services/atlas_img_2011/MapServer/tile/{z}/{y}/{x}',
        opts: {
            attribution: '<a href="https://www.edc.uri.edu">URI EDC</a>, <a href="http://www.rigis.org">RIGIS</a>'
        }
    },
    "ESRI Gray": {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        opts: {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            maxZoom: 16
        }
    }
    // "CartoDB Dark": {
    //     url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    //     opts: {
    //         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    //         subdomains: 'abcd',
    //         maxZoom: 19
    //     }
    // },
    // "CartoDB Voyager": {
    //     url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    //     opts: {
    //         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    //         subdomains: 'abcd',
    //         maxZoom: 19
    //     }
    // }
}

let feedsToInclude = [
    {
        url: "https://pvd.jumpbikes.com/opendata/",
        feed_name: "JUMP",
        freeVehicles: {
            layerName: "JUMP",
            popup: true,
            hideDefault: false,
            displayOpts: {
                type: "circle",
                options: {
                    radius: 5,
                    color: "#FFFFFF",
                    fillColor: "#FF0A2D",
                    fillOpacity: 0.9,
                    opacity: 0.9,
                    weight: 2
                }
            }
        },
        hubs: {
            layerName: "JUMP Stations",
            popup: true,
            hideDefault: true,
            displayOpts: {
                type: "circle",
                options: {
                    radius: 7,
                    color: "#FF0A2D",
                    fillColor: "white",
                    fillOpacity: 0,
                    opacity: 1,
                    weight: 3
                }
            }
        }
    },
    {
        url: "https://mds.bird.co/gbfs/providence/",
        feed_name: "Bird",
        freeVehicles: {
            layerName: "Bird",
            popup: true,
            hideDefault: false,
            displayOpts: {
                type: "circle",
                options: {
                    radius: 5,
                    color: "#FFFFFF",
                    fillColor: "#121212",
                    fillOpacity: 0.9,
                    opacity: 0.9,
                    weight: 2
                }
            }
        }
    },
    {
        url: "https://data.lime.bike/api/partners/v1/gbfs/providence/",
        feed_name: "Lime",
        freeVehicles: {
            layerName: "Lime",
            popup: true,
            hideDefault: false,
            displayOpts: {
                type: "circle",
                options: {
                    radius: 5,
                    color: "#FFFFFF",
                    fillColor: "#45D700",
                    fillOpacity: 0.9,
                    opacity: 0.9,
                    weight: 2
                }
            }
        }
    }];



export let options = {
    mapObject: 'gbfsMap',
    bounds: [[41.7703, -71.4777], [41.8648, -71.3706]],
    files: files,
    basemaps: tileBasemapsToInclude,
    feeds: feedsToInclude,
    isochrones: isos,
    zones: {
        data: zones,
        popup: {
            title: "<strong>Zone:</strong> ",
            geoJsonField: "zone",
        },
        display: {
            color: "#e56f00",
            fillColor: "#e56f00",
            fillOpacity: 0.05
        }
    }

}