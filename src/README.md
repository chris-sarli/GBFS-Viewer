# GBFS Viewer

GBFS Viewer is a simple tool for viewing the realtime status of several [GBFS](https://github.com/NABSA/gbfs) Feeds. It isn't terribly fancy, and relies almost entirely on [Leaflet](https://leafletjs.com).

The files here are a demo for GBFS feeds in Providence, Rhode Island. Currently, the code is a bit messy and some of the JavaScript is used for UI purposes. In the future, functionality will be more clearly isolated.

## index.html

This contains a map `<div>` for Leaflet, a simple loading overlay, and a modal.

## main.js

main.js contains the bulk of the tool. All classes and functions have been combined into this one file. If the contents were simply included in `<script>` tags (and CSS moved inline), the whole tool could easily be contained in a single HTML file.

## zones.geojson

Right now, this file simply assigns a large chunk of GeoJSON to a variable which is used in main.js. Ideally, this can be imported.

## options.js

This file's purpose is to provide an options object.

| Field Name | Required | Description                                                                                                                                                                                                                                                        |
|------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| mapObject  | Yes      | The id of the `<div>` used for the Leaflet map.                                                                                                                                                                                                                    |
| bounds     | Yes      | The initial bounds to be used for the map. Provided as a 2-item array of L.latLng objects. See [Leaflet reference.](https://leafletjs.com/reference-1.5.0.html#latlngbounds)                                                                                       |
| files      | Yes      | The filename of the path stored within each field of `gbfsUrls`. <br /> For example, if `files["sysinfo"]` =  `"system_information"`, then the URL for "system_information.json" will be accessible via `gbfsUrls.sysinfo`.                                        |
| basemaps   | Yes      | An Object referencing a basemaps to make available. Keys represent user-facing base-layer names. Values are objects with a `url` and an `opts` Object which is the options object for a [Leaflet tileLayer](https://leafletjs.com/reference-1.5.0.html#tilelayer). |
| feeds      | Yes      | An array of [feed specifiers](#Feeds).                                                                                                                                                                                                                             |
| vehicle    | Optional | If included, is an Object with `vehcile.popup` = `true`, indicating that vehicle markers should be bound to [Leaflet popups](https://leafletjs.com/reference-1.5.0.html#popup).                                                                                    |
| zones      | Optional | See [Zones](#Zones).                                                                                                                                                                                                                                               |

### Feeds

Each OldFeed is specified with an Object of the following construction:

| Field     | Required | Description                                                                           |
|-----------|----------|---------------------------------------------------------------------------------------|
| url       | Yes      | The base URL of the GBFS OldFeed. The gbfs.json file should reside in this directory.    |
| feed_name | Yes      | The user-facing name of this feed, specifically the free, undocked vehicles reported. |
| hubs      | Optional | See [Hubs](#Hubs).                                                                    |
| Display   | Yes      | See [Display](#Display).                                                              |

#### Hubs

The inclusion of the hubs object indicates that the stations/hubs reported in station_information.json and station_status.json should be surfaced as layers in this tool. The hubs object has the following fields:

| Field       | Required | Description                                                                                                                                                             |
|-------------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| layerName   | Yes      | The user-facing name to be displayed for the station layer.                                                                                                             |
| popup       | Optional | Indicates whether a popup should be bound to each marker. Popups will report all information from station_information.json and station_status.json for a given station. |
| hideDefault | Optional | When true, will hide the station layer by default.                                                                                                                      |
| display     | Yes      | See [Display](#Display).                                                                                                                                                |

#### Display


| Field   | Required | Description                                                                                                                                                                                                                                                 |
|---------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type    | Yes      | Either "circle", indicating that each item should be represented by a [L.circleMarker](https://leafletjs.com/reference-1.5.0.html#circlemarker), or "icon", indicating that a [L.marker](https://leafletjs.com/reference-1.5.0.html#marker) should be used. |
| options | Yes      | The Leaflet options object that will be passed to the marker indicated by `type`.                                                                                                                                                                           |

### Zones

Optionally, this tool can display [GeoJSON](https://geojson.org) shapes as "zones" of a service area on the map. If the `zones` object is included in options.js, zones will be displayed. These are the fields of the `zones` object:

| Field   | Required | Description                                                                                                                                                                                                                                                                                                                         |
|---------|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| data    | Yes      | The GeoJSON Object.                                                                                                                                                                                                                                                                                                                 |
| popup   | Optional | An optional object which, when included, indicates that popups will be bound to the zone polygons. If included, there are two required fields: <br /> `title`: a string that will serve as the label for the popup. <br /> `geoJsonField`: a string indicating the field name in the GeoJSON shapes that will be used in the popup. |
| display | Optional | An optional Leaflet options object that will be applied to each zone.                                                                                                                                                                                                                                                               |
