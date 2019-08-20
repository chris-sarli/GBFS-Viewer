
let files = {
    'sysinfo': 'system_information',
    'free_status': 'free_bike_status'
};

var tileBasemapsToInclude = {
    // 
    "ESRI World Imagery": {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        opts: {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
    },
    "Rhode Island Aerial Photographs (1951-1952)": {
        url: 'https://tiles.arcgis.com/tiles/S8zZg9pg23JUEexQ/arcgis/rest/services/atlas_img_1951_1952/MapServer/tile/{z}/{y}/{x}',
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
    },
    "CartoDB Voyager": {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        opts: {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }
    }
}

let feedsToInclude = [
    {
        url: "https://pvd.jumpbikes.com/opendata/",
        feed_name: "JUMP",
        display: {
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
    {
        url: "https://mds.bird.co/gbfs/providence/",
        feed_name: "Bird",
        display: {
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
    },
    {
        url: "https://data.lime.bike/api/partners/v1/gbfs/providence/",
        feed_name: "Lime",
        display: {
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
    }];

let options = {
    "bounds": [[41.7633, -71.568], [41.8710, -71.281]],
    "files": files,
    "basemaps": tileBasemapsToInclude,
    "feeds": feedsToInclude,
    "popupVehicle": true,
    "vehiclePopupTitle": "<strong>Vehicle ID:</strong> ",
    "popupZone": true,
    "zonePopupTitle": "<strong>Zone:</strong> ",
    "zonePopupGeoJsonField": "zone",
    "zones": zones,
    "zonesColor": "#e56f00"
}