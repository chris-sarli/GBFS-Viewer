/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@turf/boolean-point-in-polygon/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/@turf/boolean-point-in-polygon/index.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var invariant_1 = __webpack_require__(/*! @turf/invariant */ "./node_modules/@turf/invariant/index.js");
// http://en.wikipedia.org/wiki/Even%E2%80%93odd_rule
// modified from: https://github.com/substack/point-in-polygon/blob/master/index.js
// which was modified from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
/**
 * Takes a {@link Point} and a {@link Polygon} or {@link MultiPolygon} and determines if the point
 * resides inside the polygon. The polygon can be convex or concave. The function accounts for holes.
 *
 * @name booleanPointInPolygon
 * @param {Coord} point input point
 * @param {Feature<Polygon|MultiPolygon>} polygon input polygon or multipolygon
 * @param {Object} [options={}] Optional parameters
 * @param {boolean} [options.ignoreBoundary=false] True if polygon boundary should be ignored when determining if
 * the point is inside the polygon otherwise false.
 * @returns {boolean} `true` if the Point is inside the Polygon; `false` if the Point is not inside the Polygon
 * @example
 * var pt = turf.point([-77, 44]);
 * var poly = turf.polygon([[
 *   [-81, 41],
 *   [-81, 47],
 *   [-72, 47],
 *   [-72, 41],
 *   [-81, 41]
 * ]]);
 *
 * turf.booleanPointInPolygon(pt, poly);
 * //= true
 */
function booleanPointInPolygon(point, polygon, options) {
    if (options === void 0) { options = {}; }
    // validation
    if (!point) {
        throw new Error("point is required");
    }
    if (!polygon) {
        throw new Error("polygon is required");
    }
    var pt = invariant_1.getCoord(point);
    var geom = invariant_1.getGeom(polygon);
    var type = geom.type;
    var bbox = polygon.bbox;
    var polys = geom.coordinates;
    // Quick elimination if point is not inside bbox
    if (bbox && inBBox(pt, bbox) === false) {
        return false;
    }
    // normalize to multipolygon
    if (type === "Polygon") {
        polys = [polys];
    }
    var insidePoly = false;
    for (var i = 0; i < polys.length && !insidePoly; i++) {
        // check if it is in the outer ring first
        if (inRing(pt, polys[i][0], options.ignoreBoundary)) {
            var inHole = false;
            var k = 1;
            // check for the point in any of the holes
            while (k < polys[i].length && !inHole) {
                if (inRing(pt, polys[i][k], !options.ignoreBoundary)) {
                    inHole = true;
                }
                k++;
            }
            if (!inHole) {
                insidePoly = true;
            }
        }
    }
    return insidePoly;
}
exports.default = booleanPointInPolygon;
/**
 * inRing
 *
 * @private
 * @param {Array<number>} pt [x,y]
 * @param {Array<Array<number>>} ring [[x,y], [x,y],..]
 * @param {boolean} ignoreBoundary ignoreBoundary
 * @returns {boolean} inRing
 */
function inRing(pt, ring, ignoreBoundary) {
    var isInside = false;
    if (ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) {
        ring = ring.slice(0, ring.length - 1);
    }
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        var xi = ring[i][0];
        var yi = ring[i][1];
        var xj = ring[j][0];
        var yj = ring[j][1];
        var onBoundary = (pt[1] * (xi - xj) + yi * (xj - pt[0]) + yj * (pt[0] - xi) === 0) &&
            ((xi - pt[0]) * (xj - pt[0]) <= 0) && ((yi - pt[1]) * (yj - pt[1]) <= 0);
        if (onBoundary) {
            return !ignoreBoundary;
        }
        var intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
            (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
        if (intersect) {
            isInside = !isInside;
        }
    }
    return isInside;
}
/**
 * inBBox
 *
 * @private
 * @param {Position} pt point [x,y]
 * @param {BBox} bbox BBox [west, south, east, north]
 * @returns {boolean} true/false if point is inside BBox
 */
function inBBox(pt, bbox) {
    return bbox[0] <= pt[0] &&
        bbox[1] <= pt[1] &&
        bbox[2] >= pt[0] &&
        bbox[3] >= pt[1];
}


/***/ }),

/***/ "./node_modules/@turf/helpers/index.js":
/*!*********************************************!*\
  !*** ./node_modules/@turf/helpers/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module helpers
 */
/**
 * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
 *
 * @memberof helpers
 * @type {number}
 */
exports.earthRadius = 6371008.8;
/**
 * Unit of measurement factors using a spherical (non-ellipsoid) earth radius.
 *
 * @memberof helpers
 * @type {Object}
 */
exports.factors = {
    centimeters: exports.earthRadius * 100,
    centimetres: exports.earthRadius * 100,
    degrees: exports.earthRadius / 111325,
    feet: exports.earthRadius * 3.28084,
    inches: exports.earthRadius * 39.370,
    kilometers: exports.earthRadius / 1000,
    kilometres: exports.earthRadius / 1000,
    meters: exports.earthRadius,
    metres: exports.earthRadius,
    miles: exports.earthRadius / 1609.344,
    millimeters: exports.earthRadius * 1000,
    millimetres: exports.earthRadius * 1000,
    nauticalmiles: exports.earthRadius / 1852,
    radians: 1,
    yards: exports.earthRadius / 1.0936,
};
/**
 * Units of measurement factors based on 1 meter.
 *
 * @memberof helpers
 * @type {Object}
 */
exports.unitsFactors = {
    centimeters: 100,
    centimetres: 100,
    degrees: 1 / 111325,
    feet: 3.28084,
    inches: 39.370,
    kilometers: 1 / 1000,
    kilometres: 1 / 1000,
    meters: 1,
    metres: 1,
    miles: 1 / 1609.344,
    millimeters: 1000,
    millimetres: 1000,
    nauticalmiles: 1 / 1852,
    radians: 1 / exports.earthRadius,
    yards: 1 / 1.0936,
};
/**
 * Area of measurement factors based on 1 square meter.
 *
 * @memberof helpers
 * @type {Object}
 */
exports.areaFactors = {
    acres: 0.000247105,
    centimeters: 10000,
    centimetres: 10000,
    feet: 10.763910417,
    inches: 1550.003100006,
    kilometers: 0.000001,
    kilometres: 0.000001,
    meters: 1,
    metres: 1,
    miles: 3.86e-7,
    millimeters: 1000000,
    millimetres: 1000000,
    yards: 1.195990046,
};
/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature} a GeoJSON Feature
 * @example
 * var geometry = {
 *   "type": "Point",
 *   "coordinates": [110, 50]
 * };
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */
function feature(geom, properties, options) {
    if (options === void 0) { options = {}; }
    var feat = { type: "Feature" };
    if (options.id === 0 || options.id) {
        feat.id = options.id;
    }
    if (options.bbox) {
        feat.bbox = options.bbox;
    }
    feat.properties = properties || {};
    feat.geometry = geom;
    return feat;
}
exports.feature = feature;
/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<any>} coordinates Coordinates
 * @param {Object} [options={}] Optional Parameters
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * var type = "Point";
 * var coordinates = [110, 50];
 * var geometry = turf.geometry(type, coordinates);
 * // => geometry
 */
function geometry(type, coordinates, options) {
    if (options === void 0) { options = {}; }
    switch (type) {
        case "Point": return point(coordinates).geometry;
        case "LineString": return lineString(coordinates).geometry;
        case "Polygon": return polygon(coordinates).geometry;
        case "MultiPoint": return multiPoint(coordinates).geometry;
        case "MultiLineString": return multiLineString(coordinates).geometry;
        case "MultiPolygon": return multiPolygon(coordinates).geometry;
        default: throw new Error(type + " is invalid");
    }
}
exports.geometry = geometry;
/**
 * Creates a {@link Point} {@link Feature} from a Position.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Point>} a Point feature
 * @example
 * var point = turf.point([-75.343, 39.984]);
 *
 * //=point
 */
function point(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "Point",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.point = point;
/**
 * Creates a {@link Point} {@link FeatureCollection} from an Array of Point coordinates.
 *
 * @name points
 * @param {Array<Array<number>>} coordinates an array of Points
 * @param {Object} [properties={}] Translate these properties to each Feature
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
 * associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Point>} Point Feature
 * @example
 * var points = turf.points([
 *   [-75, 39],
 *   [-80, 45],
 *   [-78, 50]
 * ]);
 *
 * //=points
 */
function points(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return point(coords, properties);
    }), options);
}
exports.points = points;
/**
 * Creates a {@link Polygon} {@link Feature} from an Array of LinearRings.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Polygon>} Polygon Feature
 * @example
 * var polygon = turf.polygon([[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]], { name: 'poly1' });
 *
 * //=polygon
 */
function polygon(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    for (var _i = 0, coordinates_1 = coordinates; _i < coordinates_1.length; _i++) {
        var ring = coordinates_1[_i];
        if (ring.length < 4) {
            throw new Error("Each LinearRing of a Polygon must have 4 or more Positions.");
        }
        for (var j = 0; j < ring[ring.length - 1].length; j++) {
            // Check if first point of Polygon contains two numbers
            if (ring[ring.length - 1][j] !== ring[0][j]) {
                throw new Error("First and last Position are not equivalent.");
            }
        }
    }
    var geom = {
        type: "Polygon",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.polygon = polygon;
/**
 * Creates a {@link Polygon} {@link FeatureCollection} from an Array of Polygon coordinates.
 *
 * @name polygons
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygon coordinates
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Polygon>} Polygon FeatureCollection
 * @example
 * var polygons = turf.polygons([
 *   [[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]],
 *   [[[-15, 42], [-14, 46], [-12, 41], [-17, 44], [-15, 42]]],
 * ]);
 *
 * //=polygons
 */
function polygons(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return polygon(coords, properties);
    }), options);
}
exports.polygons = polygons;
/**
 * Creates a {@link LineString} {@link Feature} from an Array of Positions.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<LineString>} LineString Feature
 * @example
 * var linestring1 = turf.lineString([[-24, 63], [-23, 60], [-25, 65], [-20, 69]], {name: 'line 1'});
 * var linestring2 = turf.lineString([[-14, 43], [-13, 40], [-15, 45], [-10, 49]], {name: 'line 2'});
 *
 * //=linestring1
 * //=linestring2
 */
function lineString(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    if (coordinates.length < 2) {
        throw new Error("coordinates must be an array of two or more positions");
    }
    var geom = {
        type: "LineString",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.lineString = lineString;
/**
 * Creates a {@link LineString} {@link FeatureCollection} from an Array of LineString coordinates.
 *
 * @name lineStrings
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
 * associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<LineString>} LineString FeatureCollection
 * @example
 * var linestrings = turf.lineStrings([
 *   [[-24, 63], [-23, 60], [-25, 65], [-20, 69]],
 *   [[-14, 43], [-13, 40], [-15, 45], [-10, 49]]
 * ]);
 *
 * //=linestrings
 */
function lineStrings(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return lineString(coords, properties);
    }), options);
}
exports.lineStrings = lineStrings;
/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {FeatureCollection} FeatureCollection of Features
 * @example
 * var locationA = turf.point([-75.343, 39.984], {name: 'Location A'});
 * var locationB = turf.point([-75.833, 39.284], {name: 'Location B'});
 * var locationC = turf.point([-75.534, 39.123], {name: 'Location C'});
 *
 * var collection = turf.featureCollection([
 *   locationA,
 *   locationB,
 *   locationC
 * ]);
 *
 * //=collection
 */
function featureCollection(features, options) {
    if (options === void 0) { options = {}; }
    var fc = { type: "FeatureCollection" };
    if (options.id) {
        fc.id = options.id;
    }
    if (options.bbox) {
        fc.bbox = options.bbox;
    }
    fc.features = features;
    return fc;
}
exports.featureCollection = featureCollection;
/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 */
function multiLineString(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiLineString",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.multiLineString = multiLineString;
/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 */
function multiPoint(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiPoint",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.multiPoint = multiPoint;
/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
function multiPolygon(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiPolygon",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
exports.multiPolygon = multiPolygon;
/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * var pt = turf.geometry("Point", [100, 0]);
 * var line = turf.geometry("LineString", [[101, 0], [102, 1]]);
 * var collection = turf.geometryCollection([pt, line]);
 *
 * // => collection
 */
function geometryCollection(geometries, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "GeometryCollection",
        geometries: geometries,
    };
    return feature(geom, properties, options);
}
exports.geometryCollection = geometryCollection;
/**
 * Round number to precision
 *
 * @param {number} num Number
 * @param {number} [precision=0] Precision
 * @returns {number} rounded number
 * @example
 * turf.round(120.4321)
 * //=120
 *
 * turf.round(120.4321, 2)
 * //=120.43
 */
function round(num, precision) {
    if (precision === void 0) { precision = 0; }
    if (precision && !(precision >= 0)) {
        throw new Error("precision must be a positive number");
    }
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(num * multiplier) / multiplier;
}
exports.round = round;
/**
 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name radiansToLength
 * @param {number} radians in radians across the sphere
 * @param {string} [units="kilometers"] can be degrees, radians, miles, or kilometers inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} distance
 */
function radiansToLength(radians, units) {
    if (units === void 0) { units = "kilometers"; }
    var factor = exports.factors[units];
    if (!factor) {
        throw new Error(units + " units is invalid");
    }
    return radians * factor;
}
exports.radiansToLength = radiansToLength;
/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name lengthToRadians
 * @param {number} distance in real units
 * @param {string} [units="kilometers"] can be degrees, radians, miles, or kilometers inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} radians
 */
function lengthToRadians(distance, units) {
    if (units === void 0) { units = "kilometers"; }
    var factor = exports.factors[units];
    if (!factor) {
        throw new Error(units + " units is invalid");
    }
    return distance / factor;
}
exports.lengthToRadians = lengthToRadians;
/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
 *
 * @name lengthToDegrees
 * @param {number} distance in real units
 * @param {string} [units="kilometers"] can be degrees, radians, miles, or kilometers inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} degrees
 */
function lengthToDegrees(distance, units) {
    return radiansToDegrees(lengthToRadians(distance, units));
}
exports.lengthToDegrees = lengthToDegrees;
/**
 * Converts any bearing angle from the north line direction (positive clockwise)
 * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
 *
 * @name bearingToAzimuth
 * @param {number} bearing angle, between -180 and +180 degrees
 * @returns {number} angle between 0 and 360 degrees
 */
function bearingToAzimuth(bearing) {
    var angle = bearing % 360;
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}
exports.bearingToAzimuth = bearingToAzimuth;
/**
 * Converts an angle in radians to degrees
 *
 * @name radiansToDegrees
 * @param {number} radians angle in radians
 * @returns {number} degrees between 0 and 360 degrees
 */
function radiansToDegrees(radians) {
    var degrees = radians % (2 * Math.PI);
    return degrees * 180 / Math.PI;
}
exports.radiansToDegrees = radiansToDegrees;
/**
 * Converts an angle in degrees to radians
 *
 * @name degreesToRadians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 */
function degreesToRadians(degrees) {
    var radians = degrees % 360;
    return radians * Math.PI / 180;
}
exports.degreesToRadians = degreesToRadians;
/**
 * Converts a length to the requested unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @param {number} length to be converted
 * @param {Units} [originalUnit="kilometers"] of the length
 * @param {Units} [finalUnit="kilometers"] returned unit
 * @returns {number} the converted length
 */
function convertLength(length, originalUnit, finalUnit) {
    if (originalUnit === void 0) { originalUnit = "kilometers"; }
    if (finalUnit === void 0) { finalUnit = "kilometers"; }
    if (!(length >= 0)) {
        throw new Error("length must be a positive number");
    }
    return radiansToLength(lengthToRadians(length, originalUnit), finalUnit);
}
exports.convertLength = convertLength;
/**
 * Converts a area to the requested unit.
 * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeters, acres, miles, yards, feet, inches
 * @param {number} area to be converted
 * @param {Units} [originalUnit="meters"] of the distance
 * @param {Units} [finalUnit="kilometers"] returned unit
 * @returns {number} the converted distance
 */
function convertArea(area, originalUnit, finalUnit) {
    if (originalUnit === void 0) { originalUnit = "meters"; }
    if (finalUnit === void 0) { finalUnit = "kilometers"; }
    if (!(area >= 0)) {
        throw new Error("area must be a positive number");
    }
    var startFactor = exports.areaFactors[originalUnit];
    if (!startFactor) {
        throw new Error("invalid original units");
    }
    var finalFactor = exports.areaFactors[finalUnit];
    if (!finalFactor) {
        throw new Error("invalid final units");
    }
    return (area / startFactor) * finalFactor;
}
exports.convertArea = convertArea;
/**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * turf.isNumber(123)
 * //=true
 * turf.isNumber('foo')
 * //=false
 */
function isNumber(num) {
    return !isNaN(num) && num !== null && !Array.isArray(num) && !/^\s*$/.test(num);
}
exports.isNumber = isNumber;
/**
 * isObject
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 * @example
 * turf.isObject({elevation: 10})
 * //=true
 * turf.isObject('foo')
 * //=false
 */
function isObject(input) {
    return (!!input) && (input.constructor === Object);
}
exports.isObject = isObject;
/**
 * Validate BBox
 *
 * @private
 * @param {Array<number>} bbox BBox to validate
 * @returns {void}
 * @throws Error if BBox is not valid
 * @example
 * validateBBox([-180, -40, 110, 50])
 * //=OK
 * validateBBox([-180, -40])
 * //=Error
 * validateBBox('Foo')
 * //=Error
 * validateBBox(5)
 * //=Error
 * validateBBox(null)
 * //=Error
 * validateBBox(undefined)
 * //=Error
 */
function validateBBox(bbox) {
    if (!bbox) {
        throw new Error("bbox is required");
    }
    if (!Array.isArray(bbox)) {
        throw new Error("bbox must be an Array");
    }
    if (bbox.length !== 4 && bbox.length !== 6) {
        throw new Error("bbox must be an Array of 4 or 6 numbers");
    }
    bbox.forEach(function (num) {
        if (!isNumber(num)) {
            throw new Error("bbox must only contain numbers");
        }
    });
}
exports.validateBBox = validateBBox;
/**
 * Validate Id
 *
 * @private
 * @param {string|number} id Id to validate
 * @returns {void}
 * @throws Error if Id is not valid
 * @example
 * validateId([-180, -40, 110, 50])
 * //=Error
 * validateId([-180, -40])
 * //=Error
 * validateId('Foo')
 * //=OK
 * validateId(5)
 * //=OK
 * validateId(null)
 * //=Error
 * validateId(undefined)
 * //=Error
 */
function validateId(id) {
    if (!id) {
        throw new Error("id is required");
    }
    if (["string", "number"].indexOf(typeof id) === -1) {
        throw new Error("id must be a number or a string");
    }
}
exports.validateId = validateId;
// Deprecated methods
function radians2degrees() {
    throw new Error("method has been renamed to `radiansToDegrees`");
}
exports.radians2degrees = radians2degrees;
function degrees2radians() {
    throw new Error("method has been renamed to `degreesToRadians`");
}
exports.degrees2radians = degrees2radians;
function distanceToDegrees() {
    throw new Error("method has been renamed to `lengthToDegrees`");
}
exports.distanceToDegrees = distanceToDegrees;
function distanceToRadians() {
    throw new Error("method has been renamed to `lengthToRadians`");
}
exports.distanceToRadians = distanceToRadians;
function radiansToDistance() {
    throw new Error("method has been renamed to `radiansToLength`");
}
exports.radiansToDistance = radiansToDistance;
function bearingToAngle() {
    throw new Error("method has been renamed to `bearingToAzimuth`");
}
exports.bearingToAngle = bearingToAngle;
function convertDistance() {
    throw new Error("method has been renamed to `convertLength`");
}
exports.convertDistance = convertDistance;


/***/ }),

/***/ "./node_modules/@turf/invariant/index.js":
/*!***********************************************!*\
  !*** ./node_modules/@turf/invariant/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = __webpack_require__(/*! @turf/helpers */ "./node_modules/@turf/helpers/index.js");
/**
 * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
 *
 * @name getCoord
 * @param {Array<number>|Geometry<Point>|Feature<Point>} coord GeoJSON Point or an Array of numbers
 * @returns {Array<number>} coordinates
 * @example
 * var pt = turf.point([10, 10]);
 *
 * var coord = turf.getCoord(pt);
 * //= [10, 10]
 */
function getCoord(coord) {
    if (!coord) {
        throw new Error("coord is required");
    }
    if (!Array.isArray(coord)) {
        if (coord.type === "Feature" && coord.geometry !== null && coord.geometry.type === "Point") {
            return coord.geometry.coordinates;
        }
        if (coord.type === "Point") {
            return coord.coordinates;
        }
    }
    if (Array.isArray(coord) && coord.length >= 2 && !Array.isArray(coord[0]) && !Array.isArray(coord[1])) {
        return coord;
    }
    throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
exports.getCoord = getCoord;
/**
 * Unwrap coordinates from a Feature, Geometry Object or an Array
 *
 * @name getCoords
 * @param {Array<any>|Geometry|Feature} coords Feature, Geometry Object or an Array
 * @returns {Array<any>} coordinates
 * @example
 * var poly = turf.polygon([[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]);
 *
 * var coords = turf.getCoords(poly);
 * //= [[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]
 */
function getCoords(coords) {
    if (Array.isArray(coords)) {
        return coords;
    }
    // Feature
    if (coords.type === "Feature") {
        if (coords.geometry !== null) {
            return coords.geometry.coordinates;
        }
    }
    else {
        // Geometry
        if (coords.coordinates) {
            return coords.coordinates;
        }
    }
    throw new Error("coords must be GeoJSON Feature, Geometry Object or an Array");
}
exports.getCoords = getCoords;
/**
 * Checks if coordinates contains a number
 *
 * @name containsNumber
 * @param {Array<any>} coordinates GeoJSON Coordinates
 * @returns {boolean} true if Array contains a number
 */
function containsNumber(coordinates) {
    if (coordinates.length > 1 && helpers_1.isNumber(coordinates[0]) && helpers_1.isNumber(coordinates[1])) {
        return true;
    }
    if (Array.isArray(coordinates[0]) && coordinates[0].length) {
        return containsNumber(coordinates[0]);
    }
    throw new Error("coordinates must only contain numbers");
}
exports.containsNumber = containsNumber;
/**
 * Enforce expectations about types of GeoJSON objects for Turf.
 *
 * @name geojsonType
 * @param {GeoJSON} value any GeoJSON object
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function geojsonType(value, type, name) {
    if (!type || !name) {
        throw new Error("type and name required");
    }
    if (!value || value.type !== type) {
        throw new Error("Invalid input to " + name + ": must be a " + type + ", given " + value.type);
    }
}
exports.geojsonType = geojsonType;
/**
 * Enforce expectations about types of {@link Feature} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name featureOf
 * @param {Feature} feature a feature with an expected geometry type
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} error if value is not the expected type.
 */
function featureOf(feature, type, name) {
    if (!feature) {
        throw new Error("No feature passed");
    }
    if (!name) {
        throw new Error(".featureOf() requires a name");
    }
    if (!feature || feature.type !== "Feature" || !feature.geometry) {
        throw new Error("Invalid input to " + name + ", Feature with geometry required");
    }
    if (!feature.geometry || feature.geometry.type !== type) {
        throw new Error("Invalid input to " + name + ": must be a " + type + ", given " + feature.geometry.type);
    }
}
exports.featureOf = featureOf;
/**
 * Enforce expectations about types of {@link FeatureCollection} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name collectionOf
 * @param {FeatureCollection} featureCollection a FeatureCollection for which features will be judged
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function collectionOf(featureCollection, type, name) {
    if (!featureCollection) {
        throw new Error("No featureCollection passed");
    }
    if (!name) {
        throw new Error(".collectionOf() requires a name");
    }
    if (!featureCollection || featureCollection.type !== "FeatureCollection") {
        throw new Error("Invalid input to " + name + ", FeatureCollection required");
    }
    for (var _i = 0, _a = featureCollection.features; _i < _a.length; _i++) {
        var feature = _a[_i];
        if (!feature || feature.type !== "Feature" || !feature.geometry) {
            throw new Error("Invalid input to " + name + ", Feature with geometry required");
        }
        if (!feature.geometry || feature.geometry.type !== type) {
            throw new Error("Invalid input to " + name + ": must be a " + type + ", given " + feature.geometry.type);
        }
    }
}
exports.collectionOf = collectionOf;
/**
 * Get Geometry from Feature or Geometry Object
 *
 * @param {Feature|Geometry} geojson GeoJSON Feature or Geometry Object
 * @returns {Geometry|null} GeoJSON Geometry Object
 * @throws {Error} if geojson is not a Feature or Geometry Object
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getGeom(point)
 * //={"type": "Point", "coordinates": [110, 40]}
 */
function getGeom(geojson) {
    if (geojson.type === "Feature") {
        return geojson.geometry;
    }
    return geojson;
}
exports.getGeom = getGeom;
/**
 * Get GeoJSON object's type, Geometry type is prioritize.
 *
 * @param {GeoJSON} geojson GeoJSON object
 * @param {string} [name="geojson"] name of the variable to display in error message
 * @returns {string} GeoJSON type
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getType(point)
 * //="Point"
 */
function getType(geojson, name) {
    if (geojson.type === "FeatureCollection") {
        return "FeatureCollection";
    }
    if (geojson.type === "GeometryCollection") {
        return "GeometryCollection";
    }
    if (geojson.type === "Feature" && geojson.geometry !== null) {
        return geojson.geometry.type;
    }
    return geojson.type;
}
exports.getType = getType;


/***/ }),

/***/ "./node_modules/@turf/meta/index.js":
/*!******************************************!*\
  !*** ./node_modules/@turf/meta/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', { value: true });

var helpers = __webpack_require__(/*! @turf/helpers */ "./node_modules/@turf/helpers/index.js");

/**
 * Callback for coordEach
 *
 * @callback coordEachCallback
 * @param {Array<number>} currentCoord The current coordinate being processed.
 * @param {number} coordIndex The current index of the coordinate being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 */

/**
 * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
 *
 * @name coordEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentCoord, coordIndex, featureIndex, multiFeatureIndex)
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.coordEach(features, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 * });
 */
function coordEach(geojson, callback, excludeWrapCoord) {
    // Handles null Geometry -- Skips this GeoJSON
    if (geojson === null) return;
    var j, k, l, geometry, stopG, coords,
        geometryMaybeCollection,
        wrapShrink = 0,
        coordIndex = 0,
        isGeometryCollection,
        type = geojson.type,
        isFeatureCollection = type === 'FeatureCollection',
        isFeature = type === 'Feature',
        stop = isFeatureCollection ? geojson.features.length : 1;

    // This logic may look a little weird. The reason why it is that way
    // is because it's trying to be fast. GeoJSON supports multiple kinds
    // of objects at its root: FeatureCollection, Features, Geometries.
    // This function has the responsibility of handling all of them, and that
    // means that some of the `for` loops you see below actually just don't apply
    // to certain inputs. For instance, if you give this just a
    // Point geometry, then both loops are short-circuited and all we do
    // is gradually rename the input until it's called 'geometry'.
    //
    // This also aims to allocate as few resources as possible: just a
    // few numbers and booleans, rather than any temporary arrays as would
    // be required with the normalization approach.
    for (var featureIndex = 0; featureIndex < stop; featureIndex++) {
        geometryMaybeCollection = (isFeatureCollection ? geojson.features[featureIndex].geometry :
            (isFeature ? geojson.geometry : geojson));
        isGeometryCollection = (geometryMaybeCollection) ? geometryMaybeCollection.type === 'GeometryCollection' : false;
        stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

        for (var geomIndex = 0; geomIndex < stopG; geomIndex++) {
            var multiFeatureIndex = 0;
            var geometryIndex = 0;
            geometry = isGeometryCollection ?
                geometryMaybeCollection.geometries[geomIndex] : geometryMaybeCollection;

            // Handles null Geometry -- Skips this geometry
            if (geometry === null) continue;
            coords = geometry.coordinates;
            var geomType = geometry.type;

            wrapShrink = (excludeWrapCoord && (geomType === 'Polygon' || geomType === 'MultiPolygon')) ? 1 : 0;

            switch (geomType) {
            case null:
                break;
            case 'Point':
                if (callback(coords, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
                coordIndex++;
                multiFeatureIndex++;
                break;
            case 'LineString':
            case 'MultiPoint':
                for (j = 0; j < coords.length; j++) {
                    if (callback(coords[j], coordIndex, featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
                    coordIndex++;
                    if (geomType === 'MultiPoint') multiFeatureIndex++;
                }
                if (geomType === 'LineString') multiFeatureIndex++;
                break;
            case 'Polygon':
            case 'MultiLineString':
                for (j = 0; j < coords.length; j++) {
                    for (k = 0; k < coords[j].length - wrapShrink; k++) {
                        if (callback(coords[j][k], coordIndex, featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
                        coordIndex++;
                    }
                    if (geomType === 'MultiLineString') multiFeatureIndex++;
                    if (geomType === 'Polygon') geometryIndex++;
                }
                if (geomType === 'Polygon') multiFeatureIndex++;
                break;
            case 'MultiPolygon':
                for (j = 0; j < coords.length; j++) {
                    geometryIndex = 0;
                    for (k = 0; k < coords[j].length; k++) {
                        for (l = 0; l < coords[j][k].length - wrapShrink; l++) {
                            if (callback(coords[j][k][l], coordIndex, featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
                            coordIndex++;
                        }
                        geometryIndex++;
                    }
                    multiFeatureIndex++;
                }
                break;
            case 'GeometryCollection':
                for (j = 0; j < geometry.geometries.length; j++)
                    if (coordEach(geometry.geometries[j], callback, excludeWrapCoord) === false) return false;
                break;
            default:
                throw new Error('Unknown Geometry Type');
            }
        }
    }
}

/**
 * Callback for coordReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback coordReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Array<number>} currentCoord The current coordinate being processed.
 * @param {number} coordIndex The current index of the coordinate being processed.
 * Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 */

/**
 * Reduce coordinates in any GeoJSON object, similar to Array.reduce()
 *
 * @name coordReduce
 * @param {FeatureCollection|Geometry|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentCoord, coordIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.coordReduce(features, function (previousValue, currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=previousValue
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 *   return currentCoord;
 * });
 */
function coordReduce(geojson, callback, initialValue, excludeWrapCoord) {
    var previousValue = initialValue;
    coordEach(geojson, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
        if (coordIndex === 0 && initialValue === undefined) previousValue = currentCoord;
        else previousValue = callback(previousValue, currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex);
    }, excludeWrapCoord);
    return previousValue;
}

/**
 * Callback for propEach
 *
 * @callback propEachCallback
 * @param {Object} currentProperties The current Properties being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Iterate over properties in any GeoJSON object, similar to Array.forEach()
 *
 * @name propEach
 * @param {FeatureCollection|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentProperties, featureIndex)
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.propEach(features, function (currentProperties, featureIndex) {
 *   //=currentProperties
 *   //=featureIndex
 * });
 */
function propEach(geojson, callback) {
    var i;
    switch (geojson.type) {
    case 'FeatureCollection':
        for (i = 0; i < geojson.features.length; i++) {
            if (callback(geojson.features[i].properties, i) === false) break;
        }
        break;
    case 'Feature':
        callback(geojson.properties, 0);
        break;
    }
}


/**
 * Callback for propReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback propReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {*} currentProperties The current Properties being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @name propReduce
 * @param {FeatureCollection|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentProperties, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.propReduce(features, function (previousValue, currentProperties, featureIndex) {
 *   //=previousValue
 *   //=currentProperties
 *   //=featureIndex
 *   return currentProperties
 * });
 */
function propReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    propEach(geojson, function (currentProperties, featureIndex) {
        if (featureIndex === 0 && initialValue === undefined) previousValue = currentProperties;
        else previousValue = callback(previousValue, currentProperties, featureIndex);
    });
    return previousValue;
}

/**
 * Callback for featureEach
 *
 * @callback featureEachCallback
 * @param {Feature<any>} currentFeature The current Feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Iterate over features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name featureEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, featureIndex)
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {foo: 'bar'}),
 *   turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.featureEach(features, function (currentFeature, featureIndex) {
 *   //=currentFeature
 *   //=featureIndex
 * });
 */
function featureEach(geojson, callback) {
    if (geojson.type === 'Feature') {
        callback(geojson, 0);
    } else if (geojson.type === 'FeatureCollection') {
        for (var i = 0; i < geojson.features.length; i++) {
            if (callback(geojson.features[i], i) === false) break;
        }
    }
}

/**
 * Callback for featureReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback featureReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature} currentFeature The current Feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name featureReduce
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.featureReduce(features, function (previousValue, currentFeature, featureIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=featureIndex
 *   return currentFeature
 * });
 */
function featureReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    featureEach(geojson, function (currentFeature, featureIndex) {
        if (featureIndex === 0 && initialValue === undefined) previousValue = currentFeature;
        else previousValue = callback(previousValue, currentFeature, featureIndex);
    });
    return previousValue;
}

/**
 * Get all coordinates from any GeoJSON object.
 *
 * @name coordAll
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @returns {Array<Array<number>>} coordinate position array
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {foo: 'bar'}),
 *   turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * var coords = turf.coordAll(features);
 * //= [[26, 37], [36, 53]]
 */
function coordAll(geojson) {
    var coords = [];
    coordEach(geojson, function (coord) {
        coords.push(coord);
    });
    return coords;
}

/**
 * Callback for geomEach
 *
 * @callback geomEachCallback
 * @param {Geometry} currentGeometry The current Geometry being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {Object} featureProperties The current Feature Properties being processed.
 * @param {Array<number>} featureBBox The current Feature BBox being processed.
 * @param {number|string} featureId The current Feature Id being processed.
 */

/**
 * Iterate over each geometry in any GeoJSON object, similar to Array.forEach()
 *
 * @name geomEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.geomEach(features, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
 *   //=currentGeometry
 *   //=featureIndex
 *   //=featureProperties
 *   //=featureBBox
 *   //=featureId
 * });
 */
function geomEach(geojson, callback) {
    var i, j, g, geometry, stopG,
        geometryMaybeCollection,
        isGeometryCollection,
        featureProperties,
        featureBBox,
        featureId,
        featureIndex = 0,
        isFeatureCollection = geojson.type === 'FeatureCollection',
        isFeature = geojson.type === 'Feature',
        stop = isFeatureCollection ? geojson.features.length : 1;

    // This logic may look a little weird. The reason why it is that way
    // is because it's trying to be fast. GeoJSON supports multiple kinds
    // of objects at its root: FeatureCollection, Features, Geometries.
    // This function has the responsibility of handling all of them, and that
    // means that some of the `for` loops you see below actually just don't apply
    // to certain inputs. For instance, if you give this just a
    // Point geometry, then both loops are short-circuited and all we do
    // is gradually rename the input until it's called 'geometry'.
    //
    // This also aims to allocate as few resources as possible: just a
    // few numbers and booleans, rather than any temporary arrays as would
    // be required with the normalization approach.
    for (i = 0; i < stop; i++) {

        geometryMaybeCollection = (isFeatureCollection ? geojson.features[i].geometry :
            (isFeature ? geojson.geometry : geojson));
        featureProperties = (isFeatureCollection ? geojson.features[i].properties :
            (isFeature ? geojson.properties : {}));
        featureBBox = (isFeatureCollection ? geojson.features[i].bbox :
            (isFeature ? geojson.bbox : undefined));
        featureId = (isFeatureCollection ? geojson.features[i].id :
            (isFeature ? geojson.id : undefined));
        isGeometryCollection = (geometryMaybeCollection) ? geometryMaybeCollection.type === 'GeometryCollection' : false;
        stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

        for (g = 0; g < stopG; g++) {
            geometry = isGeometryCollection ?
                geometryMaybeCollection.geometries[g] : geometryMaybeCollection;

            // Handle null Geometry
            if (geometry === null) {
                if (callback(null, featureIndex, featureProperties, featureBBox, featureId) === false) return false;
                continue;
            }
            switch (geometry.type) {
            case 'Point':
            case 'LineString':
            case 'MultiPoint':
            case 'Polygon':
            case 'MultiLineString':
            case 'MultiPolygon': {
                if (callback(geometry, featureIndex, featureProperties, featureBBox, featureId) === false) return false;
                break;
            }
            case 'GeometryCollection': {
                for (j = 0; j < geometry.geometries.length; j++) {
                    if (callback(geometry.geometries[j], featureIndex, featureProperties, featureBBox, featureId) === false) return false;
                }
                break;
            }
            default:
                throw new Error('Unknown Geometry Type');
            }
        }
        // Only increase `featureIndex` per each feature
        featureIndex++;
    }
}

/**
 * Callback for geomReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback geomReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Geometry} currentGeometry The current Geometry being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {Object} featureProperties The current Feature Properties being processed.
 * @param {Array<number>} featureBBox The current Feature BBox being processed.
 * @param {number|string} featureId The current Feature Id being processed.
 */

/**
 * Reduce geometry in any GeoJSON object, similar to Array.reduce().
 *
 * @name geomReduce
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.geomReduce(features, function (previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
 *   //=previousValue
 *   //=currentGeometry
 *   //=featureIndex
 *   //=featureProperties
 *   //=featureBBox
 *   //=featureId
 *   return currentGeometry
 * });
 */
function geomReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    geomEach(geojson, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
        if (featureIndex === 0 && initialValue === undefined) previousValue = currentGeometry;
        else previousValue = callback(previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId);
    });
    return previousValue;
}

/**
 * Callback for flattenEach
 *
 * @callback flattenEachCallback
 * @param {Feature} currentFeature The current flattened feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 */

/**
 * Iterate over flattened features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name flattenEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, featureIndex, multiFeatureIndex)
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
 * ]);
 *
 * turf.flattenEach(features, function (currentFeature, featureIndex, multiFeatureIndex) {
 *   //=currentFeature
 *   //=featureIndex
 *   //=multiFeatureIndex
 * });
 */
function flattenEach(geojson, callback) {
    geomEach(geojson, function (geometry, featureIndex, properties, bbox, id) {
        // Callback for single geometry
        var type = (geometry === null) ? null : geometry.type;
        switch (type) {
        case null:
        case 'Point':
        case 'LineString':
        case 'Polygon':
            if (callback(helpers.feature(geometry, properties, {bbox: bbox, id: id}), featureIndex, 0) === false) return false;
            return;
        }

        var geomType;

        // Callback for multi-geometry
        switch (type) {
        case 'MultiPoint':
            geomType = 'Point';
            break;
        case 'MultiLineString':
            geomType = 'LineString';
            break;
        case 'MultiPolygon':
            geomType = 'Polygon';
            break;
        }

        for (var multiFeatureIndex = 0; multiFeatureIndex < geometry.coordinates.length; multiFeatureIndex++) {
            var coordinate = geometry.coordinates[multiFeatureIndex];
            var geom = {
                type: geomType,
                coordinates: coordinate
            };
            if (callback(helpers.feature(geom, properties), featureIndex, multiFeatureIndex) === false) return false;
        }
    });
}

/**
 * Callback for flattenReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback flattenReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature} currentFeature The current Feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 */

/**
 * Reduce flattened features in any GeoJSON object, similar to Array.reduce().
 *
 * @name flattenReduce
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex, multiFeatureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
 * ]);
 *
 * turf.flattenReduce(features, function (previousValue, currentFeature, featureIndex, multiFeatureIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   return currentFeature
 * });
 */
function flattenReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    flattenEach(geojson, function (currentFeature, featureIndex, multiFeatureIndex) {
        if (featureIndex === 0 && multiFeatureIndex === 0 && initialValue === undefined) previousValue = currentFeature;
        else previousValue = callback(previousValue, currentFeature, featureIndex, multiFeatureIndex);
    });
    return previousValue;
}

/**
 * Callback for segmentEach
 *
 * @callback segmentEachCallback
 * @param {Feature<LineString>} currentSegment The current Segment being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 * @param {number} segmentIndex The current index of the Segment being processed.
 * @returns {void}
 */

/**
 * Iterate over 2-vertex line segment in any GeoJSON object, similar to Array.forEach()
 * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON
 * @param {Function} callback a method that takes (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex)
 * @returns {void}
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 *
 * // Iterate over GeoJSON by 2-vertex segments
 * turf.segmentEach(polygon, function (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
 *   //=currentSegment
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 *   //=segmentIndex
 * });
 *
 * // Calculate the total number of segments
 * var total = 0;
 * turf.segmentEach(polygon, function () {
 *     total++;
 * });
 */
function segmentEach(geojson, callback) {
    flattenEach(geojson, function (feature, featureIndex, multiFeatureIndex) {
        var segmentIndex = 0;

        // Exclude null Geometries
        if (!feature.geometry) return;
        // (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
        var type = feature.geometry.type;
        if (type === 'Point' || type === 'MultiPoint') return;

        // Generate 2-vertex line segments
        var previousCoords;
        var previousFeatureIndex = 0;
        var previousMultiIndex = 0;
        var prevGeomIndex = 0;
        if (coordEach(feature, function (currentCoord, coordIndex, featureIndexCoord, multiPartIndexCoord, geometryIndex) {
            // Simulating a meta.coordReduce() since `reduce` operations cannot be stopped by returning `false`
            if (previousCoords === undefined || featureIndex > previousFeatureIndex || multiPartIndexCoord > previousMultiIndex || geometryIndex > prevGeomIndex) {
                previousCoords = currentCoord;
                previousFeatureIndex = featureIndex;
                previousMultiIndex = multiPartIndexCoord;
                prevGeomIndex = geometryIndex;
                segmentIndex = 0;
                return;
            }
            var currentSegment = helpers.lineString([previousCoords, currentCoord], feature.properties);
            if (callback(currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) === false) return false;
            segmentIndex++;
            previousCoords = currentCoord;
        }) === false) return false;
    });
}

/**
 * Callback for segmentReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback segmentReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<LineString>} currentSegment The current Segment being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 * @param {number} segmentIndex The current index of the Segment being processed.
 */

/**
 * Reduce 2-vertex line segment in any GeoJSON object, similar to Array.reduce()
 * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON
 * @param {Function} callback a method that takes (previousValue, currentSegment, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {void}
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 *
 * // Iterate over GeoJSON by 2-vertex segments
 * turf.segmentReduce(polygon, function (previousSegment, currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
 *   //= previousSegment
 *   //= currentSegment
 *   //= featureIndex
 *   //= multiFeatureIndex
 *   //= geometryIndex
 *   //= segmentInex
 *   return currentSegment
 * });
 *
 * // Calculate the total number of segments
 * var initialValue = 0
 * var total = turf.segmentReduce(polygon, function (previousValue) {
 *     previousValue++;
 *     return previousValue;
 * }, initialValue);
 */
function segmentReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    var started = false;
    segmentEach(geojson, function (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
        if (started === false && initialValue === undefined) previousValue = currentSegment;
        else previousValue = callback(previousValue, currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex);
        started = true;
    });
    return previousValue;
}

/**
 * Callback for lineEach
 *
 * @callback lineEachCallback
 * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed
 * @param {number} featureIndex The current index of the Feature being processed
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed
 * @param {number} geometryIndex The current index of the Geometry being processed
 */

/**
 * Iterate over line or ring coordinates in LineString, Polygon, MultiLineString, MultiPolygon Features or Geometries,
 * similar to Array.forEach.
 *
 * @name lineEach
 * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
 * @param {Function} callback a method that takes (currentLine, featureIndex, multiFeatureIndex, geometryIndex)
 * @example
 * var multiLine = turf.multiLineString([
 *   [[26, 37], [35, 45]],
 *   [[36, 53], [38, 50], [41, 55]]
 * ]);
 *
 * turf.lineEach(multiLine, function (currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=currentLine
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 * });
 */
function lineEach(geojson, callback) {
    // validation
    if (!geojson) throw new Error('geojson is required');

    flattenEach(geojson, function (feature, featureIndex, multiFeatureIndex) {
        if (feature.geometry === null) return;
        var type = feature.geometry.type;
        var coords = feature.geometry.coordinates;
        switch (type) {
        case 'LineString':
            if (callback(feature, featureIndex, multiFeatureIndex, 0, 0) === false) return false;
            break;
        case 'Polygon':
            for (var geometryIndex = 0; geometryIndex < coords.length; geometryIndex++) {
                if (callback(helpers.lineString(coords[geometryIndex], feature.properties), featureIndex, multiFeatureIndex, geometryIndex) === false) return false;
            }
            break;
        }
    });
}

/**
 * Callback for lineReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback lineReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed.
 * @param {number} featureIndex The current index of the Feature being processed
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed
 * @param {number} geometryIndex The current index of the Geometry being processed
 */

/**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name lineReduce
 * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
 * @param {Function} callback a method that takes (previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var multiPoly = turf.multiPolygon([
 *   turf.polygon([[[12,48],[2,41],[24,38],[12,48]], [[9,44],[13,41],[13,45],[9,44]]]),
 *   turf.polygon([[[5, 5], [0, 0], [2, 2], [4, 4], [5, 5]]])
 * ]);
 *
 * turf.lineReduce(multiPoly, function (previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=previousValue
 *   //=currentLine
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 *   return currentLine
 * });
 */
function lineReduce(geojson, callback, initialValue) {
    var previousValue = initialValue;
    lineEach(geojson, function (currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
        if (featureIndex === 0 && initialValue === undefined) previousValue = currentLine;
        else previousValue = callback(previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex);
    });
    return previousValue;
}

/**
 * Finds a particular 2-vertex LineString Segment from a GeoJSON using `@turf/meta` indexes.
 *
 * Negative indexes are permitted.
 * Point & MultiPoint will always return null.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson Any GeoJSON Feature or Geometry
 * @param {Object} [options={}] Optional parameters
 * @param {number} [options.featureIndex=0] Feature Index
 * @param {number} [options.multiFeatureIndex=0] Multi-Feature Index
 * @param {number} [options.geometryIndex=0] Geometry Index
 * @param {number} [options.segmentIndex=0] Segment Index
 * @param {Object} [options.properties={}] Translate Properties to output LineString
 * @param {BBox} [options.bbox={}] Translate BBox to output LineString
 * @param {number|string} [options.id={}] Translate Id to output LineString
 * @returns {Feature<LineString>} 2-vertex GeoJSON Feature LineString
 * @example
 * var multiLine = turf.multiLineString([
 *     [[10, 10], [50, 30], [30, 40]],
 *     [[-10, -10], [-50, -30], [-30, -40]]
 * ]);
 *
 * // First Segment (defaults are 0)
 * turf.findSegment(multiLine);
 * // => Feature<LineString<[[10, 10], [50, 30]]>>
 *
 * // First Segment of 2nd Multi Feature
 * turf.findSegment(multiLine, {multiFeatureIndex: 1});
 * // => Feature<LineString<[[-10, -10], [-50, -30]]>>
 *
 * // Last Segment of Last Multi Feature
 * turf.findSegment(multiLine, {multiFeatureIndex: -1, segmentIndex: -1});
 * // => Feature<LineString<[[-50, -30], [-30, -40]]>>
 */
function findSegment(geojson, options) {
    // Optional Parameters
    options = options || {};
    if (!helpers.isObject(options)) throw new Error('options is invalid');
    var featureIndex = options.featureIndex || 0;
    var multiFeatureIndex = options.multiFeatureIndex || 0;
    var geometryIndex = options.geometryIndex || 0;
    var segmentIndex = options.segmentIndex || 0;

    // Find FeatureIndex
    var properties = options.properties;
    var geometry;

    switch (geojson.type) {
    case 'FeatureCollection':
        if (featureIndex < 0) featureIndex = geojson.features.length + featureIndex;
        properties = properties || geojson.features[featureIndex].properties;
        geometry = geojson.features[featureIndex].geometry;
        break;
    case 'Feature':
        properties = properties || geojson.properties;
        geometry = geojson.geometry;
        break;
    case 'Point':
    case 'MultiPoint':
        return null;
    case 'LineString':
    case 'Polygon':
    case 'MultiLineString':
    case 'MultiPolygon':
        geometry = geojson;
        break;
    default:
        throw new Error('geojson is invalid');
    }

    // Find SegmentIndex
    if (geometry === null) return null;
    var coords = geometry.coordinates;
    switch (geometry.type) {
    case 'Point':
    case 'MultiPoint':
        return null;
    case 'LineString':
        if (segmentIndex < 0) segmentIndex = coords.length + segmentIndex - 1;
        return helpers.lineString([coords[segmentIndex], coords[segmentIndex + 1]], properties, options);
    case 'Polygon':
        if (geometryIndex < 0) geometryIndex = coords.length + geometryIndex;
        if (segmentIndex < 0) segmentIndex = coords[geometryIndex].length + segmentIndex - 1;
        return helpers.lineString([coords[geometryIndex][segmentIndex], coords[geometryIndex][segmentIndex + 1]], properties, options);
    case 'MultiLineString':
        if (multiFeatureIndex < 0) multiFeatureIndex = coords.length + multiFeatureIndex;
        if (segmentIndex < 0) segmentIndex = coords[multiFeatureIndex].length + segmentIndex - 1;
        return helpers.lineString([coords[multiFeatureIndex][segmentIndex], coords[multiFeatureIndex][segmentIndex + 1]], properties, options);
    case 'MultiPolygon':
        if (multiFeatureIndex < 0) multiFeatureIndex = coords.length + multiFeatureIndex;
        if (geometryIndex < 0) geometryIndex = coords[multiFeatureIndex].length + geometryIndex;
        if (segmentIndex < 0) segmentIndex = coords[multiFeatureIndex][geometryIndex].length - segmentIndex - 1;
        return helpers.lineString([coords[multiFeatureIndex][geometryIndex][segmentIndex], coords[multiFeatureIndex][geometryIndex][segmentIndex + 1]], properties, options);
    }
    throw new Error('geojson is invalid');
}

/**
 * Finds a particular Point from a GeoJSON using `@turf/meta` indexes.
 *
 * Negative indexes are permitted.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson Any GeoJSON Feature or Geometry
 * @param {Object} [options={}] Optional parameters
 * @param {number} [options.featureIndex=0] Feature Index
 * @param {number} [options.multiFeatureIndex=0] Multi-Feature Index
 * @param {number} [options.geometryIndex=0] Geometry Index
 * @param {number} [options.coordIndex=0] Coord Index
 * @param {Object} [options.properties={}] Translate Properties to output Point
 * @param {BBox} [options.bbox={}] Translate BBox to output Point
 * @param {number|string} [options.id={}] Translate Id to output Point
 * @returns {Feature<Point>} 2-vertex GeoJSON Feature Point
 * @example
 * var multiLine = turf.multiLineString([
 *     [[10, 10], [50, 30], [30, 40]],
 *     [[-10, -10], [-50, -30], [-30, -40]]
 * ]);
 *
 * // First Segment (defaults are 0)
 * turf.findPoint(multiLine);
 * // => Feature<Point<[10, 10]>>
 *
 * // First Segment of the 2nd Multi-Feature
 * turf.findPoint(multiLine, {multiFeatureIndex: 1});
 * // => Feature<Point<[-10, -10]>>
 *
 * // Last Segment of last Multi-Feature
 * turf.findPoint(multiLine, {multiFeatureIndex: -1, coordIndex: -1});
 * // => Feature<Point<[-30, -40]>>
 */
function findPoint(geojson, options) {
    // Optional Parameters
    options = options || {};
    if (!helpers.isObject(options)) throw new Error('options is invalid');
    var featureIndex = options.featureIndex || 0;
    var multiFeatureIndex = options.multiFeatureIndex || 0;
    var geometryIndex = options.geometryIndex || 0;
    var coordIndex = options.coordIndex || 0;

    // Find FeatureIndex
    var properties = options.properties;
    var geometry;

    switch (geojson.type) {
    case 'FeatureCollection':
        if (featureIndex < 0) featureIndex = geojson.features.length + featureIndex;
        properties = properties || geojson.features[featureIndex].properties;
        geometry = geojson.features[featureIndex].geometry;
        break;
    case 'Feature':
        properties = properties || geojson.properties;
        geometry = geojson.geometry;
        break;
    case 'Point':
    case 'MultiPoint':
        return null;
    case 'LineString':
    case 'Polygon':
    case 'MultiLineString':
    case 'MultiPolygon':
        geometry = geojson;
        break;
    default:
        throw new Error('geojson is invalid');
    }

    // Find Coord Index
    if (geometry === null) return null;
    var coords = geometry.coordinates;
    switch (geometry.type) {
    case 'Point':
        return helpers.point(coords, properties, options);
    case 'MultiPoint':
        if (multiFeatureIndex < 0) multiFeatureIndex = coords.length + multiFeatureIndex;
        return helpers.point(coords[multiFeatureIndex], properties, options);
    case 'LineString':
        if (coordIndex < 0) coordIndex = coords.length + coordIndex;
        return helpers.point(coords[coordIndex], properties, options);
    case 'Polygon':
        if (geometryIndex < 0) geometryIndex = coords.length + geometryIndex;
        if (coordIndex < 0) coordIndex = coords[geometryIndex].length + coordIndex;
        return helpers.point(coords[geometryIndex][coordIndex], properties, options);
    case 'MultiLineString':
        if (multiFeatureIndex < 0) multiFeatureIndex = coords.length + multiFeatureIndex;
        if (coordIndex < 0) coordIndex = coords[multiFeatureIndex].length + coordIndex;
        return helpers.point(coords[multiFeatureIndex][coordIndex], properties, options);
    case 'MultiPolygon':
        if (multiFeatureIndex < 0) multiFeatureIndex = coords.length + multiFeatureIndex;
        if (geometryIndex < 0) geometryIndex = coords[multiFeatureIndex].length + geometryIndex;
        if (coordIndex < 0) coordIndex = coords[multiFeatureIndex][geometryIndex].length - coordIndex;
        return helpers.point(coords[multiFeatureIndex][geometryIndex][coordIndex], properties, options);
    }
    throw new Error('geojson is invalid');
}

exports.coordEach = coordEach;
exports.coordReduce = coordReduce;
exports.propEach = propEach;
exports.propReduce = propReduce;
exports.featureEach = featureEach;
exports.featureReduce = featureReduce;
exports.coordAll = coordAll;
exports.geomEach = geomEach;
exports.geomReduce = geomReduce;
exports.flattenEach = flattenEach;
exports.flattenReduce = flattenReduce;
exports.segmentEach = segmentEach;
exports.segmentReduce = segmentReduce;
exports.lineEach = lineEach;
exports.lineReduce = lineReduce;
exports.findSegment = findSegment;
exports.findPoint = findPoint;


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/style.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/style.css ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js")(false);
// Module
exports.push([module.i, "html {\n    height: 100%;\n}\n\nbody {\n    margin: 0;\n    height: 100%;\n}\n\n#loader {\n    position: absolute;\n    top: 0;\n    left: 0;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: center;\n    background-color: black;\n    width: 100%;\n    height: 100%;\n    z-index: 3;\n    color: white;\n    font-family: sans-serif;\n    font-size: 3rem;\n}\n\n#gbfsMap {\n    width: 100%;\n    height: 100%;\n    z-index: 1;\n}\n\n.leaflet-control-custom {\n    width: auto;\n    height: auto;\n    padding: 6px;\n    background-color: white;\n    cursor: pointer !important;\n}\n\n.custom-collection {\n    display: flex;\n    flex-direction: row;\n    user-select: none;\n}\n\n.custom-collection .leaflet-control {\n    margin-top: 0px !important;\n    font-size: 125% !important;\n}\n\n.custom-collection .leaflet-control:hover {\n    background-color: #f4f4f4;\n}\n\n.fix-margin {\n    margin-right: 4px !important;\n    transition: 0.2s ease;\n}\n\n#modal-container {\n    display: none;\n    width: 100%;\n    height: 100%;\n    position: fixed;\n    top: 0;\n    left: 0;\n    background-color: rgba(0,0,0,0.85);\n    z-index: 1000;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n#modal {\n    width: 100%;\n    max-width: 500px;\n    padding: 20px;\n    background-color: white;\n    border-radius: 5px;\n    font-family: \"Helvetica Neue\", Arial, Helvetica, sans-serif;\n    box-sizing: border-box;\n    overflow: scroll;\n    max-height: 100%;\n}\n\n#modal #close {\n    float: right;\n    cursor: pointer;\n}\n\n.buttonLoading {\n    background-image:\n            repeating-linear-gradient(\n                    -45deg,\n                    rgba(229, 111, 0, 0.2),\n                    rgba(229, 111, 0, 0.2) 11px,\n                    rgba(229, 111, 0, 0.3) 10px,\n                    rgba(229, 111, 0, 0.3) 20px /* determines size */\n            );\n    background-size: 28px 28px;\n    animation: move .5s linear infinite;\n}\n\n.spin {\n    display: inline-block;\n    animation: spinner 0.5s linear infinite;\n}\n\n@keyframes spinner {\n    0% {\n        transform: rotate(0deg);\n    }\n    100% {\n        transform: rotate(360deg);\n    }\n}\n\n@keyframes move {\n    0% {\n        background-position: 0 0;\n    }\n    100% {\n        background-position: 28px 0;\n    }\n}", ""]);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], "{").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    for (var i = 0; i < this.length; i++) {
      // eslint-disable-next-line prefer-destructuring
      var id = this[i][0];

      if (id != null) {
        alreadyImportedModules[id] = true;
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = modules[_i]; // skip already imported module
      // this implementation is not 100% perfect for weird media query combinations
      // when a module is imported multiple times with different media queries.
      // I hope this will never occur (Hey this way we have smaller bundles)

      if (item[0] == null || !alreadyImportedModules[item[0]]) {
        if (mediaQuery && !item[2]) {
          item[2] = mediaQuery;
        } else if (mediaQuery) {
          item[2] = "(".concat(item[2], ") and (").concat(mediaQuery, ")");
        }

        list.push(item);
      }
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot).concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ "./node_modules/json-loader/index.js!./src/zones.geojson":
/*!******************************************************!*\
  !*** ./node_modules/json-loader!./src/zones.geojson ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {"type":"FeatureCollection","name":"zonesWithColor","crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},"features":[{"type":"Feature","properties":{"OBJECTID":1,"zone":"Downtown","path":"MultiPolygon?crs=EPSG:4326&field=OBJECTID:integer(0,0)&field=NAME:string(0,0)&field=COUNTY:string(0,0)&field=OSP:double(0,0)&field=TWNCODE:string(0,0)&field=LAND:string(0,0)&field=Shape__Area:double(0,0)&field=Shape__Length:double(0,0)&field=OBJECTID_2:integer(0,0)&field=SURFACE:integer(0,0)&field=CLASS:integer(0,0)&field=MCODE:integer(0,0)&field=RTNO:string(0,0)&field=NAME_2:string(0,0)&field=SCENIC:integer(0,0)&field=JURIS:integer(0,0)&field=LANES:integer(0,0)&field=NHS:integer(0,0)&field=LTWN:string(0,0)&field=RTWN:string(0,0)&field=DIVISION:string(0,0)&field=ROADTYPE:string(0,0)&field=COUNTY_2:string(0,0)&field=ROADCLASS:integer(0,0)&field=F_SYSTEM:integer(0,0)&field=Urban_Code:integer(0,0)&field=Shape_Leng:double(0,0)&uid={f00e2abc-9916-4fbc-a485-0aa6f1a22a2d}","displayColor":"#E66F00"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-71.40778411223079,41.82418234746746],[-71.4080707919999,41.8240850110001],[-71.4081090879999,41.8240507610001],[-71.408109892,41.824001799],[-71.40802346,41.8238521930001],[-71.408062684,41.82383258],[-71.4076737629999,41.8231691670001],[-71.407633469,41.8231461060001],[-71.407404403,41.82281412],[-71.4070645419999,41.8223143480001],[-71.406851361,41.8219739350001],[-71.4066672439999,41.8216635490001],[-71.4065779159999,41.8215127030001],[-71.4064267699999,41.821257388],[-71.406262335,41.8209546780001],[-71.4061777919999,41.820815591],[-71.406116767,41.8206922100001],[-71.406057872,41.820575531],[-71.405876556,41.8202161390001],[-71.4058720749999,41.820207285],[-71.405872974,41.820135684],[-71.405887277,41.820076031],[-71.4059233789999,41.820016213],[-71.405997805,41.819985859],[-71.406067518,41.8199583590001],[-71.406143029,41.819937908],[-71.406234737,41.8199223170001],[-71.406323459,41.8198996130001],[-71.4063941209999,41.8198707180001],[-71.4064504849999,41.819836233],[-71.406498179,41.8197926380001],[-71.406559923,41.8197368890001],[-71.4066152249999,41.8196960220001],[-71.406884708,41.819657729],[-71.4068308559999,41.819583751],[-71.406826737,41.8195781220001],[-71.406564137,41.819634783],[-71.4062724359999,41.819709372],[-71.406008266,41.819521519],[-71.405684117,41.8196460020001],[-71.40475552,41.8181706620001],[-71.404695928,41.8181768100001],[-71.40454865,41.8178803320001],[-71.4045824899999,41.81786019],[-71.4045660739999,41.8178397550001],[-71.404528451,41.8177918820001],[-71.404517449,41.8177688440001],[-71.404439962,41.8175776430001],[-71.4044254039999,41.8175403550001],[-71.404376409,41.8174925640001],[-71.4043233479999,41.817424966],[-71.4042570949999,41.8174297360001],[-71.404108895,41.8171998510001],[-71.404161798,41.81718878],[-71.404173868,41.817172371],[-71.403802003,41.8166040930001],[-71.40377754,41.8165475640001],[-71.403748196,41.8164840100001],[-71.403708431,41.8164184350001],[-71.403667774,41.816356381],[-71.403631854,41.816294994],[-71.403610121,41.8162328180001],[-71.403589306,41.81616918],[-71.4035628679999,41.81610492],[-71.403533523,41.8160427610001],[-71.4034926429999,41.815965819],[-71.403459541,41.815901599],[-71.403425515,41.815841608],[-71.403388677,41.8157816610001],[-71.4033574699999,41.8157174200001],[-71.403327234,41.8156588270001],[-71.403308075,41.815632307],[-71.403290534,41.81560812],[-71.403250992,41.8155573870001],[-71.403192938,41.8155387],[-71.403105813,41.8155401130001],[-71.403030219,41.8155569940001],[-71.403018045,41.8155610100001],[-71.402951034,41.815583136],[-71.402367893,41.8158202020001],[-71.4022007519999,41.81559048],[-71.403097095,41.8152595060001],[-71.403095606,41.8152531470001],[-71.403089016,41.8152248310001],[-71.4030562999999,41.8151889220001],[-71.4030110689999,41.8151404020001],[-71.402977183,41.8150889190001],[-71.4029449729999,41.815021841],[-71.402926252,41.814969546],[-71.40290131637471,41.814921574749576],[-71.4035352680073,41.8146068644916],[-71.4037067417875,41.8145377117819],[-71.4039908061076,41.8144409053483],[-71.4041546113111,41.8143887791169],[-71.4042566590777,41.8143588189211],[-71.4046592023225,41.8142584784385],[-71.4049176410359,41.8142083185344],[-71.4050045227973,41.8141938571015],[-71.4050917301933,41.8141805330031],[-71.4051792331407,41.8141683462135],[-71.4052670087644,41.8141573057168],[-71.405394462584,41.8141430025867],[-71.4055191212947,41.8141306930732],[-71.4056440495597,41.8141200114631],[-71.4057692064616,41.814110963124],[-71.4058945558969,41.8141035534276],[-71.4060200593723,41.8140977760394],[-71.406145678371,41.8140936408313],[-71.4062362046849,41.8140918447461],[-71.406254670528,41.8140914771715],[-71.4062713743945,41.8140911450703],[-71.4063874748198,41.8140903574036],[-71.4063971101401,41.814090291427],[-71.4065228459031,41.8140910789684],[-71.4065901297005,41.8140921141702],[-71.4067596438278,41.8140963412324],[-71.406815143922,41.8140983715186],[-71.4068315214924,41.8140989709247],[-71.4069291441474,41.8141026397189],[-71.4070984161495,41.8141112192359],[-71.4072674623631,41.814122007759],[-71.4074362322661,41.8141349998465],[-71.407604671717,41.8141501963563],[-71.4077727314035,41.8141675873466],[-71.4079403607994,41.8141871700776],[-71.4080985906794,41.8142077786367],[-71.4081075069751,41.8142089391066],[-71.4082759808138,41.814233178589],[-71.4084401499953,41.8142590043963],[-71.4086055433916,41.8142872861738],[-71.4087702550995,41.8143177225891],[-71.4089342285813,41.814350305497],[-71.4090974205388,41.8143850258632],[-71.409259773243,41.8144218665387],[-71.4094212469979,41.8144608238944],[-71.4097413411649,41.8145450317696],[-71.4097994353575,41.814561605866],[-71.4098998665615,41.8145902579131],[-71.4117151264628,41.8151370805748],[-71.4117662176313,41.8151524715469],[-71.4124778345873,41.8153668019471],[-71.4126476927151,41.8154359459897],[-71.4129348800404,41.815554410322],[-71.4132766275313,41.8157134088813],[-71.4134097760203,41.8157772462743],[-71.4135010724273,41.8158210176148],[-71.4137230725531,41.8159321678147],[-71.4140011319367,41.8160782982022],[-71.4142397463733,41.8162101244647],[-71.4143368625818,41.8162660117714],[-71.4144218661634,41.8163149267346],[-71.4145574392704,41.8163954380139],[-71.4145629880417,41.8163987328875],[-71.4146743949232,41.8164651843326],[-71.4147816398381,41.8165346118102],[-71.4148766991265,41.816594904301],[-71.4150115700191,41.816678526099],[-71.4151152218115,41.8167452504815],[-71.4151399469956,41.8167611669708],[-71.4152876062494,41.8168558018564],[-71.4153680322174,41.8169080674096],[-71.4153680442434,41.8169080746212],[-71.4154765475959,41.8169789987387],[-71.4154863842194,41.8169854281082],[-71.4155964612142,41.817057931567],[-71.4156950153473,41.8171232849591],[-71.4159027586724,41.8172624210629],[-71.4160782135473,41.8173814096841],[-71.4161880368534,41.8174565890995],[-71.4162905281809,41.817527237953],[-71.4163820247302,41.8175908128364],[-71.416382654829,41.8175912508607],[-71.4164293014267,41.8176236610636],[-71.4165405421919,41.8177015944126],[-71.4165513860438,41.817709239882],[-71.4166289873385,41.8177639685267],[-71.4170510729226,41.8180662718095],[-71.4172819652567,41.8182348407459],[-71.4174344018787,41.8183474029742],[-71.4177130250939,41.8185557994935],[-71.4179182479411,41.8187115359981],[-71.4180775818552,41.8188337881573],[-71.4181558116032,41.8188942432757],[-71.4182386090508,41.8189585442453],[-71.4183207472056,41.8190227582531],[-71.4183860314201,41.8190738404645],[-71.4184178491642,41.8190988601235],[-71.4185002307547,41.8191640618481],[-71.4185640824612,41.8192146000353],[-71.4186705537336,41.8193012207086],[-71.418795283452,41.8194062976678],[-71.4188784908562,41.8194786772168],[-71.4190332964328,41.819618522894],[-71.4191038214912,41.8196846044588],[-71.4191799586984,41.8197577152856],[-71.4192281987753,41.8198050269979],[-71.4193332255063,41.8199124889163],[-71.419447222926,41.8200296978117],[-71.4195180412495,41.8201112309671],[-71.4195561879699,41.8201684500167],[-71.4196019646457,41.8202409297626],[-71.4197011457351,41.8203935177119],[-71.4197469227871,41.8204698112397],[-71.419792698743,41.8205461056479],[-71.4198384760692,41.8206262138798],[-71.419975804306,41.8208894287111],[-71.4200371577155,41.8210357740457],[-71.4201055043487,41.8213052304431],[-71.4201436539504,41.8214463745101],[-71.4201436506389,41.8215226684444],[-71.4201589104716,41.821949914814],[-71.4201589095856,41.822026207843],[-71.4201512808663,41.8221482796689],[-71.4201207613068,41.8223466430074],[-71.4200673577372,41.8225526369986],[-71.419952915279,41.8229264766567],[-71.419889658528,41.8231026318109],[-71.4198384744699,41.8232583558309],[-71.4197087754853,41.8236550846988],[-71.4195943343932,41.8239755193663],[-71.4195333006582,41.8241281067502],[-71.4194722644692,41.8243073981759],[-71.4193425655022,41.8246469063615],[-71.4192357534151,41.8249520816119],[-71.419189975991,41.8250855968117],[-71.4191136833734,41.8252801461441],[-71.4190602763938,41.8254365497494],[-71.4189992423987,41.8255853220708],[-71.4188771711457,41.8259133863142],[-71.4188390251172,41.8260316414829],[-71.4186330308529,41.8265847724096],[-71.4185567371495,41.8267831369584],[-71.4184499250891,41.8270730542112],[-71.4182744492427,41.8275918527071],[-71.4182515604355,41.8276567031682],[-71.4181294908636,41.8280000263484],[-71.4180531972822,41.8282174642],[-71.4178777202771,41.8289422559774],[-71.4177861675681,41.8293237262855],[-71.4177556498984,41.8295564231752],[-71.4177022447738,41.8300218160663],[-71.4176488384036,41.8304490624355],[-71.4175801736677,41.8308419759849],[-71.4175267669566,41.8311013756807],[-71.4174199566978,41.8314256252734],[-71.4173131448119,41.8317231716021],[-71.4172444804133,41.8318757583704],[-71.4172234814402,41.8319630517803],[-71.4171976646502,41.8319597379342],[-71.4168773585016,41.8319024602427],[-71.4165822584346,41.831862138036],[-71.4162898950922,41.8318337951708],[-71.4155543839605,41.8317619094841],[-71.4144506514342,41.83168574524],[-71.4140871229677,41.8316592659686],[-71.4128076347145,41.831531900646],[-71.4122038609254,41.8314678345349],[-71.4116476519428,41.8314051640565],[-71.4114811971736,41.8314083113394],[-71.411335167394,41.8314256265726],[-71.4113237705667,41.8312181833332],[-71.4112628222969,41.8309462267564],[-71.4110017333235,41.8297011459988],[-71.4108668478114,41.8290523948584],[-71.410823305036,41.8288656298338],[-71.4106899167339,41.8284768624004],[-71.4106297931063,41.8283280895098],[-71.4105992753629,41.828270869014],[-71.410530610582,41.8281564292571],[-71.4104543174998,41.8280076562763],[-71.4103932818698,41.8279084741262],[-71.4102101788646,41.8276261855246],[-71.4101796595896,41.8275765943845],[-71.4099126300366,41.8271874954028],[-71.40778411223079,41.82418234746746]]]]}},{"type":"Feature","properties":{"OBJECTID":3,"zone":"West","path":null,"displayColor":"#FCA10D"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-71.439948891,41.803296065],[-71.4400053099999,41.803396236],[-71.440323255,41.803545678],[-71.440625794,41.8036457590001],[-71.440847315,41.803803154],[-71.441052349,41.803942874],[-71.44122822,41.8041372910001],[-71.441447763,41.804330787],[-71.441652963,41.804542541],[-71.44195294,41.805022508],[-71.442158096,41.8054143540001],[-71.442465499,41.8059301700001],[-71.443072581,41.806898936],[-71.443543248,41.8068618630001],[-71.444262277,41.8068466060001],[-71.444880354,41.806797422],[-71.4456216419999,41.8067545540001],[-71.446445373,41.806673985],[-71.447385657,41.8066089000001],[-71.448450334,41.806505101],[-71.449281014,41.806469367],[-71.45018419,41.8063600780001],[-71.4511032469999,41.8063133920001],[-71.451889019,41.806242545],[-71.452740251,41.8061523380001],[-71.4538139869999,41.806021308],[-71.45523859,41.8058557590001],[-71.456723368,41.8056799240001],[-71.458243774,41.805521234],[-71.459397606,41.8053884660001],[-71.460132717,41.8052826410001],[-71.461138912,41.805152977],[-71.462491596,41.8050158710001],[-71.462667207,41.804985141],[-71.462851884,41.804936148],[-71.4631231179999,41.8048491910001],[-71.463409633,41.8046989480001],[-71.4637113639999,41.804593476],[-71.464056888,41.804468979],[-71.4643060029999,41.804373522],[-71.4645919659999,41.8047996560001],[-71.4647751969999,41.805083913],[-71.4648630409999,41.8052081170001],[-71.46441498,41.8054519610001],[-71.464502125,41.8055941740001],[-71.4647372969999,41.805850234],[-71.4648328609999,41.8059022320001],[-71.464935156,41.805800984],[-71.4650758779999,41.8056448610001],[-71.4652082329999,41.805488908],[-71.465383784,41.8053590380001],[-71.465613208,41.8052190650001],[-71.466017117,41.8050122510001],[-71.466333316,41.8048523200001],[-71.466692714,41.8047095520001],[-71.46679962,41.804770299],[-71.466979287,41.8048744610001],[-71.467258758,41.8050305350001],[-71.467470749,41.805134105],[-71.4682057809999,41.8051542920001],[-71.468984838,41.805155535],[-71.4690503479999,41.805262235],[-71.469152951,41.8054581330001],[-71.4692029839999,41.805574177],[-71.46906403,41.8056491780001],[-71.46904977,41.8057485680001],[-71.469019746,41.8059743590001],[-71.46896708,41.806326724],[-71.46840109,41.8063209100001],[-71.46812175,41.8063449310001],[-71.468040741,41.8072112340001],[-71.467973672,41.807473891],[-71.4676722729999,41.807588379],[-71.4672094699999,41.807733436],[-71.4669229519999,41.8078836870001],[-71.4671636159999,41.808193771],[-71.467427559,41.808485251],[-71.467654234,41.8088135960001],[-71.4678902379999,41.8090607300001],[-71.4681770409999,41.8090365410001],[-71.468321768,41.8093576570001],[-71.468659437,41.810097926],[-71.4688858659999,41.8107234180001],[-71.4681809149999,41.8107025570001],[-71.46734263,41.8107295940001],[-71.466748866,41.810715359],[-71.466490603,41.8107299480001],[-71.4665206989999,41.810828321],[-71.466569939,41.811142466],[-71.466702275,41.811481848],[-71.467001992,41.8124480810001],[-71.467287329,41.8130813980001],[-71.467536471,41.8136704520001],[-71.467717996,41.814233932],[-71.467931098,41.8146976830001],[-71.468179114,41.8152687260001],[-71.468348065,41.8157784310001],[-71.468588586,41.8164576980001],[-71.46884378,41.817145716],[-71.4688837419999,41.8172439190001],[-71.4693127789999,41.8183244090001],[-71.469685473,41.8193070340001],[-71.469890313,41.8198519910001],[-71.470204168,41.820682807],[-71.470789054,41.8222733320001],[-71.4713592109999,41.82379207],[-71.471505473,41.824122102],[-71.471050054,41.8241769580001],[-71.4701909469999,41.8242224480001],[-71.468463556,41.8243226660001],[-71.467214638,41.824349587],[-71.465620341,41.8244648940001],[-71.464323136,41.8245197260001],[-71.463989254,41.824544921],[-71.462856809,41.824587267],[-71.462378811,41.824608551],[-71.462429632,41.82475264],[-71.462440102,41.824886254],[-71.462517912,41.8249548000001],[-71.462587092,41.8250748830001],[-71.4626787449999,41.825194459],[-71.462737986,41.8252562230001],[-71.4628180829999,41.8253343740001],[-71.4628854429999,41.8254331890001],[-71.462905518,41.8256129430001],[-71.4628698029999,41.8257127530001],[-71.462833259,41.825857586],[-71.4627810219999,41.825975828],[-71.462733563,41.8261595060001],[-71.4626809499999,41.826332376],[-71.462565309,41.8264502550001],[-71.462460111,41.8265523580001],[-71.462365556,41.826685937],[-71.462312869,41.826788143],[-71.462302348,41.8269374430001],[-71.462302274,41.827063164],[-71.4623441699999,41.827181094],[-71.462417696,41.827322618],[-71.462438628,41.8274090680001],[-71.4625540599999,41.827652743],[-71.4626591429999,41.8277549150001],[-71.4627641559999,41.827778532],[-71.4628377559999,41.8277942490001],[-71.462942743,41.8278650330001],[-71.4634678209999,41.828368169],[-71.4644442159999,41.8298931570001],[-71.4646226739999,41.8302311830001],[-71.464706489,41.8306556220001],[-71.4647379469999,41.830789242],[-71.464758823,41.8309857180001],[-71.46480084,41.8311036480001],[-71.4648848369999,41.8311979210001],[-71.4650213419999,41.83152024],[-71.4652244979999,41.831786321],[-71.465517007,41.8320051760001],[-71.465756611,41.832094178],[-71.465945669,41.8321414010001],[-71.466163852,41.8321894040001],[-71.466582938,41.832225459],[-71.466971981,41.8322621040001],[-71.467243862,41.83224726],[-71.468177284,41.83216408],[-71.4684341349999,41.8321675810001],[-71.468646355,41.832220723],[-71.468772442,41.8323150910001],[-71.468929921,41.832464438],[-71.46911908,41.8325509320001],[-71.469455377,41.8325902990001],[-71.469770566,41.832653328],[-71.470085731,41.832771241],[-71.470316851,41.832873524],[-71.470653113,41.8329993310001],[-71.47044389391111,41.83292105505475],[-71.4703756021287,41.8329591314269],[-71.4703603440197,41.8329705761965],[-71.4702382732651,41.8330354257345],[-71.4700093897626,41.8331422372958],[-71.4697881379194,41.8332337896682],[-71.4694600751833,41.8333863787267],[-71.4693532635428,41.8334397835709],[-71.4692083030143,41.8335046331027],[-71.4690099390869,41.8335961865015],[-71.4686360986268,41.8337029975348],[-71.4685292880185,41.8337297011728],[-71.4682241124676,41.8338021790405],[-71.4678273826154,41.8338899182385],[-71.4677663480334,41.833893732969],[-71.4674840598922,41.8339166201462],[-71.4669042275994,41.833931879157],[-71.4662557285443,41.8339356951982],[-71.4660268447401,41.8339356952616],[-71.4655461952496,41.8339242510608],[-71.4654470114879,41.8339204362477],[-71.4649968766385,41.8338937327844],[-71.464851918637,41.8338670295023],[-71.46476799458,41.8338403276661],[-71.4646917009925,41.8338021776098],[-71.4645543710198,41.8337449602248],[-71.4644857071808,41.8337144418531],[-71.4642339370441,41.8335961871146],[-71.463860097624,41.8334130799159],[-71.4632650043259,41.8330888305099],[-71.4630056037688,41.8329438728865],[-71.4625173220409,41.8326692148692],[-71.4624105084695,41.8326234382635],[-71.4623494751116,41.8326081791443],[-71.4622960705613,41.8325929206961],[-71.4622426637942,41.8325814778574],[-71.4621816298,41.8325776619527],[-71.462128223704,41.8325814761994],[-71.4620671877741,41.8325891071387],[-71.4620061521354,41.832604364814],[-71.4619527467508,41.8326272526532],[-71.4618993414733,41.8326539561025],[-71.4618459377827,41.8326921037315],[-71.4618154175851,41.8327188066372],[-71.4618077881491,41.8327340639399],[-71.4617620132754,41.8327760260991],[-71.4617009765841,41.8328370622276],[-71.4616399433894,41.8328980965234],[-71.4615789064667,41.8329591316853],[-71.4615407601111,41.8330010927045],[-71.4615026135831,41.8330392398765],[-71.46145683685,41.8330735724423],[-71.4614034324316,41.833107905128],[-71.4613500243446,41.8331422377875],[-71.4612889894334,41.833165123649],[-71.4612279541587,41.8331765697763],[-71.4611592887088,41.8331841985572],[-71.4610906267554,41.8331880143646],[-71.4610372199926,41.8331880142694],[-71.4609761843807,41.8331880133587],[-71.4609151487683,41.8331880133159],[-71.4604192385151,41.8331803842119],[-71.4602819107615,41.833176569796],[-71.4597554816718,41.833168939875],[-71.4596334116753,41.8331651264268],[-71.4595494871307,41.8331613109816],[-71.459396899373,41.8331536817011],[-71.459190906143,41.8331422374306],[-71.4590535762295,41.8331231644085],[-71.4589772819859,41.833096461958],[-71.4589009914179,41.8330697585575],[-71.4588170649689,41.8330316126675],[-71.4586949948014,41.8329667606694],[-71.4585805537457,41.8328980965575],[-71.4583974483366,41.832787471513],[-71.4581609357297,41.8326310679253],[-71.4579320541521,41.8324784804758],[-71.4577184318474,41.832344965556],[-71.4576497667318,41.8323144484924],[-71.4575811029965,41.8322801157528],[-71.4575048080742,41.8322495975852],[-71.4574590323875,41.8322381535438],[-71.4574132568379,41.8322228947492],[-71.4573217032695,41.8321961927396],[-71.4572225219892,41.8321771190875],[-71.4571004511139,41.8321542301718],[-71.4569707514535,41.8321351575058],[-71.4568410503577,41.8321237132625],[-71.4567647584694,41.8321198986495],[-71.4566884641831,41.8321160830846],[-71.4566045410143,41.8321160838241],[-71.4564977280675,41.8321160839393],[-71.456390917347,41.8321198986911],[-71.4562917341332,41.832123713545],[-71.4562764754838,41.8321237122399],[-71.4562535881096,41.8321237134299],[-71.4562154408822,41.8321237133017],[-71.456177294858,41.8321237140616],[-71.4556356063,41.8321618596656],[-71.4553990964807,41.8321809344916],[-71.4552770254724,41.8321885624186],[-71.4552617653549,41.8321923766135],[-71.4552388755486,41.8321923776003],[-71.4546895625727,41.8322381542446],[-71.4545522311964,41.8322495991193],[-71.4543233506791,41.8322686711467],[-71.4537969210972,41.8323182628514],[-71.4534917455449,41.8323487809271],[-71.453026352698,41.8323907418168],[-71.4528432461743,41.832409816098],[-71.452782210511,41.8324174448048],[-71.4523397102157,41.832459406017],[-71.4522100091202,41.8324708512564],[-71.4520497900702,41.8324861091534],[-71.4517675020648,41.8325128120617],[-71.4516072840081,41.8325280711425],[-71.4513249980425,41.8325547738642],[-71.4510350794535,41.8325814762403],[-71.4506078339275,41.8326272538162],[-71.4503408046829,41.8326539570763],[-71.4498525236044,41.8326959177158],[-71.4497457127815,41.8327073629598],[-71.4493489830958,41.8327455098252],[-71.4492421721025,41.8327569528],[-71.4489751423343,41.8327874703201],[-71.4488149247062,41.8328065447415],[-71.4486623357912,41.832825616947],[-71.4481969440976,41.8328713937083],[-71.4481130191282,41.8328828387487],[-71.4480290965373,41.8328942828284],[-71.4479222862667,41.832905724576],[-71.4476323698835,41.8328713943154],[-71.4473653407216,41.8328408768424],[-71.4470754244615,41.832802729541],[-71.4466329178651,41.8327416943385],[-71.4463048528646,41.8326959186008],[-71.4458623497471,41.8326310683968],[-71.4455800625205,41.8325891070809],[-71.4451070380664,41.8325318860787],[-71.4445272041386,41.8324555928452],[-71.4438939667862,41.8323640395841],[-71.4433446484845,41.8323449654983],[-71.4425206723442,41.8323182635645],[-71.4424977847051,41.832314448179],[-71.4422917911614,41.8323030051133],[-71.441834027508,41.8322915587156],[-71.4417501051627,41.8322877446718],[-71.4417272165275,41.8322877447673],[-71.4417119578383,41.8322877451289],[-71.4413610051975,41.8322763014756],[-71.4410100516975,41.8322724862194],[-71.440933758376,41.832276301365],[-71.4408422051544,41.8322801167052],[-71.4405522893913,41.8323030040003],[-71.440277630915,41.8323258921946],[-71.4402394823639,41.8323258930624],[-71.4401326716511,41.8323373365708],[-71.4398122367996,41.8323640388297],[-71.4398046068814,41.8323678540682],[-71.4395375790891,41.8324021868945],[-71.4393392146392,41.8324250742618],[-71.4389577439449,41.832501368553],[-71.4385381271064,41.832592921719],[-71.4380651049627,41.8327645837047],[-71.4378285947898,41.8328485061481],[-71.4374623832276,41.832978205504],[-71.4371419471975,41.8330964620358],[-71.436836773852,41.8332109023269],[-71.4365239669409,41.8333253438892],[-71.4362111625277,41.8334397845986],[-71.4354634811614,41.8337220723374],[-71.4353185228263,41.8337716633756],[-71.4351354150746,41.8338365132378],[-71.4347463182921,41.8339395103582],[-71.4346700242261,41.8339547691439],[-71.4345479535141,41.8339776573821],[-71.4344640306905,41.8339891014519],[-71.4343114425103,41.8340005449292],[-71.4341435972775,41.8340005442601],[-71.4339299720786,41.8339891016335],[-71.4336934617557,41.833958583438],[-71.4334264321164,41.8339166217779],[-71.433350137431,41.8339089921848],[-71.4331212569687,41.8338746598028],[-71.4330373325992,41.8338632162279],[-71.4328084517112,41.8338365135899],[-71.4326634920501,41.8338288847712],[-71.4325261629674,41.8338288843174],[-71.4324498684993,41.833832699228],[-71.4323735748223,41.8338403288221],[-71.432076027661,41.8338708458],[-71.4316564112958,41.8339318811422],[-71.4314199001751,41.8339585837715],[-71.4312381779741,41.8339946147172],[-71.4309773947723,41.8340463214054],[-71.4305348905678,41.8341340600349],[-71.4302373430915,41.8342027240843],[-71.429596475859,41.8343324238687],[-71.429253151913,41.8344049026454],[-71.4291310808243,41.8344277914268],[-71.428879312979,41.8344811969469],[-71.4283910305279,41.8345803791705],[-71.4281621486349,41.834626156211],[-71.4280324482576,41.8346528591875],[-71.4275517949768,41.834763484118],[-71.4273076552478,41.8348207057335],[-71.4271092910448,41.8348626681428],[-71.426689674875,41.8349580341313],[-71.4258307254242,41.8351525869164],[-71.42564715551,41.8352212504754],[-71.4253054181841,41.8350943520873],[-71.4248505255926,41.8349122582024],[-71.4244525459241,41.8347545685098],[-71.4240481535596,41.8345880120654],[-71.4236193298335,41.8344200091132],[-71.4219742432316,41.8337754775766],[-71.4215896042537,41.8336258504273],[-71.4211425869634,41.8334405113741],[-71.4205575358886,41.8332109045917],[-71.4199929608243,41.8329820338568],[-71.4191931884574,41.8326730279584],[-71.4191384674324,41.832650144261],[-71.4189091084921,41.8325609634038],[-71.4183568911509,41.8323409841702],[-71.4181542755309,41.8322648604098],[-71.4180169468635,41.832215268166],[-71.4177352240354,41.8321185918703],[-71.4175616637658,41.8320570760532],[-71.4174508722834,41.8320214403152],[-71.4172559818187,41.8319692533196],[-71.4172234814402,41.8319630517803],[-71.4172444804133,41.8318757583704],[-71.4173131448119,41.8317231716021],[-71.4174199566978,41.8314256252734],[-71.4175267669566,41.8311013756807],[-71.4175801736677,41.8308419759849],[-71.4176488384036,41.8304490624355],[-71.4177022447738,41.8300218160663],[-71.4177556498984,41.8295564231752],[-71.4177861675681,41.8293237262855],[-71.4178777202771,41.8289422559774],[-71.4180531972822,41.8282174642],[-71.4181294908636,41.8280000263484],[-71.4182515604355,41.8276567031682],[-71.4182744492427,41.8275918527071],[-71.4184499250891,41.8270730542112],[-71.4185567371495,41.8267831369584],[-71.4186330308529,41.8265847724096],[-71.4188390251172,41.8260316414829],[-71.4188771711457,41.8259133863142],[-71.4189992423987,41.8255853220708],[-71.4190602763938,41.8254365497494],[-71.4191136833734,41.8252801461441],[-71.419189975991,41.8250855968117],[-71.4192357534151,41.8249520816119],[-71.4193425655022,41.8246469063615],[-71.4194722644692,41.8243073981759],[-71.4195333006582,41.8241281067502],[-71.4195943343932,41.8239755193663],[-71.4197087754853,41.8236550846988],[-71.4198384744699,41.8232583558309],[-71.419889658528,41.8231026318109],[-71.419952915279,41.8229264766567],[-71.4200673577372,41.8225526369986],[-71.4201207613068,41.8223466430074],[-71.4201512808663,41.8221482796689],[-71.4201589095856,41.822026207843],[-71.4201589104716,41.821949914814],[-71.4201436506389,41.8215226684444],[-71.4201436539504,41.8214463745101],[-71.4201055043487,41.8213052304431],[-71.4200371577155,41.8210357740457],[-71.419975804306,41.8208894287111],[-71.4198384760692,41.8206262138798],[-71.419792698743,41.8205461056479],[-71.4197469227871,41.8204698112397],[-71.4197011457351,41.8203935177119],[-71.4196019646457,41.8202409297626],[-71.4195561879699,41.8201684500167],[-71.4195180412495,41.8201112309671],[-71.419447222926,41.8200296978117],[-71.4193332255063,41.8199124889163],[-71.4192281987753,41.8198050269979],[-71.4191799586984,41.8197577152856],[-71.4191038214912,41.8196846044588],[-71.4190332964328,41.819618522894],[-71.4188784908562,41.8194786772168],[-71.418795283452,41.8194062976678],[-71.4186705537336,41.8193012207086],[-71.4185640824612,41.8192146000353],[-71.4185002307547,41.8191640618481],[-71.4184178491642,41.8190988601235],[-71.4183860314201,41.8190738404645],[-71.4183207472056,41.8190227582531],[-71.4182386090508,41.8189585442453],[-71.41831733163151,41.819020088023876],[-71.4183354848363,41.8190164123257],[-71.4184422955685,41.8189706356567],[-71.4185340708503,41.8189353371955],[-71.4185414777496,41.8189324883679],[-71.4187245838349,41.8188638230296],[-71.4188313940358,41.8188180468974],[-71.4192281236907,41.8186463866624],[-71.4192815278492,41.8186234979229],[-71.4196019639912,41.8184823529275],[-71.4201741685755,41.8182305845211],[-71.4211354722473,41.817784264377],[-71.4213490949572,41.8176888963696],[-71.4216618999726,41.817498162205],[-71.4217153057514,41.8174714593864],[-71.4220433695039,41.8172997974919],[-71.4222646244251,41.8171777279386],[-71.4224400989163,41.8170785452367],[-71.4227071278136,41.8168878097016],[-71.422821569697,41.8168038866268],[-71.4233556256394,41.8164147872462],[-71.4241567139607,41.8158273241275],[-71.4245152958628,41.8155679244079],[-71.4250646149902,41.8151559358451],[-71.425133277013,41.8151063456971],[-71.4256749631918,41.8147096180958],[-71.4258046622035,41.8146104365978],[-71.4258962157622,41.8145455864794],[-71.4260945808119,41.8144196997809],[-71.4262319096852,41.8143281476953],[-71.4263768677539,41.8142518539185],[-71.4269338144714,41.8139657514582],[-71.4276433481786,41.8135995400659],[-71.4286427982103,41.8130921852916],[-71.429588843668,41.8126115328046],[-71.4303441543472,41.8122224342949],[-71.4303670422144,41.8122109895205],[-71.4310613175848,41.8118676676509],[-71.4311376102897,41.8118142637147],[-71.4311833868596,41.8117799304991],[-71.4312901989366,41.8117074493882],[-71.4314122709196,41.8116120824952],[-71.4315648574102,41.8114747543114],[-71.4320302510604,41.8110208045003],[-71.432053140243,41.8110017316911],[-71.4326177160512,41.8104333415812],[-71.4331059970752,41.8099793917457],[-71.4334493190129,41.8096436986938],[-71.4335561308617,41.8094758521012],[-71.4340596701226,41.808903646997],[-71.434540322717,41.8083314418942],[-71.4350743812689,41.8077401650512],[-71.4356999913666,41.8070268153714],[-71.4357076199249,41.8070191865363],[-71.4357152520924,41.8070115568023],[-71.4362950846175,41.8063477996527],[-71.4366155185892,41.8059892173202],[-71.4367909938579,41.8058099270035],[-71.4368978058632,41.8057221896937],[-71.4373021655828,41.8054246415995],[-71.4373555708998,41.8053826805427],[-71.4377751863811,41.8050584322111],[-71.4378743699948,41.8049859524627],[-71.4383168733784,41.8045777791284],[-71.4385610138472,41.8043565264092],[-71.4386525665472,41.8042726039405],[-71.4390264075721,41.8039292806633],[-71.4391637377203,41.8038110258747],[-71.4392552888798,41.8037385453775],[-71.4394841715462,41.8036050300389],[-71.4396215017949,41.8035439960063],[-71.439728310205,41.8035020339757],[-71.4397435704118,41.8034944061702],[-71.4398046077187,41.8034753319855],[-71.4398351232873,41.8034600736486],[-71.4399343061967,41.8034257405416],[-71.4400029697455,41.803395223275],[-71.44000450996836,41.803394815557255],[-71.439948891,41.803296065]]]]}},{"type":"Feature","properties":{"OBJECTID":4,"zone":"South","path":"MultiPolygon?crs=EPSG:4326&field=OBJECTID:integer(0,0)&field=SURFACE:integer(0,0)&field=CLASS:integer(0,0)&field=MCODE:integer(0,0)&field=RTNO:string(0,0)&field=NAME:string(0,0)&field=SCENIC:integer(0,0)&field=JURIS:integer(0,0)&field=LANES:integer(0,0)&field=NHS:integer(0,0)&field=LTWN:string(0,0)&field=RTWN:string(0,0)&field=DIVISION:string(0,0)&field=ROADTYPE:string(0,0)&field=COUNTY:string(0,0)&field=ROADCLASS:integer(0,0)&field=F_SYSTEM:integer(0,0)&field=Urban_Code:integer(0,0)&field=Shape_Leng:double(0,0)&field=OBJECTID_2:integer(0,0)&field=NAME_2:string(0,0)&field=COUNTY_2:string(0,0)&field=OSP:double(0,0)&field=TWNCODE:string(0,0)&field=LAND:string(0,0)&field=Shape__Area:double(0,0)&field=Shape__Length:double(0,0)&uid={e5909eac-2355-46b2-9097-a986dee251c3}","displayColor":null},"geometry":{"type":"MultiPolygon","coordinates":[[[[-71.44000450996836,41.803394815557255],[-71.4400029697455,41.803395223275],[-71.4399343061967,41.8034257405416],[-71.4398351232873,41.8034600736486],[-71.4398046077187,41.8034753319855],[-71.4397435704118,41.8034944061702],[-71.439728310205,41.8035020339757],[-71.4396215017949,41.8035439960063],[-71.4394841715462,41.8036050300389],[-71.4392552888798,41.8037385453775],[-71.4391637377203,41.8038110258747],[-71.4390264075721,41.8039292806633],[-71.4386525665472,41.8042726039405],[-71.4385610138472,41.8043565264092],[-71.4383168733784,41.8045777791284],[-71.4378743699948,41.8049859524627],[-71.4377751863811,41.8050584322111],[-71.4373555708998,41.8053826805427],[-71.4373021655828,41.8054246415995],[-71.4368978058632,41.8057221896937],[-71.4367909938579,41.8058099270035],[-71.4366155185892,41.8059892173202],[-71.4362950846175,41.8063477996527],[-71.4357152520924,41.8070115568023],[-71.4357076199249,41.8070191865363],[-71.4356999913666,41.8070268153714],[-71.4350743812689,41.8077401650512],[-71.434540322717,41.8083314418942],[-71.4340596701226,41.808903646997],[-71.4335561308617,41.8094758521012],[-71.4334493190129,41.8096436986938],[-71.4331059970752,41.8099793917457],[-71.4326177160512,41.8104333415812],[-71.432053140243,41.8110017316911],[-71.4320302510604,41.8110208045003],[-71.4315648574102,41.8114747543114],[-71.4314122709196,41.8116120824952],[-71.4312901989366,41.8117074493882],[-71.4311833868596,41.8117799304991],[-71.4311376102897,41.8118142637147],[-71.4310613175848,41.8118676676509],[-71.4303670422144,41.8122109895205],[-71.4303441543472,41.8122224342949],[-71.429588843668,41.8126115328046],[-71.4286427982103,41.8130921852916],[-71.4276433481786,41.8135995400659],[-71.4269338144714,41.8139657514582],[-71.4263768677539,41.8142518539185],[-71.4262319096852,41.8143281476953],[-71.4260945808119,41.8144196997809],[-71.4258962157622,41.8145455864794],[-71.4258046622035,41.8146104365978],[-71.4256749631918,41.8147096180958],[-71.425133277013,41.8151063456971],[-71.4250646149902,41.8151559358451],[-71.4245152958628,41.8155679244079],[-71.4241567139607,41.8158273241275],[-71.4233556256394,41.8164147872462],[-71.422821569697,41.8168038866268],[-71.4227071278136,41.8168878097016],[-71.4224400989163,41.8170785452367],[-71.4222646244251,41.8171777279386],[-71.4220433695039,41.8172997974919],[-71.4217153057514,41.8174714593864],[-71.4216618999726,41.817498162205],[-71.4213490949572,41.8176888963696],[-71.4211354722473,41.817784264377],[-71.4201741685755,41.8182305845211],[-71.4196019639912,41.8184823529275],[-71.4192815278492,41.8186234979229],[-71.4192281236907,41.8186463866624],[-71.4188313940358,41.8188180468974],[-71.4187245838349,41.8188638230296],[-71.4185414777496,41.8189324883679],[-71.4185340708503,41.8189353371955],[-71.4184422955685,41.8189706356567],[-71.4183354848363,41.8190164123257],[-71.41831733163151,41.819020088023876],[-71.4182386090508,41.8189585442453],[-71.4181558116032,41.8188942432757],[-71.4180775818552,41.8188337881573],[-71.4179182479411,41.8187115359981],[-71.4177130250939,41.8185557994935],[-71.4174344018787,41.8183474029742],[-71.4172819652567,41.8182348407459],[-71.4170510729226,41.8180662718095],[-71.4166289873385,41.8177639685267],[-71.4165513860438,41.817709239882],[-71.4165405421919,41.8177015944126],[-71.4164293014267,41.8176236610636],[-71.416382654829,41.8175912508607],[-71.4163820247302,41.8175908128364],[-71.4162905281809,41.817527237953],[-71.4161880368534,41.8174565890995],[-71.4160782135473,41.8173814096841],[-71.4159027586724,41.8172624210629],[-71.4156950153473,41.8171232849591],[-71.4155964612142,41.817057931567],[-71.4154863842194,41.8169854281082],[-71.4154765475959,41.8169789987387],[-71.4153680442434,41.8169080746212],[-71.4153680322174,41.8169080674096],[-71.4152876062494,41.8168558018564],[-71.4151399469956,41.8167611669708],[-71.4151152218115,41.8167452504815],[-71.4150115700191,41.816678526099],[-71.4148766991265,41.816594904301],[-71.4147816398381,41.8165346118102],[-71.4146743949232,41.8164651843326],[-71.4145629880417,41.8163987328875],[-71.4145574392704,41.8163954380139],[-71.4144218661634,41.8163149267346],[-71.4143368625818,41.8162660117714],[-71.4142397463733,41.8162101244647],[-71.4140011319367,41.8160782982022],[-71.4137230725531,41.8159321678147],[-71.4135010724273,41.8158210176148],[-71.4134097760203,41.8157772462743],[-71.4132766275313,41.8157134088813],[-71.4129348800404,41.815554410322],[-71.4126476927151,41.8154359459897],[-71.4124778345873,41.8153668019471],[-71.4117662176313,41.8151524715469],[-71.4117151264628,41.8151370805748],[-71.4098998665615,41.8145902579131],[-71.4097994353575,41.814561605866],[-71.4097413411649,41.8145450317696],[-71.4094212469979,41.8144608238944],[-71.409259773243,41.8144218665387],[-71.4090974205388,41.8143850258632],[-71.4089342285813,41.814350305497],[-71.4087702550995,41.8143177225891],[-71.4086055433916,41.8142872861738],[-71.4084401499953,41.8142590043963],[-71.4082759808138,41.814233178589],[-71.4081075069751,41.8142089391066],[-71.4080985906794,41.8142077786367],[-71.4079403607994,41.8141871700776],[-71.4077727314035,41.8141675873466],[-71.407604671717,41.8141501963563],[-71.4074362322661,41.8141349998465],[-71.4072674623631,41.814122007759],[-71.4070984161495,41.8141112192359],[-71.4069291441474,41.8141026397189],[-71.4068315214924,41.8140989709247],[-71.406815143922,41.8140983715186],[-71.4067596438278,41.8140963412324],[-71.4065901297005,41.8140921141702],[-71.4065228459031,41.8140910789684],[-71.4063971101401,41.814090291427],[-71.4063874748198,41.8140903574036],[-71.4062713743945,41.8140911450703],[-71.406254670528,41.8140914771715],[-71.4062362046849,41.8140918447461],[-71.406145678371,41.8140936408313],[-71.4060200593723,41.8140977760394],[-71.4058945558969,41.8141035534276],[-71.4057692064616,41.814110963124],[-71.4056440495597,41.8141200114631],[-71.4055191212947,41.8141306930732],[-71.405394462584,41.8141430025867],[-71.4052670087644,41.8141573057168],[-71.4051792331407,41.8141683462135],[-71.4050917301933,41.8141805330031],[-71.4050045227973,41.8141938571015],[-71.4049176410359,41.8142083185344],[-71.4046592023225,41.8142584784385],[-71.4042566590777,41.8143588189211],[-71.4041546113111,41.8143887791169],[-71.4039908061076,41.8144409053483],[-71.4037067417875,41.8145377117819],[-71.4035352680073,41.8146068644916],[-71.40290131637471,41.814921574749576],[-71.402897996,41.8149151870001],[-71.4028651149999,41.81486654],[-71.402816903,41.8148088020001],[-71.402794392,41.81475655],[-71.402480404,41.8142600790001],[-71.40245505,41.814207116],[-71.402288093,41.8138583410001],[-71.402254157,41.813801186],[-71.4022257079999,41.8137333560001],[-71.402236225,41.813672351],[-71.402325159,41.813665955],[-71.402134765,41.8133322300001],[-71.401983205,41.813333427],[-71.401357111,41.8122688550001],[-71.4013563409999,41.8122128950001],[-71.40136304,41.812150446],[-71.401401962,41.812124592],[-71.40142029,41.812112465],[-71.401495683,41.8120849270001],[-71.4015817769999,41.812075716],[-71.401653903,41.812085085],[-71.401744869,41.8120879300001],[-71.4018011479999,41.8120456710001],[-71.401856368,41.811996299],[-71.4019201419999,41.8119504330001],[-71.401993051,41.811947751],[-71.402008154,41.8119454770001],[-71.402075129,41.811925112],[-71.402155232,41.8118954060001],[-71.4022240479999,41.811870056],[-71.402290937,41.8118454390001],[-71.4023855309999,41.8118347930001],[-71.402467299,41.811856085],[-71.4025441639999,41.811864703],[-71.40256663,41.8118446890001],[-71.402572463,41.8117886430001],[-71.402623836,41.811735791],[-71.402685767,41.811694909],[-71.402757174,41.8116539430001],[-71.4028429059999,41.8116206490001],[-71.402912586,41.8115896300001],[-71.4029641509999,41.8115509560001],[-71.402982632,41.8115189100001],[-71.403037876,41.811472419],[-71.403102513,41.8114208590001],[-71.4031198279999,41.81137182],[-71.403111281,41.811303138],[-71.403068757,41.8112446490001],[-71.402997413,41.811223962],[-71.4029114319999,41.8112402410001],[-71.402839638,41.811254999],[-71.402767733,41.8112612030001],[-71.4026938499999,41.8112618270001],[-71.402607511,41.8112525610001],[-71.402597428,41.8112093990001],[-71.4025965449999,41.811146326],[-71.4026241989999,41.8110922430001],[-71.402697613,41.811057659],[-71.4027643909999,41.8110252180001],[-71.4028357449999,41.810978581],[-71.4028881199999,41.8109299830001],[-71.402887316,41.8108747100001],[-71.4028831689999,41.8108683030001],[-71.402715897,41.8106095840001],[-71.402773396,41.810588571],[-71.402657201,41.8104123140001],[-71.402654922,41.8103839780001],[-71.400835843,41.810973876],[-71.4007831609999,41.8108650900001],[-71.401212205,41.81072564],[-71.401174343,41.810658625],[-71.40144486,41.8105622140001],[-71.401490359,41.8106320480001],[-71.402539024,41.8102941880001],[-71.40239539,41.8100522070001],[-71.4023728509999,41.8099992460001],[-71.402450109,41.809968874],[-71.402042006,41.809308695],[-71.40201473,41.8092557310001],[-71.4024785729999,41.8090975540001],[-71.4024783259999,41.80907983],[-71.402462365,41.809022553],[-71.4024284,41.80896613],[-71.402383148,41.8089147520001],[-71.402340685,41.8088583890001],[-71.402292111,41.8088403730001],[-71.4022163069999,41.808840241],[-71.4021225549999,41.8088430880001],[-71.402047922,41.8088557390001],[-71.40197039,41.8088663070001],[-71.40186697,41.8088550360001],[-71.401796383,41.8088208780001],[-71.401761554,41.8087701260001],[-71.4017606159999,41.8087035080001],[-71.401746492,41.808704983],[-71.4016868479999,41.808711175],[-71.401614052,41.808722387],[-71.401539741,41.808625863],[-71.401505806,41.808569463],[-71.40146036,41.808505299],[-71.4014188739999,41.808450355],[-71.401387698,41.8083896360001],[-71.401355517,41.8083261240001],[-71.4013175709999,41.808255542],[-71.40127684,41.808187106],[-71.4012303659999,41.8081159220001],[-71.401225976,41.8081090110001],[-71.401088323,41.807839545],[-71.401070755,41.8078145120001],[-71.4008971,41.8075238600001],[-71.4008443239999,41.8074767960001],[-71.3987666199999,41.8079956830001],[-71.398611619,41.8076857660001],[-71.398930481,41.807589014],[-71.398903745,41.807506275],[-71.3993086899999,41.807403149],[-71.399357411,41.8075005900001],[-71.4006616729999,41.8071536410001],[-71.4005685349999,41.8069984410001],[-71.400649728,41.806971618],[-71.400650927,41.8069276430001],[-71.4006301749999,41.8068668390001],[-71.400574475,41.8068134160001],[-71.400514312,41.806779883],[-71.400450362,41.806745662],[-71.4003908989999,41.8066944070001],[-71.40032751,41.806633248],[-71.400257515,41.8065735220001],[-71.400194238,41.806519451],[-71.400160387,41.8064701390001],[-71.4001586699999,41.806414132],[-71.400157843,41.806356045],[-71.400170281,41.806298541],[-71.4001911949999,41.8062345720001],[-71.400199761,41.806170707],[-71.400201639,41.8061026520001],[-71.4002006759999,41.8060339300001],[-71.400199657,41.8059623500001],[-71.400189139,41.8058851810001],[-71.400178865,41.805829282],[-71.4001710759999,41.8057471070001],[-71.400153002,41.805674964],[-71.400120854,41.8056114290001],[-71.400082992,41.805547226],[-71.400041398,41.805485193],[-71.39998846,41.8054260770001],[-71.399929922,41.8053712550001],[-71.3998553,41.8053208110001],[-71.399798931,41.8052865270001],[-71.3997444299999,41.8052501180001],[-71.399693691,41.805211517],[-71.399641894,41.8051658480001],[-71.3995853329999,41.8051181180001],[-71.399525008,41.8050717780001],[-71.399465715,41.8050311580001],[-71.3993854939999,41.804985007],[-71.399303543,41.804950929],[-71.3992242149999,41.8049005250001],[-71.399174396,41.80486053],[-71.3991273619999,41.804818364],[-71.399079975,41.8047485500001],[-71.399066722,41.8046820590001],[-71.3990658709999,41.8046203810001],[-71.399068808,41.8045608570001],[-71.399067956,41.804499202],[-71.399060251,41.804423431],[-71.399037633,41.8043654840001],[-71.399013122,41.8043061180001],[-71.398987747,41.8042517600001],[-71.3989632879999,41.8041980880001],[-71.3989416479999,41.804140143],[-71.3989180849999,41.8040807780001],[-71.398888862,41.8040243120001],[-71.398852115,41.803971452],[-71.3988087929999,41.803921469],[-71.398749198,41.8038602880001],[-71.398711534,41.8038074520001],[-71.398707811,41.8037457940001],[-71.398740983,41.8036810360001],[-71.398786419,41.8036112120001],[-71.398829098,41.8035456850001],[-71.3988575339999,41.8034802600001],[-71.398862257,41.8034121600001],[-71.398837605,41.803344333],[-71.398794928,41.803273081],[-71.398761109,41.803225142],[-71.398726314,41.8031750970001],[-71.398667583,41.803108955],[-71.3986005739999,41.8030591790001],[-71.398527018,41.8030136510001],[-71.3984477189999,41.802966128],[-71.398373076,41.802912114],[-71.398316408,41.802855831],[-71.398295741,41.802802162],[-71.398293914,41.802739774],[-71.398294876,41.8026724270001],[-71.398299488,41.8025972610001],[-71.398311682,41.8025206390001],[-71.3983523799999,41.802450879],[-71.3984112749999,41.8023937130001],[-71.398476909,41.802345701],[-71.398533205,41.8023084070001],[-71.398599195,41.802285893],[-71.398681075,41.802246998],[-71.3987353919999,41.8022040290001],[-71.398787791,41.8021568510001],[-71.398823078,41.8021076690001],[-71.3988231169999,41.802043865],[-71.398772519,41.8020145020001],[-71.398699816,41.8020299670001],[-71.3986292229999,41.8020638410001],[-71.398560666,41.8021047610001],[-71.39847795,41.802150769],[-71.3983885759999,41.8021932950001],[-71.398293296,41.802222391],[-71.3982064639999,41.8022429420001],[-71.398135843,41.8022739580001],[-71.3980643849999,41.802312817],[-71.397991006,41.8023495250001],[-71.397912918,41.8023869830001],[-71.397843027,41.8024017170001],[-71.397740841,41.8024089210001],[-71.397649724,41.8023954390001],[-71.3975725939999,41.8023676990001],[-71.3974915699999,41.802330053],[-71.39741219,41.802276835],[-71.397372686,41.8022296680001],[-71.39732931,41.802176139],[-71.397279246,41.802119105],[-71.397225341,41.802057174],[-71.397180045,41.8020008080001],[-71.397141158,41.8019302450001],[-71.397124145,41.8018665870001],[-71.3971241199999,41.8018630650001],[-71.3971176969999,41.801808517],[-71.3971112139999,41.8017533060001],[-71.397093148,41.8016790350001],[-71.3970884779999,41.8016181080001],[-71.397087631,41.801555745],[-71.397086067,41.8009092880001],[-71.397086073,41.800905836],[-71.396534472,41.801288621],[-71.396541407,41.8013098270001],[-71.395678375,41.8019105400001],[-71.395540822,41.801827996],[-71.39551361,41.8017778890001],[-71.395406728,41.8018552710001],[-71.395344267,41.8017926680001],[-71.395695772,41.801529105],[-71.395748292,41.8015598650001],[-71.396379746,41.80112824],[-71.39652867,41.8010767590001],[-71.397502457,41.800407874],[-71.396544217,41.7996194610001],[-71.396534776,41.799617852],[-71.396516688,41.799614702],[-71.396433315,41.7996146730001],[-71.3963564649999,41.7996060510001],[-71.396271256,41.799607414],[-71.396210386,41.79965822],[-71.396185686,41.7997186630001],[-71.396151564,41.7997848370001],[-71.396093755,41.7998505090001],[-71.3960348109999,41.7999012930001],[-71.395957778,41.799948676],[-71.395880915,41.8000052530001],[-71.39581623,41.800052555],[-71.395736056,41.800076586],[-71.395644266,41.80008366],[-71.395555236,41.80008438],[-71.395477467,41.8000771740001],[-71.395400318,41.8000458880001],[-71.395343007,41.8000123100001],[-71.395281881,41.7999759620001],[-71.395226411,41.799938109],[-71.395152695,41.7998819900001],[-71.395101661,41.7998221650001],[-71.395083759,41.7997613630001],[-71.3950952279999,41.7997003140001],[-71.395144618,41.799643234],[-71.395200586,41.799581104],[-71.3952698429999,41.799523149],[-71.39532522,41.7994865640001],[-71.39538447,41.7994549220001],[-71.395442714,41.799421174],[-71.39549327,41.799379668],[-71.395568296,41.7993259030001],[-71.395646216,41.7992771040001],[-71.395715556,41.7992234020001],[-71.395766005,41.7991727020001],[-71.395785941,41.799109442],[-71.3957858209999,41.799032923],[-71.3957658319999,41.798958672],[-71.395738401,41.798894364],[-71.395694028,41.798835184],[-71.395634633,41.798787449],[-71.395572997,41.7987830020001],[-71.3955033569999,41.7988147040001],[-71.395415825,41.798854347],[-71.395355657,41.7988867440001],[-71.39529078,41.7989212620001],[-71.395224927,41.7989536530001],[-71.395163813,41.7989853620001],[-71.3951113059999,41.799024054],[-71.395063947,41.799091725],[-71.395013664,41.799153081],[-71.394934795,41.799202612],[-71.394860719,41.799254913],[-71.3948120269999,41.799296376],[-71.394756733,41.799338655],[-71.394693836,41.7993767200001],[-71.394624219,41.799411257],[-71.394552709,41.7994458370001],[-71.394484098,41.799482524],[-71.3944182989999,41.7995191680001],[-71.3943346629999,41.799567322],[-71.394277556,41.7996152700001],[-71.39423477,41.799670162],[-71.394193904,41.799728599],[-71.394160646,41.7997884160001],[-71.3941263039999,41.7998383070001],[-71.3940575249999,41.799865046],[-71.393960245,41.799884235],[-71.393871598,41.799912556],[-71.39379259,41.7999521830001],[-71.393719377,41.7999995220001],[-71.393653907,41.8000581430001],[-71.393586511,41.8001174940001],[-71.393535002,41.800161125],[-71.39347121,41.800203465],[-71.393401673,41.8002444040001],[-71.393331218,41.8002867600001],[-71.3932645529999,41.8003283890001],[-71.393201652,41.8003678700001],[-71.393142457,41.800401638],[-71.3930633099999,41.8004320260001],[-71.392983191,41.800459576],[-71.3928971679999,41.800471594],[-71.392806919,41.800452459],[-71.392743004,41.8004203840001],[-71.392700637,41.800370376],[-71.392653393,41.8003119250001],[-71.392602472,41.8002591650001],[-71.392548897,41.800222021],[-71.392465497,41.8002191310001],[-71.392385861,41.800214071],[-71.392334609,41.8002130400001],[-71.392285436,41.800212033],[-71.392191644,41.8002099550001],[-71.392112035,41.800206313],[-71.391711344,41.7998354160001],[-71.391675816,41.7998082830001],[-71.3916398009999,41.799780098],[-71.391604703,41.79975125],[-71.391569573,41.7997230650001],[-71.3915344759999,41.799693555],[-71.391496689,41.799664681],[-71.3914589349999,41.7996344590001],[-71.3914211489999,41.7996049220001],[-71.391383424,41.799574723],[-71.391343865,41.799545848],[-71.3913025319999,41.799517612],[-71.391262973,41.7994887140001],[-71.3912243,41.7994591770001],[-71.3911874629999,41.799428978],[-71.3911532559999,41.799398163],[-71.3911208169999,41.7993686550001],[-71.391090151,41.7993398340001],[-71.3910594549999,41.7993110130001],[-71.39102787,41.7992835410001],[-71.39099543,41.7992553810001],[-71.390962993,41.7992258730001],[-71.3909305569999,41.7991957240001],[-71.3908963489999,41.7991648870001],[-71.390861286,41.7991340500001],[-71.390824422,41.799101884],[-71.390787588,41.7990703360001],[-71.390752493,41.7990401610001],[-71.390716512,41.7990093230001],[-71.390680531,41.7989791470001],[-71.3906436949999,41.7989482630001],[-71.390605944,41.7989173990001],[-71.3905681909999,41.7988865820001],[-71.390528666,41.7988556720001],[-71.3904900269999,41.7988248080001],[-71.3904505039999,41.7987932570001],[-71.390411866,41.7987623930001],[-71.3903732589999,41.798730866],[-71.390334651,41.79869998],[-71.390295125,41.7986691140001],[-71.390257375,41.7986376110001],[-71.390220541,41.7986060630001],[-71.3901845619999,41.7985745610001],[-71.3901477269999,41.7985436980001],[-71.39011175,41.798512196],[-71.390075801,41.7984806950001],[-71.390038937,41.798449169],[-71.390002103,41.7984176210001],[-71.3899643519999,41.7983861170001],[-71.389926601,41.798354568],[-71.389888882,41.798323064],[-71.38985113,41.798292201],[-71.389810719,41.7982613350001],[-71.3897711939999,41.798231087],[-71.3897316709999,41.7981995590001],[-71.389693065,41.7981680080001],[-71.389654429,41.798136481],[-71.3896131659999,41.79810358],[-71.389570133,41.798069372],[-71.389524442,41.7980350930001],[-71.389479637,41.798000884],[-71.389437491,41.7979659920001],[-71.389395376,41.797931099],[-71.3893532289999,41.797897533],[-71.389311967,41.7978646540001],[-71.3892698179999,41.797831751],[-71.389228558,41.7977982080001],[-71.389188185,41.7977633630001],[-71.389148731,41.79772781],[-71.3891083569999,41.797693628],[-71.389067096,41.7976600850001],[-71.389026752,41.797626544],[-71.388985492,41.797592292],[-71.388943347,41.797558085],[-71.388898543,41.7975231670001],[-71.388852884,41.7974882710001],[-71.388807195,41.797453374],[-71.3887623919999,41.7974184330001],[-71.3887185039999,41.7973835390001],[-71.388672782,41.797349968],[-71.3886271229999,41.797315735],[-71.3885805469999,41.797280793],[-71.388534004,41.7972445460001],[-71.388490088,41.7972089880001],[-71.388445318,41.7971734070001],[-71.388402285,41.7971398620001],[-71.388358366,41.7971062720001],[-71.3883162189999,41.797072728],[-71.388274076,41.797037835],[-71.3882328509999,41.797000998],[-71.38819166,41.7969634310001],[-71.3881495809999,41.796926548],[-71.388108356,41.796890353],[-71.388068873,41.7968548220001],[-71.388049251,41.796837856],[-71.388028532,41.7968199760001],[-71.3879855,41.7967863860001],[-71.387941615,41.796750828],[-71.387895961,41.7967139190001],[-71.3878494209999,41.7966763680001],[-71.3878037659999,41.796639413],[-71.387758111,41.7966032140001],[-71.387712456,41.796566259],[-71.387668608,41.7965280710001],[-71.387624758,41.7964905000001],[-71.387583568,41.796452292],[-71.387542343,41.796416096],[-71.3875020039999,41.7963805410001],[-71.3874616319999,41.796346999],[-71.387422113,41.79631412],[-71.387381739,41.79628195],[-71.387343136,41.7962497130001],[-71.38730542,41.7962168600001],[-71.3872676729999,41.7961846920001],[-71.3872308429999,41.796152502],[-71.387194014,41.7961203350001],[-71.3871554099999,41.796088098],[-71.3871150049999,41.796056546],[-71.387075485,41.796024376],[-71.387033339,41.795991472],[-71.386991161,41.795959254],[-71.386949048,41.7959250010001],[-71.38690779,41.795890795],[-71.386866566,41.7958552380001],[-71.386826196,41.7958203690001],[-71.386784968,41.7957868490001],[-71.3867427929999,41.795753259],[-71.3867015339999,41.7957197380001],[-71.38666116,41.7956875],[-71.386621674,41.7956546440001],[-71.3865821859999,41.7956217870001],[-71.386544471,41.795588911],[-71.386507643,41.7955567440001],[-71.3864699279999,41.79552389],[-71.386432182,41.795491699],[-71.3863935799999,41.795459485],[-71.386354947,41.795427933],[-71.386316313,41.7953964280001],[-71.3862785979999,41.7953642140001],[-71.386239997,41.795332022],[-71.386202281,41.795299809],[-71.38616365,41.795267616],[-71.3861241609999,41.7952354010001],[-71.386082901,41.7952031830001],[-71.386039839,41.7951709880001],[-71.3859968099999,41.795136733],[-71.385954667,41.7951025020001],[-71.3859125549999,41.7950682950001],[-71.385873069,41.7950354390001],[-71.3858318119999,41.7950018720001],[-71.3857887469999,41.7949702700001],[-71.38574657,41.7949380520001],[-71.38570528,41.794905812],[-71.385665794,41.7948729560001],[-71.3856271939999,41.794840101],[-71.3855885949999,41.7948072460001],[-71.385549961,41.794776379],[-71.385511326,41.7947461320001],[-71.385473576,41.7947166390001],[-71.3854375669999,41.7946877430001],[-71.38540159,41.794658252],[-71.385364728,41.7946273650001],[-71.385327014,41.794595197],[-71.3852893,41.794562983],[-71.385251554,41.794531455],[-71.3852138079999,41.7944999260001],[-71.385175236,41.794468421],[-71.385138378,41.794436207],[-71.385099748,41.794403329],[-71.385059376,41.794370472],[-71.385017263,41.7943375670001],[-71.384975121,41.7943040220001],[-71.384933863,41.794271118],[-71.384894378,41.794237599],[-71.384854864,41.7942040570001],[-71.384816295,41.7941711780001],[-71.384779437,41.794139011],[-71.384743461,41.7941088110001],[-71.3847065689999,41.794079319],[-71.3846682079999,41.794049962],[-71.384633692,41.79402356],[-71.384599452,41.793997387],[-71.384564326,41.7939705270001],[-71.3845309399999,41.793944331],[-71.3844958179999,41.793916145],[-71.384460727,41.7938866310001],[-71.384426557,41.7938551290001],[-71.384391471,41.7938236260001],[-71.384354645,41.7937907730001],[-71.3843169639999,41.793757278],[-71.384278369,41.793722433],[-71.384238921,41.7936869010001],[-71.3841994699999,41.793651368],[-71.3841573299999,41.793617114],[-71.38411522,41.793582928],[-71.3840721939999,41.79354865],[-71.3840282799999,41.793514417],[-71.38398348,41.7934808470001],[-71.383939567,41.7934466130001],[-71.383897425,41.7934137080001],[-71.383857055,41.793380187],[-71.383818425,41.7933479490001],[-71.383780712,41.7933157570001],[-71.383742967,41.7932849150001],[-71.383704334,41.7932540260001],[-71.383663929,41.793223798],[-71.383622637,41.79319357],[-71.3835813119999,41.79316469],[-71.383540873,41.7931364740001],[-71.3835004329999,41.7931082360001],[-71.383461734,41.7930806630001],[-71.383423953,41.7930531370001],[-71.38338886,41.793025635],[-71.383354593,41.7929974260001],[-71.383321274,41.7929692640001],[-71.383289728,41.7929404400001],[-71.3832581519999,41.792911616],[-71.383228378,41.7928834570001],[-71.383199455,41.792857358],[-71.3831704999999,41.792832516],[-71.383087847,41.792776723],[-71.38308441,41.792768052],[-71.382960472,41.79261251],[-71.382657351,41.7922320980001],[-71.3819977209999,41.791394332],[-71.381904579,41.7912784970001],[-71.380363201,41.7893529040001],[-71.3798489179999,41.7887009950001],[-71.3798606189999,41.788669494],[-71.37988525,41.788652117],[-71.379891995,41.788640254],[-71.379887744,41.7886086230001],[-71.3798721109999,41.788586035],[-71.3798535989999,41.7885669660001],[-71.379851635,41.7885058580001],[-71.379851392,41.7883907360001],[-71.379845242,41.788296647],[-71.379794869,41.788207087],[-71.3797063329999,41.788099694],[-71.3796279159999,41.7880064440001],[-71.379553959,41.78793003],[-71.379489736,41.7878284710001],[-71.37942538,41.7877331770001],[-71.379354478,41.78764069],[-71.379276311,41.7875291220001],[-71.37920187,41.7874183590001],[-71.379138454,41.787326589],[-71.3790882179999,41.787230052],[-71.379063494,41.78711822],[-71.379074073,41.7870333660001],[-71.379126392,41.7869811200001],[-71.3791756109999,41.7870173040001],[-71.379214013,41.7870857],[-71.379246858,41.7871526480001],[-71.379319091,41.787218495],[-71.379415146,41.787258593],[-71.379489806,41.787285108],[-71.379601076,41.787309899],[-71.379751563,41.78727875],[-71.379819584,41.7872449060001],[-71.3798925259999,41.787192819],[-71.3799646959999,41.7871295250001],[-71.380020915,41.787066054],[-71.380064136,41.78699269],[-71.380103842,41.7869038630001],[-71.380103005,41.7868280760001],[-71.3800637269999,41.786753322],[-71.38,41.786686135],[-71.3799265649999,41.7866364330001],[-71.379841088,41.7865775020001],[-71.37975076,41.7865311670001],[-71.379638541,41.7865078150001],[-71.3795552029999,41.7864980310001],[-71.379517224,41.78646474],[-71.379569509,41.786413226],[-71.379626324,41.7863743620001],[-71.379685283,41.7863165430001],[-71.3797648629999,41.7862603240001],[-71.379827576,41.786204635],[-71.3798677039999,41.78615089],[-71.379943457,41.7860988730001],[-71.380002712,41.78605502],[-71.380049132,41.786059175],[-71.3800660909999,41.7860588070001],[-71.381045719,41.7860925420001],[-71.382720161,41.7861388580001],[-71.38501127,41.7861362850001],[-71.3868619679999,41.786169853],[-71.388925361,41.786189962],[-71.390489395,41.786211445],[-71.3915611749999,41.7862341580001],[-71.3918181499999,41.7862557970001],[-71.392031329,41.7862243530001],[-71.3923615859999,41.7862084550001],[-71.393126391,41.7861654750001],[-71.393816828,41.7861240500001],[-71.394520326,41.7860823770001],[-71.394903308,41.7860563570001],[-71.395005689,41.7860902400001],[-71.3952556199999,41.7860760180001],[-71.396019434,41.7860060470001],[-71.397297442,41.785970363],[-71.3982444059999,41.785941576],[-71.3987960429999,41.785921053],[-71.399493133,41.785870425],[-71.400007312,41.7858416720001],[-71.400697956,41.7858092120001],[-71.401322442,41.785805161],[-71.4017703759999,41.7857867640001],[-71.4047736859999,41.785651822],[-71.404803543,41.7854531030001],[-71.4048344029999,41.7852723080001],[-71.404760602,41.7852017960001],[-71.4045558619999,41.7850349980001],[-71.404387588,41.784849364],[-71.4042552339999,41.7846270110001],[-71.4041306249999,41.7845125490001],[-71.404035877,41.784352402],[-71.403948219,41.784201137],[-71.4038752279999,41.7840495410001],[-71.4038088039999,41.7839518930001],[-71.403714717,41.783809756],[-71.403677976,41.7836304050001],[-71.403634664,41.783478191],[-71.403553776,41.783245718],[-71.403525959,41.783075207],[-71.403482836,41.782796929],[-71.403476326,41.782553885],[-71.403525476,41.782327696],[-71.403591487,41.7821642110001],[-71.4036736149999,41.781874288],[-71.4037620559999,41.7815752380001],[-71.403814386,41.781366975],[-71.403917626,41.781130669],[-71.4041020019999,41.7808836250001],[-71.405205909,41.779572655],[-71.405449048,41.7796395760001],[-71.405907386,41.7794498690001],[-71.4059522489999,41.7791697340001],[-71.405953755,41.779079645],[-71.407996152,41.7781632140001],[-71.408496328,41.778026615],[-71.4090259339999,41.7780605240001],[-71.409157159,41.7780307420001],[-71.4102989099999,41.7739540050001],[-71.41124696,41.77308751],[-71.4118788439999,41.7725216420001],[-71.4131128719999,41.7730267420001],[-71.4140105499999,41.773251487],[-71.41472119,41.77344808],[-71.4155809869999,41.7740369000001],[-71.417711889,41.775466899],[-71.4185718809999,41.7759436630001],[-71.4238012979999,41.7768758460001],[-71.422462341,41.7804975930001],[-71.422055851,41.7815238430001],[-71.421738421,41.7823231080001],[-71.421464801,41.7831754430001],[-71.421131127,41.7841281170001],[-71.420806081,41.7850446050001],[-71.420628366,41.7855076610001],[-71.4204874169999,41.7858888870001],[-71.420391976,41.786161103],[-71.420759101,41.786162344],[-71.4212509079999,41.786151961],[-71.422117091,41.7861156760001],[-71.422895718,41.78609026],[-71.424504785,41.786119328],[-71.42645034,41.7860871870001],[-71.428058396,41.7860982390001],[-71.4340506789999,41.7860883710001],[-71.4368562889999,41.78892325],[-71.4369584139999,41.7893049030001],[-71.437082182,41.789644487],[-71.437170662,41.7904414050001],[-71.437193281,41.7904971940001],[-71.4372721619999,41.79073672],[-71.437310606,41.7910167920001],[-71.4373120019999,41.7910269240001],[-71.4373133669999,41.7910370330001],[-71.437321894,41.791099058],[-71.437366814,41.7915374770001],[-71.43737218,41.7915822570001],[-71.437384881,41.7916882150001],[-71.437417376,41.7919599140001],[-71.4374312319999,41.7921666330001],[-71.4374385199999,41.7922753330001],[-71.437445539,41.792380144],[-71.437470124,41.792740387],[-71.437547029,41.793037129],[-71.43765021,41.793242455],[-71.437774922,41.793400363],[-71.4379472639999,41.793538035],[-71.43815123,41.7937155380001],[-71.4383515059999,41.793885356],[-71.438456692,41.7940111440001],[-71.4384904149999,41.7940917060001],[-71.43855051,41.794235309],[-71.43873867,41.794935652],[-71.438851087,41.795367749],[-71.438883915,41.7954892920001],[-71.438992298,41.795890376],[-71.439068063,41.7961752470001],[-71.4391557339999,41.7965049470001],[-71.439254919,41.7968763430001],[-71.439293047,41.7970190870001],[-71.4393503759999,41.7972489490001],[-71.439368492,41.7973855770001],[-71.439368809,41.7976010470001],[-71.4393628889999,41.7976893850001],[-71.439343175,41.7979825530001],[-71.4393091009999,41.7986285320001],[-71.439297177,41.7988926140001],[-71.4392755439999,41.7993729620001],[-71.439273032,41.799444082],[-71.439252148,41.8000379740001],[-71.439251261,41.800298105],[-71.439239346,41.800455551],[-71.439237194,41.8006299470001],[-71.439243479,41.8006731030001],[-71.43924994,41.8007254770001],[-71.43925488,41.8008984350001],[-71.439255826,41.8009323960001],[-71.4392489379999,41.801301015],[-71.439240898,41.8015937760001],[-71.4392415519999,41.801613581],[-71.4392477329999,41.801799965],[-71.439255083,41.8019140150001],[-71.439275783,41.802034339],[-71.439317386,41.8021566400001],[-71.439376157,41.8022886690001],[-71.4395637549999,41.802614557],[-71.439806884,41.803042788],[-71.439837885,41.8030980780001],[-71.439948891,41.803296065],[-71.44000450996836,41.803394815557255]]]]}},{"type":"Feature","properties":{"OBJECTID":0,"zone":"East","path":null,"displayColor":"#E3330B"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-71.39965860767181,41.85662730506629],[-71.398456381,41.8566261650001],[-71.3975068839999,41.8566549930001],[-71.3963607969999,41.856669916],[-71.395228647,41.8566485640001],[-71.3940004949999,41.856692202],[-71.3922584969999,41.856701473],[-71.390970491,41.8567283],[-71.3887884499999,41.85674679],[-71.386590365,41.8567564740001],[-71.3848841399999,41.8567739870001],[-71.383451426,41.8567676540001],[-71.382480452,41.8568058550001],[-71.382119495,41.8568493930001],[-71.379129914,41.857317289],[-71.379157262,41.857288861],[-71.379184633,41.8572597790001],[-71.3792091889999,41.8572307150001],[-71.379230998,41.8571995680001],[-71.379249107,41.8571670690001],[-71.3792635149999,41.857133925],[-71.3792751409999,41.857100777],[-71.3792840149999,41.857066278],[-71.3792919429999,41.8570310910001],[-71.379296229,41.8569966100001],[-71.379298617,41.8569628820001],[-71.379298283,41.856929081],[-71.379297889,41.8568946410001],[-71.37929753,41.856857457],[-71.379298034,41.8568174820001],[-71.3792985439999,41.856774079],[-71.379298077,41.856729278],[-71.379298529,41.856683839],[-71.379298063,41.856639016],[-71.379297623,41.856596344],[-71.3792972109999,41.85655566],[-71.3792958779999,41.856515707],[-71.379290875,41.8564764820001],[-71.3792830849999,41.8564379410001],[-71.3792725719999,41.8564007910001],[-71.379262975,41.8563636430001],[-71.379257079,41.856327161],[-71.379257636,41.8562913490001],[-71.3792637,41.8562547660001],[-71.3792706849999,41.8562168340001],[-71.379275831,41.856180296],[-71.37927639,41.856143043],[-71.379276003,41.8561051730001],[-71.379274642,41.856064557],[-71.379271449,41.856021835],[-71.379264528,41.8559770740001],[-71.37925853,41.8559302560001],[-71.379253418,41.8558834620001],[-71.3792501999999,41.8558372860001],[-71.379249734,41.8557925320001],[-71.379250242,41.8557504770001],[-71.3792497979999,41.85570984],[-71.379244794,41.8556699280001],[-71.3792360899999,41.8556307000001],[-71.3792283029999,41.855591449],[-71.379220545,41.855552222],[-71.3792118389999,41.8555137020001],[-71.37920316,41.8554765310001],[-71.379193593,41.855440092],[-71.379184884,41.855402944],[-71.379174372,41.8553650850001],[-71.379162913,41.8553265620001],[-71.379149592,41.8552859800001],[-71.3791344379999,41.8552440460001],[-71.379120171,41.8552014270001],[-71.379105905,41.8551588080001],[-71.379094395,41.85511546],[-71.379086582,41.855073442],[-71.3790806339999,41.855032158],[-71.3790774669999,41.8549915400001],[-71.3790761349999,41.854952251],[-71.379078474,41.8549123020001],[-71.379084517,41.8548708930001],[-71.379095147,41.8548294890001],[-71.379108559,41.854789483],[-71.3791247519999,41.854750784],[-71.379142805,41.8547148540001],[-71.3791627209999,41.854680983],[-71.379183585,41.8546470920001],[-71.3792035,41.8546132440001],[-71.3792206649999,41.854577976],[-71.379235019,41.8545413780001],[-71.379247541,41.8545027210001],[-71.379258197,41.8544641070001],[-71.37926702,41.8544247820001],[-71.3792730869999,41.8543861630001],[-71.3792745379999,41.854346854],[-71.3792722869999,41.854307609],[-71.379265416,41.8542690460001],[-71.37925582,41.8542318740001],[-71.3792434699999,41.8541954550001],[-71.379230203,41.854158302],[-71.379218744,41.8541198250001],[-71.379207285,41.8540812790001],[-71.3791985779999,41.854042737],[-71.379189902,41.854004903],[-71.3791830879999,41.853968444],[-71.379176242,41.8539326470001],[-71.3791721809999,41.853896144],[-71.3791690419999,41.8538575850001],[-71.379165874,41.8538183160001],[-71.379159925,41.8537777180001],[-71.3791521109999,41.8537364090001],[-71.379140654,41.8536965150001],[-71.379125524,41.8536580110001],[-71.379107609,41.8536209220001],[-71.379086968,41.853585202],[-71.379067272,41.853551542],[-71.3790466579999,41.8535179040001],[-71.379026962,41.8534842660001],[-71.3790072369999,41.853449233],[-71.3789884619999,41.853413516],[-71.3789696279999,41.853377112],[-71.378953609,41.853340002],[-71.378941228,41.85330356],[-71.3789307449999,41.853267096],[-71.3789183929999,41.8532320480001],[-71.3789069869999,41.853197643],[-71.3788937149999,41.85316328],[-71.3788813639999,41.8531275460001],[-71.378870879,41.8530917460001],[-71.3788612819999,41.853055306],[-71.378854468,41.8530188],[-71.3788522409999,41.8529836720001],[-71.3788555789999,41.852949213],[-71.378866288,41.8529147150001],[-71.378881585,41.852880177],[-71.378897804,41.852844245],[-71.3789131039999,41.852808334],[-71.378926569,41.852772445],[-71.3789390869999,41.852735846],[-71.378951634,41.8526999320001],[-71.378964126,41.8526612520001],[-71.378976646,41.8526233260001],[-71.378986384,41.8525853520001],[-71.37899523,41.8525494570001],[-71.37900132,41.852514978],[-71.379006492,41.852481207],[-71.379011694,41.8524473890001],[-71.379017785,41.8524129100001],[-71.3790238509999,41.852375663],[-71.379028999,41.8523377750001],[-71.379031367,41.852298467],[-71.3790309239999,41.8522578290001],[-71.37902776,41.8522165030001],[-71.379025482,41.8521752],[-71.379024122,41.852133829],[-71.37902371,41.852093214],[-71.3790233239999,41.8520546340001],[-71.379022935,41.852017404],[-71.379020737,41.8519822980001],[-71.379017619,41.851949227],[-71.379015475,41.851918261],[-71.379012382,41.8518879330001],[-71.3790103219999,41.8518610840001],[-71.3790072479999,41.851836314],[-71.3790052379999,41.8518156390001],[-71.379004107,41.8517991260001],[-71.37900309,41.851787394],[-71.37900296,41.851775021],[-71.379002798,41.8517632900001],[-71.379002653,41.851743303],[-71.3790024899999,41.8517316160001],[-71.379002391,41.8517198850001],[-71.379002311,41.851713504],[-71.379002261,41.851707467],[-71.3790021029999,41.8516937000001],[-71.379001946,41.8516799110001],[-71.379001794,41.851663376],[-71.379005314,41.851645451],[-71.37901248,41.851624739],[-71.379022372,41.8516019730001],[-71.3790350209999,41.8515770820001],[-71.379048563,41.851548763],[-71.379063914,41.85151834],[-71.3790811009999,41.851487257],[-71.379099208,41.8514547570001],[-71.379117314,41.851422966],[-71.379135392,41.85138978],[-71.379154388,41.851356595],[-71.379172469,41.851322037],[-71.379191466,41.8512874790001],[-71.3792076829999,41.851251593],[-71.379222985,41.851214973],[-71.379235504,41.851177002],[-71.3792470779999,41.851138366],[-71.3792577359999,41.851098312],[-71.3792665289999,41.8510583010001],[-71.379274403,41.8510182900001],[-71.379279525,41.850978297],[-71.379283701,41.8509376640001],[-71.379285124,41.850897006],[-71.379285629,41.8508556370001],[-71.3792861059999,41.8508129420001],[-71.3792856699999,41.850768827],[-71.3792842839999,41.8507247360001],[-71.3792820099999,41.8506820370001],[-71.379277897,41.8506407100001],[-71.3792719749999,41.850601484],[-71.37926419,41.8505622340001],[-71.379253647,41.8505244200001],[-71.37924219,41.8504851660001],[-71.3792307049999,41.850444585],[-71.3792183579999,41.850406084],[-71.3792032269999,41.850368975],[-71.379186257,41.850333946],[-71.3791674779999,41.8503002640001],[-71.379145975,41.8502687280001],[-71.3791207689999,41.8502378520001],[-71.37909281,41.8502069960001],[-71.379063905,41.8501747890001],[-71.379033168,41.850141895],[-71.3790005939999,41.8501089980001],[-71.378967072,41.850076147],[-71.378932633,41.8500432480001],[-71.378897303,41.850012453],[-71.378860133,41.849983713],[-71.37882024,41.8499563890001],[-71.3787775919999,41.8499297930001],[-71.378732159,41.849904544],[-71.378685836,41.8498800260001],[-71.378639485,41.849854776],[-71.378591328,41.849830233],[-71.378544087,41.8498064],[-71.3784959289999,41.849782588],[-71.3784477689999,41.849759417],[-71.378397773,41.849736953],[-71.378347807,41.8497152200001],[-71.3782987239999,41.8496948390001],[-71.37825062,41.849675097],[-71.378205293,41.8496574870001],[-71.378159049,41.849640492],[-71.378112803,41.849624938],[-71.378064721,41.8496093360001],[-71.3780148019999,41.8495944640001],[-71.377963969,41.8495782420001],[-71.3779121869999,41.8495620200001],[-71.377857653,41.8495457700001],[-71.377801282,41.849530251],[-71.377742128,41.8495147290001],[-71.3776830319999,41.8495005790001],[-71.377625743,41.849485746],[-71.3775693709999,41.8494709120001],[-71.377514864,41.849456767],[-71.377464056,41.849443265],[-71.377416914,41.849431827],[-71.377370723,41.8494197030001],[-71.37732453,41.8494075560001],[-71.377281064,41.849393354],[-71.3772375999999,41.849378443],[-71.377195974,41.849361453],[-71.377156156,41.8493430930001],[-71.3771181769999,41.849323294],[-71.377082923,41.8493007760001],[-71.377049508,41.8492775290001],[-71.377018845,41.8492536210001],[-71.376990968,41.849228985],[-71.376965812,41.849204306],[-71.376942524,41.8491789650001],[-71.3769201539999,41.8491535800001],[-71.376900538,41.849126825],[-71.376881813,41.8490987000001],[-71.3768630869999,41.8490705520001],[-71.376843443,41.8490424020001],[-71.376821965,41.8490142740001],[-71.3767986519999,41.848986166],[-71.3767725819999,41.8489601370001],[-71.376744673,41.8489361630001],[-71.376730009,41.8489269770001],[-71.376713146,41.848916371],[-71.376680727,41.848900031],[-71.37665384,41.8488850000001],[-71.3766380279999,41.8488685630001],[-71.376636902,41.8488499700001],[-71.3766459299999,41.8488313190001],[-71.3766623,41.848811235],[-71.3766823719999,41.8487911550001],[-71.376707064,41.848771012],[-71.3767335859999,41.8487522880001],[-71.3767610259999,41.8487342060001],[-71.37679036,41.848716811],[-71.376821498,41.8487000820001],[-71.3768536119999,41.8486840630001],[-71.376885697,41.848668043],[-71.3769177519999,41.848651315],[-71.3769480019999,41.8486346070001],[-71.376977306,41.8486172130001],[-71.377005695,41.8485984450001],[-71.377031275,41.8485769540001],[-71.377054965,41.8485520290001],[-71.3770768219999,41.8485257080001],[-71.377097734,41.8484980360001],[-71.377117701,41.848468946],[-71.3771367529999,41.848438528],[-71.37715394,41.848407423],[-71.377169264,41.8483749660001],[-71.3771836719999,41.8483418220001],[-71.377196215,41.848307967],[-71.377207842,41.8482734470001],[-71.377216689,41.848237576],[-71.3772237009999,41.8482017260001],[-71.377230711,41.848166538],[-71.3772386639999,41.8481341190001],[-71.377250343,41.848104403],[-71.377266666,41.8480774350001],[-71.377288548,41.8480545900001],[-71.377312261,41.8480330960001],[-71.377334145,41.848008856],[-71.377353222,41.8479811830001],[-71.377367658,41.8479494110001],[-71.377381121,41.847914184],[-71.377393582,41.847875527],[-71.3774060759999,41.8478354750001],[-71.377418602,41.8477947820001],[-71.3774329299999,41.8477554180001],[-71.377447285,41.847717425],[-71.377461639,41.8476801410001],[-71.377476969,41.8476449400001],[-71.37749502,41.8476096960001],[-71.3775130989999,41.847575825],[-71.3775321259999,41.8475419540001],[-71.3775502029999,41.8475087680001],[-71.3775701179999,41.847474898],[-71.377590061,41.847441691],[-71.377610894,41.847407822],[-71.377632669,41.8473759890001],[-71.3776545009999,41.8473469240001],[-71.37768003,41.8473199430001],[-71.3777083369999,41.8472956640001],[-71.377740369,41.8472740870001],[-71.3777751809999,41.847254617],[-71.3778137199999,41.847237164],[-71.3778540929999,41.847220399],[-71.377886201,41.8472078090001],[-71.377934865,41.847189611],[-71.3779742899999,41.847172845],[-71.378012831,41.847154705],[-71.378050398,41.8471338200001],[-71.378087939,41.8471101910001],[-71.378127288,41.847085169],[-71.378167557,41.8470587530001],[-71.378208774,41.8470323610001],[-71.378249962,41.847005214],[-71.3782911499999,41.846978112],[-71.378332308,41.846950324],[-71.378370741,41.8469246380001],[-71.3784101209999,41.846898884],[-71.3784494989999,41.8468745710001],[-71.378489794,41.846850213],[-71.378531895,41.8468251480001],[-71.3785740559999,41.8468008140001],[-71.378615268,41.846776457],[-71.3786555629999,41.846752784],[-71.3786958549999,41.8467298210001],[-71.3787352909999,41.846707544],[-71.378773774,41.84668666],[-71.37881226,41.8466650660001],[-71.378847964,41.8466428290001],[-71.378882749,41.8466205930001],[-71.3789156999999,41.846598353],[-71.378947733,41.846576113],[-71.378976984,41.84655323],[-71.379007154,41.8465295930001],[-71.3790354619999,41.8465046260001],[-71.3790637389999,41.846478975],[-71.3790892649999,41.846452657],[-71.37911296,41.846424965],[-71.379133842,41.846395898],[-71.379152894,41.8463647950001],[-71.3791700799999,41.8463336890001],[-71.3791845119999,41.8463032880001],[-71.37919619,41.8462736170001],[-71.379204164,41.846245292],[-71.379205745,41.846217714],[-71.379203624,41.846190887],[-71.379196913,41.8461647410001],[-71.37918834,41.8461379300001],[-71.3791806839999,41.8461103880001],[-71.379174865,41.8460821850001],[-71.379171801,41.8460525670001],[-71.379170544,41.8460215790001],[-71.3791683429999,41.8459885080001],[-71.379166174,41.8459547520001],[-71.3791621409999,41.8459203530001],[-71.379158106,41.845886595],[-71.3791512879999,41.8458528800001],[-71.379142664,41.8458198480001],[-71.3791312879999,41.845786837],[-71.379121719,41.8457524780001],[-71.3791121199999,41.845717365],[-71.379104388,41.845681567],[-71.3790966569999,41.8456457930001],[-71.379086141,41.8456107470001],[-71.3790747369999,41.845576341],[-71.3790614979999,41.845541955],[-71.37904639,41.845508986],[-71.379031313,41.845475993],[-71.379015318,41.845443023],[-71.3789984059999,41.845410051],[-71.3789814639999,41.84537708],[-71.3789654399999,41.845343401],[-71.378948528,41.8453104290001],[-71.3789325069999,41.845276063],[-71.378916486,41.8452410350001],[-71.378899519,41.8452045870001],[-71.3788807449999,41.845169555],[-71.3788619709999,41.8451352330001],[-71.378842274,41.8451029450001],[-71.378821688,41.845072073],[-71.378801101,41.845041865],[-71.378779627,41.8450123420001],[-71.378759037,41.844983552],[-71.378740314,41.844954054],[-71.378723427,41.844923781],[-71.378707456,41.844895636],[-71.3786961279999,41.844869531],[-71.378691277,41.844846794],[-71.37869388,41.8448288910001],[-71.37870663,41.8448143370001],[-71.3787230789999,41.844801182],[-71.3787376929999,41.8447873160001],[-71.3787485509999,41.8447706790001],[-71.378753908,41.844752047],[-71.3787537009999,41.844732105],[-71.378748878,41.8447107640001],[-71.3787376,41.8446908330001],[-71.378719898,41.8446716280001],[-71.378697603,41.8446552300001],[-71.378671665,41.844640247],[-71.3786420559999,41.844626609],[-71.378613361,41.8446143890001],[-71.378585581,41.8446035210001],[-71.378557885,41.8445968140001],[-71.378529266,41.8445928040001],[-71.3784997879999,41.8445909210001],[-71.378468415,41.84458764],[-71.378437046,41.844583033],[-71.3784047,41.8445769850001],[-71.378374251,41.8445702750001],[-71.378342827,41.8445621920001],[-71.378312351,41.844553401],[-71.378281817,41.844543238],[-71.378252233,41.844532412],[-71.37822354,41.8445201700001],[-71.3781976,41.8445065130001],[-71.3781734949999,41.8444928810001],[-71.3781530909999,41.8444792290001],[-71.378133605,41.844465579],[-71.3781113649999,41.8444525890001],[-71.3780817529999,41.8444403680001],[-71.378047521,41.8444288520001],[-71.378012376,41.8444152540001],[-71.377979958,41.8443989140001],[-71.377952133,41.8443797890001],[-71.377927004,41.8443585630001],[-71.377901908,41.8443352790001],[-71.377880483,41.8443119990001],[-71.377862727,41.844288654],[-71.3778440519999,41.844266749],[-71.3778226809999,41.8442468540001],[-71.377799416,41.8442263380001],[-71.3777780189999,41.8442044080001],[-71.377760238,41.8441790050001],[-71.37774705,41.844150176],[-71.3777365879999,41.8441192010001],[-71.377727044,41.84408825],[-71.3777184479999,41.844057322],[-71.377706178,41.8440284260001],[-71.3776892879999,41.84400028],[-71.377668757,41.8439735470001],[-71.37764636,41.8439460810001],[-71.3776239649999,41.843918661],[-71.377604322,41.84389122],[-71.377589297,41.843863739],[-71.377579807,41.8438362410001],[-71.377577689,41.843808682],[-71.377582938,41.8437825030001],[-71.377595588,41.8437562180001],[-71.37761377,41.843731996],[-71.377636565,41.8437098150001],[-71.377662172,41.8436897180001],[-71.3776886919999,41.8436709480001],[-71.377714294,41.843652886],[-71.377739957,41.843634825],[-71.3777673929999,41.843616765],[-71.377795807,41.8436000780001],[-71.377825104,41.8435840560001],[-71.377853483,41.8435694040001],[-71.377880088,41.843554774],[-71.377903907,41.8435408500001],[-71.3779249729999,41.8435276770001],[-71.377943284,41.8435165130001],[-71.3779606749999,41.843506104],[-71.37797534,41.8434977490001],[-71.377987248,41.843491473],[-71.377999159,41.8434845100001],[-71.378011069,41.843476862],[-71.378026597,41.8434650550001],[-71.378044883,41.843450508],[-71.378065896,41.843433127],[-71.3780887189999,41.8434130270001],[-71.3781124619999,41.843391556],[-71.378136205,41.843369352],[-71.378159921,41.843345777],[-71.3781817719999,41.8433215370001],[-71.3782008709999,41.843298003],[-71.378217214,41.843275197],[-71.378229888,41.8432523870001],[-71.378237054,41.8432309670001],[-71.378239601,41.843210297],[-71.378236613,41.84318962],[-71.378228121,41.8431682980001],[-71.378217736,41.843145624],[-71.3782036539999,41.8431202020001],[-71.378188628,41.843092744],[-71.378172687,41.8430645760001],[-71.3781567199999,41.8430343490001],[-71.378138889,41.843002772],[-71.378121028,41.8429705080001],[-71.3781013609999,41.842939614],[-71.3780826409999,41.842909386],[-71.378065754,41.842879844],[-71.378049755,41.8428496400001],[-71.378033791,41.8428173560001],[-71.378019577,41.8427815970001],[-71.378005371,41.842741722],[-71.377991997,41.8426983940001],[-71.377978657,41.8426529860001],[-71.3779680659999,41.842609639],[-71.377957502,41.842568396],[-71.3779488,41.8425284590001],[-71.377940127,41.842489938],[-71.377932341,41.842451397],[-71.3779236939999,41.8424149350001],[-71.377915043,41.8423805310001],[-71.3779063929999,41.8423461040001],[-71.3778968239999,41.842312409],[-71.3778872569999,41.8422773410001],[-71.3778786079999,41.8422422290001],[-71.377870876,41.84220714],[-71.3778622529999,41.8421741080001],[-71.377851791,41.842143865],[-71.377837685,41.8421157220001],[-71.377819904,41.8420896320001],[-71.377800317,41.842064914],[-71.377779784,41.842039576],[-71.377762004,41.842013464],[-71.377745142,41.8419873990001],[-71.377730119,41.841959209],[-71.377716931,41.8419303580001],[-71.3777055799999,41.841900799],[-71.377697897,41.8418725940001],[-71.3776957759999,41.8418457220001],[-71.377700136,41.841820914],[-71.377712808,41.84179879],[-71.377731933,41.8417773140001],[-71.377753839,41.841756527],[-71.377775743,41.8417364260001],[-71.3777976759999,41.8417170110001],[-71.3778195799999,41.841697573],[-71.377839648,41.841678179],[-71.377858798,41.8416587610001],[-71.377877004,41.8416379930001],[-71.377893377,41.841615851],[-71.3779088049999,41.841592335],[-71.377924202,41.8415688430001],[-71.37793963,41.8415446180001],[-71.377956924,41.841521105],[-71.3779760479999,41.841498942],[-71.377997007,41.8414774920001],[-71.3780198279999,41.841458032],[-71.378044539,41.841441364],[-71.3780693049999,41.841428126],[-71.378093147,41.8414183410001],[-71.3781133479999,41.8414092610001],[-71.378128873,41.841398849],[-71.378140706,41.8413836080001],[-71.378153432,41.841365647],[-71.378170746,41.841346935],[-71.3781945389999,41.8413309530001],[-71.3782238919999,41.8413176970001],[-71.378257831,41.8413051100001],[-71.3782927189999,41.8412917920001],[-71.3783275819999,41.8412764380001],[-71.378359635,41.8412583370001],[-71.3783898249999,41.8412388850001],[-71.378418183,41.841218768],[-71.378446568,41.841199977],[-71.3784758689999,41.8411818960001],[-71.3785051679999,41.8411645240001],[-71.378532631,41.841148499],[-71.378558288,41.8411331820001],[-71.378583939,41.8411206310001],[-71.378609675,41.8411115330001],[-71.3786354059999,41.8411058670001],[-71.3786602709999,41.8411043830001],[-71.378685162,41.841106262],[-71.3787091359999,41.8411068360001],[-71.3787312219999,41.8411039320001],[-71.378751393,41.8410948980001],[-71.3787687289999,41.8410803030001],[-71.3787860689999,41.841063696],[-71.378805219,41.8410449410001],[-71.378825316,41.8410262560001],[-71.37884722,41.8410061550001],[-71.378870013,41.840984636],[-71.378892837,41.840963141],[-71.3789147419999,41.8409423530001],[-71.378936648,41.840921544],[-71.3789585229999,41.84090007],[-71.378981348,41.8408778880001],[-71.379004144,41.840855021],[-71.3790269419999,41.8408314910001],[-71.379049708,41.840807914],[-71.3790725069999,41.8407836740001],[-71.379095304,41.8407594350001],[-71.379116236,41.8407358800001],[-71.379136253,41.8407109510001],[-71.379153516,41.8406867510001],[-71.379168915,41.840661864],[-71.3791825069999,41.840638369],[-71.379195152,41.8406141410001],[-71.3792059639999,41.8405893170001],[-71.379214909,41.840564468],[-71.379221101,41.840540257],[-71.379224543,41.8405154480001],[-71.3792279529999,41.840490663],[-71.379231394,41.840465785],[-71.379236674,41.840439583],[-71.379243757,41.8404133600001],[-71.379251789,41.840386429],[-71.379258873,41.8403595200001],[-71.3792622889999,41.8403319450001],[-71.379262002,41.8403058050001],[-71.3792589619999,41.840279595],[-71.379252256,41.8402520770001],[-71.3792445999999,41.840224581],[-71.379236001,41.840195689],[-71.3792292369999,41.84016609],[-71.379221586,41.8401365130001],[-71.379214823,41.840106227],[-71.379208062,41.8400745700001],[-71.3792003569999,41.8400415400001],[-71.379193539,41.8400085100001],[-71.379186781,41.8399754810001],[-71.379180909,41.8399431390001],[-71.379175983,41.839912192],[-71.379172003,41.8398818640001],[-71.379169855,41.839852933],[-71.3791677089999,41.8398233390001],[-71.3791664509999,41.8397930140001],[-71.379166142,41.839762003],[-71.379165804,41.8397303300001],[-71.379169169,41.8396972420001],[-71.379173451,41.8396648200001],[-71.379181402,41.8396324230001],[-71.379190271,41.839599273],[-71.379200058,41.8395661700001],[-71.379210794,41.8395330220001],[-71.3792214979999,41.8394998730001],[-71.379232202,41.8394667480001],[-71.37924199,41.839432935],[-71.379250891,41.8393998080001],[-71.379259759,41.8393673670001],[-71.379268627,41.8393349250001],[-71.379279357,41.83930459],[-71.379290118,41.8392741860001],[-71.3793008769999,41.839244514],[-71.379311606,41.8392147960001],[-71.3793223919999,41.8391865190001],[-71.379332232,41.839158195],[-71.379342099,41.839131266],[-71.379353798,41.8391057110001],[-71.3793701399999,41.8390828830001],[-71.379388375,41.8390620910001],[-71.379408439,41.8390440700001],[-71.379428558,41.8390294770001],[-71.379448732,41.8390183610001],[-71.3794707659999,41.839009946],[-71.379493713,41.8390042980001],[-71.379515796,41.8390021270001],[-71.379536071,41.8390019880001],[-71.379557292,41.8390032680001],[-71.379578485,41.83900313],[-71.379598734,41.839000932],[-71.379617094,41.8389946400001],[-71.379633563,41.838985602],[-71.379650036,41.838974482],[-71.3796665089999,41.8389633620001],[-71.379682985,41.838951556],[-71.379700374,41.838941123],[-71.379718708,41.8389320410001],[-71.3797398519999,41.8389257520001],[-71.379761908,41.8389214520001],[-71.3797849379999,41.8389206300001],[-71.379807964,41.838921203],[-71.3798319649999,41.8389238120001],[-71.379855016,41.8389271300001],[-71.379878124,41.8389331910001],[-71.3799012009999,41.838939253],[-71.379924307,41.8389460230001],[-71.379948333,41.8389521080001],[-71.379971413,41.838956775],[-71.379991715,41.8389580310001],[-71.380009182,41.838955877],[-71.3800247629999,41.8389475230001],[-71.380035703,41.8389350480001],[-71.38004289,41.8389184760001],[-71.380046382,41.8388991780001],[-71.380046175,41.838879191],[-71.380042298,41.838859246],[-71.3800347169999,41.8388406460001],[-71.3800234669999,41.838822796],[-71.380009491,41.8388063620001],[-71.3799955119999,41.838791986],[-71.3799815899999,41.8387803310001],[-71.379966742,41.838772174],[-71.379941774,41.838763344],[-71.3799241789999,41.8387531270001],[-71.37991109,41.8387366700001],[-71.379904535,41.8387263720001],[-71.379897064,41.838714678],[-71.37988862,41.8387009480001],[-71.379878312,41.8386851810001],[-71.3798680099999,41.8386673100001],[-71.379857677,41.8386487750001],[-71.3798464289999,41.8386295540001],[-71.379835182,41.8386096240001],[-71.3798220429999,41.838587633],[-71.379807069,41.838565687],[-71.379792096,41.8385430540001],[-71.379775288,41.838521083],[-71.3797593959999,41.8384991120001],[-71.379742614,41.838479267],[-71.3797267479999,41.8384600640001],[-71.379711828,41.838441548],[-71.37969688,41.838422345],[-71.3796819629999,41.838403097],[-71.379667013,41.8383845810001],[-71.3796520659999,41.838364692],[-71.379638955,41.8383440960001],[-71.379625816,41.838321443],[-71.3796135709999,41.8382960230001],[-71.379600411,41.83826923],[-71.379588139,41.8382410660001],[-71.379576788,41.8382114620001],[-71.379567271,41.838182569],[-71.37955962,41.838153038],[-71.379554718,41.8381247900001],[-71.379549818,41.8380965650001],[-71.379546749,41.838069691],[-71.379546524,41.8380428660001],[-71.379546266,41.838017344],[-71.379546895,41.8379918690001],[-71.379550337,41.837966329],[-71.379558366,41.8379414790001],[-71.379568231,41.8379152360001],[-71.3795799609999,41.8378897040001],[-71.3795907429999,41.837863462],[-71.37960058,41.8378358250001],[-71.3796094739999,41.8378061500001],[-71.379616534,41.8377751020001],[-71.379623597,41.8377433900001],[-71.379630656,41.8377137150001],[-71.379636797,41.8376840380001],[-71.3796420479999,41.8376557550001],[-71.379648187,41.8376274720001],[-71.3796543569999,41.837598504],[-71.379661415,41.8375695140001],[-71.3796675579999,41.837538511],[-71.379673644,41.8375054030001],[-71.379679762,41.8374715640001],[-71.379686796,41.8374384580001],[-71.379694719,41.837404667],[-71.3797026999999,41.8373722470001],[-71.379709732,41.83734049],[-71.379716763,41.8373087790001],[-71.379721988,41.837278414],[-71.379726295,41.8372480950001],[-71.379730573,41.8372177300001],[-71.379734878,41.8371880970001],[-71.379738269,41.837157754],[-71.3797407119999,41.8371267470001],[-71.379743154,41.837096425],[-71.379745597,41.8370653960001],[-71.379747122,41.837035073],[-71.379746812,41.8370047490001],[-71.379743748,41.836975131],[-71.37973793,41.8369462410001],[-71.3797293279999,41.8369187220001],[-71.3797198669999,41.836892619],[-71.379709458,41.8368664920001],[-71.379697216,41.8368389680001],[-71.379684944,41.8368114900001],[-71.379672673,41.8367833030001],[-71.3796594839999,41.8367551380001],[-71.379647215,41.836726265],[-71.379633081,41.83669675],[-71.37961895,41.8366658160001],[-71.3796039,41.8366355680001],[-71.3795869859999,41.8366046780001],[-71.379569213,41.8365758210001],[-71.3795504889999,41.8365477190001],[-71.379531764,41.836520943],[-71.379511233,41.8364941880001],[-71.379489785,41.8364681190001],[-71.3794683089999,41.8364407],[-71.3794477499999,41.8364132360001],[-71.3794263029999,41.836386502],[-71.379404826,41.8363590610001],[-71.379383348,41.836332327],[-71.379360982,41.836306257],[-71.3793395019999,41.836280919],[-71.379317162,41.836257592],[-71.379295737,41.836234975],[-71.379276176,41.8362130470001],[-71.379258423,41.8361904110001],[-71.379242533,41.836167754],[-71.3792256959999,41.8361444330001],[-71.379207057,41.836121087],[-71.379189276,41.836096394],[-71.3791715249999,41.8360716770001],[-71.3791546909999,41.836047007],[-71.3791387759999,41.836021583],[-71.3791228599999,41.835996891],[-71.3791069439999,41.8359728620001],[-71.379091944,41.8359488340001],[-71.379076971,41.835926156],[-71.379062919,41.8359028150001],[-71.379047945,41.8358808460001],[-71.379034808,41.8358581910001],[-71.379022619,41.8358355620001],[-71.379010401,41.835812177],[-71.379000017,41.835788818],[-71.378990582,41.835765436],[-71.3789829799999,41.8357427650001],[-71.378976294,41.8357207350001],[-71.378969608,41.8356987280001],[-71.37896384,41.8356760140001],[-71.3789562379999,41.835653343],[-71.3789477189999,41.8356306490001],[-71.3789401179999,41.8356072460001],[-71.37893249,41.835582517],[-71.378925779,41.8355570570001],[-71.3789181239999,41.8355302240001],[-71.378911417,41.8355033920001],[-71.378902844,41.835476558],[-71.378894271,41.835449747],[-71.378886616,41.835422937],[-71.378878962,41.835395395],[-71.378872254,41.8353685860001],[-71.378865576,41.835342417],[-71.3788588359999,41.8353169800001],[-71.378853014,41.835290812],[-71.3788472799999,41.835266749],[-71.378842401,41.835243372],[-71.378841004,41.835238019],[-71.378836661,41.8352220290001],[-71.3788290859999,41.83520208],[-71.378822483,41.8351842120001],[-71.378814927,41.8351697740001],[-71.378801817,41.8351485150001],[-71.378793426,41.835138924],[-71.3787887399999,41.835127234],[-71.378781235,41.8351176210001],[-71.378773736,41.8351052410001],[-71.3787643479999,41.8350894750001],[-71.378753155,41.8350736610001],[-71.3787382639999,41.8350572250001],[-71.3787280079999,41.8350469690001],[-71.378717756,41.8350352950001],[-71.378705639,41.835022956],[-71.37869169,41.835009266],[-71.378676797,41.8349941810001],[-71.378660069,41.834978452],[-71.378641476,41.8349627210001],[-71.3786210489999,41.8349469890001],[-71.378600594,41.8349298620001],[-71.3785801399999,41.8349120940001],[-71.378560603,41.834893573],[-71.378541097,41.8348758060001],[-71.378521529,41.8348579710001],[-71.3785011049999,41.834840866],[-71.3784806479999,41.8348244480001],[-71.3784611679999,41.8348094020001],[-71.378442573,41.834794335],[-71.378424955,41.834780686],[-71.378410086,41.834768345],[-71.378397052,41.8347560280001],[-71.3783858799999,41.834745748],[-71.3783672869999,41.834730017],[-71.3783239589999,41.8346807360001],[-71.378277447,41.834665112],[-71.378263503,41.8346497300001],[-71.378248583,41.834632357],[-71.378234552,41.8346136120001],[-71.378218659,41.8345935400001],[-71.378201879,41.834572757],[-71.378184182,41.8345520660001],[-71.3781655399999,41.8345306640001],[-71.378145983,41.834507912],[-71.378127314,41.8344837880001],[-71.3781076989999,41.8344590230001],[-71.3780898589999,41.8344335520001],[-71.37807205,41.8344074170001],[-71.3780550709999,41.834379224],[-71.37803898,41.8343510560001],[-71.3780210849999,41.834322199],[-71.378003161,41.834292657],[-71.377985237,41.8342631150001],[-71.377968202,41.8342322240001],[-71.377952942,41.834199986],[-71.3779376259999,41.8341663530001],[-71.3779222809999,41.834131348],[-71.37790602,41.8340957240001],[-71.377889758,41.8340600770001],[-71.377873528,41.834024454],[-71.377856379,41.8339894920001],[-71.377841033,41.8339545100001],[-71.3778257179999,41.8339202130001],[-71.3778113179999,41.8338865810001],[-71.37779689,41.8338515770001],[-71.3777842379999,41.833815911],[-71.3777733909999,41.8337794920001],[-71.3777634589999,41.833743784],[-71.377754474,41.8337093800001],[-71.377746434,41.833676326],[-71.377740224,41.833645287],[-71.377735848,41.8336149130001],[-71.377732361,41.833583144],[-71.377728845,41.8335507130001],[-71.3777253009999,41.8335169550001],[-71.37772173,41.833481803],[-71.377717268,41.833448043],[-71.377713754,41.833414926],[-71.377709351,41.833382516],[-71.377705862,41.83335212],[-71.3777015159999,41.8333217000001],[-71.3777008069999,41.8332926100001],[-71.377700068,41.833263544],[-71.377699386,41.8332357800001],[-71.377700568,41.8332093920001],[-71.377701749,41.8331836420001],[-71.377702928,41.8331586030001],[-71.377704165,41.833134912],[-71.377705401,41.833112547],[-71.3777076109999,41.8330915340001],[-71.377709822,41.8330712060001],[-71.37771206,41.8330515640001],[-71.377715215,41.8330325640001],[-71.3777192859999,41.8330142510001],[-71.3777233869999,41.8329966000001],[-71.377728346,41.832977601],[-71.377734194,41.8329578720001],[-71.377740928,41.832937504],[-71.377748523,41.832915717],[-71.3777552299999,41.832893954],[-71.377762854,41.8328729],[-71.3777705059999,41.8328525090001],[-71.377778157,41.832833468],[-71.3777850079999,41.8328164380001],[-71.3777918549999,41.8328014430001],[-71.377798818,41.8327898570001],[-71.3778040609999,41.8327823160001],[-71.377807557,41.8327775170001],[-71.377758553,41.832770741],[-71.377752136,41.832768813],[-71.377894068,41.8324684470001],[-71.377904525,41.8324527250001],[-71.3779097949999,41.8324465790001],[-71.377958688,41.832447271],[-71.377967766,41.8324491560001],[-71.3779713769999,41.8324477420001],[-71.377974041,41.8324456870001],[-71.377977535,41.832441574],[-71.3779819769999,41.8324374630001],[-71.377986331,41.832430629],[-71.377991516,41.8324217620001],[-71.377998508,41.832410861],[-71.3780071899999,41.8323958230001],[-71.378019396,41.8323774030001],[-71.378033408,41.832356905],[-71.378048248,41.832335722],[-71.378062201,41.832314583],[-71.378076154,41.8322933750001],[-71.378090108,41.8322715510001],[-71.378104062,41.8322497030001],[-71.378118015,41.8322285410001],[-71.3781328549999,41.8322073350001],[-71.3781495869999,41.832188167],[-71.3781689799999,41.8321682910001],[-71.37818935,41.832149058],[-71.3782114649999,41.832129116],[-71.378233581,41.832108513],[-71.3782556689999,41.832087245],[-71.37827684,41.832064605],[-71.37829887,41.8320413020001],[-71.37832093,41.832017976],[-71.3783438469999,41.8319939890001],[-71.378366765,41.831969337],[-71.3783905719999,41.831943933],[-71.378412575,41.831918595],[-71.378434549,41.831891908],[-71.378456494,41.831865243],[-71.378479356,41.8318378480001],[-71.3785013309999,41.831811137],[-71.3785241909999,41.831784428],[-71.378546166,41.831757741],[-71.3785671639999,41.831729726],[-71.37858722,41.8316990120001],[-71.3786081929999,41.831668275],[-71.378629136,41.831637517],[-71.3786519129999,41.8316067370001],[-71.3786756059999,41.831576667],[-71.378699297,41.8315472140001],[-71.378722075,41.831516456],[-71.378743933,41.8314864070001],[-71.3787658219999,41.8314556500001],[-71.3787886279999,41.8314262420001],[-71.378813178,41.8313954170001],[-71.378837759,41.8313646400001],[-71.378863257,41.8313338630001],[-71.37888781,41.8313023750001],[-71.37891239,41.831271574],[-71.3789369419999,41.8312401330001],[-71.3789624089999,41.8312093330001],[-71.37898699,41.8311785320001],[-71.379013377,41.8311470470001],[-71.379038873,41.831116933],[-71.3790643409999,41.8310861100001],[-71.379088033,41.831056039],[-71.379110838,41.831026632],[-71.379131839,41.8309972220001],[-71.379151952,41.8309678570001],[-71.379171148,41.8309391540001],[-71.379189455,41.830911181],[-71.379207702,41.8308825],[-71.379226011,41.830853157],[-71.379244319,41.830824453],[-71.3792635149999,41.830795773],[-71.379281851,41.8307684870001],[-71.379301103,41.8307418200001],[-71.3793212429999,41.830715153],[-71.379341382,41.830688464],[-71.379362441,41.8306604490001],[-71.3793825229999,41.830631747],[-71.379402577,41.8306010320001],[-71.379421716,41.8305696310001],[-71.379441743,41.830537545],[-71.379460824,41.830504153],[-71.379479018,41.8304714020001],[-71.3794972109999,41.8304386500001],[-71.379512711,41.8304073130001],[-71.3795264359999,41.830376684],[-71.3795374699999,41.830346783],[-71.379546669,41.8303168570001],[-71.37955498,41.830286954],[-71.379561516,41.8302577800001],[-71.37956536,41.8302299760001],[-71.379566454,41.8302015520001],[-71.379566633,41.8301710910001],[-71.379566752,41.830139966],[-71.37956776,41.8301074940001],[-71.3795714629999,41.830073584],[-71.379575164,41.830040383],[-71.379579781,41.830007822],[-71.379583541,41.8299759940001],[-71.3795854639999,41.829944848],[-71.3795855559999,41.829911666],[-71.379586508,41.8298771350001],[-71.3795874319999,41.829840592],[-71.3795892159999,41.829802655],[-71.379590999,41.8297647630001],[-71.379593669,41.8297268040001],[-71.379594566,41.8296889110001],[-71.3795954029999,41.8296503330001],[-71.379595384,41.829611754],[-71.379595304,41.8295725340001],[-71.3795970579999,41.8295339110001],[-71.379598842,41.8294953110001],[-71.379599786,41.8294811100001],[-71.379601485,41.8294560480001],[-71.379605074,41.8294174260001],[-71.3796104639999,41.8293794470001],[-71.379615826,41.829340804],[-71.379622164,41.82930349],[-71.3796293889999,41.829266176],[-71.3796366129999,41.8292295480001],[-71.379643867,41.82919292],[-71.3796502339999,41.8291562680001],[-71.37965184,41.8291477390001],[-71.379657459,41.8291189540001],[-71.3796646819999,41.8290823020001],[-71.379672823,41.829045653],[-71.379683714,41.8290103100001],[-71.3796955189999,41.828975653],[-71.3797110209999,41.828942967],[-71.379728354,41.828912272],[-71.379748466,41.8288835930001],[-71.379770438,41.8288568830001],[-71.3797942149999,41.8288308370001],[-71.3798189359999,41.828806119],[-71.379846406,41.828782754],[-71.3798756799999,41.828759344],[-71.379906816,41.828737948],[-71.379937981,41.828717193],[-71.379970092,41.828697834],[-71.38000492,41.828679736],[-71.380040697,41.828662325],[-71.380076469,41.8286462620001],[-71.380111413,41.828632257],[-71.3801436639999,41.8286196220001],[-71.380174169,41.82860838],[-71.3802019239999,41.8285965170001],[-71.380224235,41.828584671],[-71.380241078,41.8285702580001],[-71.3802542569999,41.82855383],[-71.3802646569999,41.828535431],[-71.380272278,41.828514354],[-71.380278039,41.8284912400001],[-71.3802810509999,41.8284668430001],[-71.380283089,41.828439745],[-71.380283295,41.8284113190001],[-71.380282555,41.828381521],[-71.380279985,41.828349777],[-71.380276468,41.828317322],[-71.3802729499999,41.8282848910001],[-71.3802685169999,41.8282524810001],[-71.380267004,41.828243538],[-71.3802632539999,41.82822142],[-71.380258876,41.8281917090001],[-71.380258166,41.8281626190001],[-71.380259259,41.8281335090001],[-71.3802639909999,41.8281050190001],[-71.3802714139999,41.828075847],[-71.380281558,41.828046586],[-71.38029259,41.8280173250001],[-71.380306342,41.8279880440001],[-71.3803219289999,41.8279587660001],[-71.3803401769999,41.8279287130001],[-71.380359343,41.827898707],[-71.380380313,41.8278686100001],[-71.380401283,41.827838582],[-71.380424085,41.8278091280001],[-71.3804459419999,41.8277783930001],[-71.380466885,41.8277469930001],[-71.38048688,41.8277142200001],[-71.380505044,41.827680119],[-71.3805213749999,41.827645422],[-71.380538623,41.827610656],[-71.380557731,41.8275785910001],[-71.380578672,41.8275471910001],[-71.3806014749999,41.8275177840001],[-71.3806216139999,41.8274904310001],[-71.3806372829999,41.8274658400001],[-71.3806484849999,41.8274433720001],[-71.380654363,41.8274229560001],[-71.3806574879999,41.827403293],[-71.380658866,41.8273857080001],[-71.380661216,41.82737144],[-71.380664569,41.8273605580001],[-71.380665286,41.8273531040001],[-71.3806624819999,41.827348413],[-71.380621215,41.8273266680001],[-71.380613941,41.8273247160001],[-71.3806093869999,41.827324117],[-71.380703693,41.8271854480001],[-71.380712602,41.8271799],[-71.380686802,41.82716064],[-71.3806768059999,41.8271594180001],[-71.380854982,41.8269370450001],[-71.3808611709999,41.826930191],[-71.3810204549999,41.826969965],[-71.381024093,41.826969923],[-71.3810257549999,41.826963818],[-71.381026586,41.826961075],[-71.3810292219999,41.8269576480001],[-71.381032744,41.8269542210001],[-71.3810371549999,41.8269501090001],[-71.381043343,41.826943941],[-71.381048585,41.8269364000001],[-71.381055604,41.826926848],[-71.3810625639999,41.826915924],[-71.38106858,41.8269036500001],[-71.381074568,41.8268900260001],[-71.3810832779999,41.8268750330001],[-71.381094592,41.8268579620001],[-71.381109517,41.826839476],[-71.381126244,41.82682097],[-71.381143891,41.8268024650001],[-71.3811624799999,41.8267859740001],[-71.3811819859999,41.8267694830001],[-71.3812023799999,41.8267529460001],[-71.3812228049999,41.8267364100001],[-71.38124228,41.826719897],[-71.381259067,41.826702762],[-71.38127399,41.826684964],[-71.381286194,41.826665835],[-71.381297424,41.826644716],[-71.381308683,41.8266242600001],[-71.3813226619999,41.826603785],[-71.3813439149999,41.8265858770001],[-71.381370638,41.826568593],[-71.381401916,41.8265525950001],[-71.381435884,41.8265358900001],[-71.381469797,41.826516487],[-71.381502736,41.826495047],[-71.381532035,41.826473009],[-71.381561338,41.826450262],[-71.3815897229999,41.826427514],[-71.381618166,41.8264061830001],[-71.381644803,41.8263861780001],[-71.381670581,41.826368207],[-71.3816973309999,41.8263522720001],[-71.3817277489999,41.826338331],[-71.3817635779999,41.8263236400001],[-71.381800325,41.826309614],[-71.381838849,41.8262934850001],[-71.381878257,41.826278044],[-71.381916809,41.8262633100001],[-71.3819581079999,41.8262505690001],[-71.382001268,41.8262398190001],[-71.382044487,41.8262311280001],[-71.3820868459999,41.826223762],[-71.382129232,41.8262184320001],[-71.3821743089999,41.826213104],[-71.382221279,41.826209035],[-71.3822691359999,41.8262049910001],[-71.3823179359999,41.8262036460001],[-71.382366765,41.8262029640001],[-71.3824156539999,41.8262029680001],[-71.382463566,41.8262023090001],[-71.382510622,41.826201671],[-71.382553923,41.8261970040001],[-71.3825907839999,41.826187734],[-71.382622087,41.826173747],[-71.3826497269999,41.8261564650001],[-71.382679171,41.8261398000001],[-71.382713167,41.826124468],[-71.382749025,41.82611108],[-71.3827858,41.826097739],[-71.3828279859999,41.8260849530001],[-71.3828728939999,41.8260714830001],[-71.38289957,41.8260636430001],[-71.382918719,41.8260579920001],[-71.3829599329999,41.8260418890001],[-71.382993842,41.826023788],[-71.383019594,41.8260031410001],[-71.383035319,41.8259805860001],[-71.383045517,41.825954731],[-71.3830566629999,41.8259288790001],[-71.383071415,41.8259043100001],[-71.38309075,41.8258803630001],[-71.383113721,41.8258584100001],[-71.3831421909999,41.8258390460001],[-71.383175186,41.825818955],[-71.3832117589999,41.8257988460001],[-71.383251972,41.8257780070001],[-71.383293044,41.8257557750001],[-71.383335862,41.825731508],[-71.3833813429999,41.8257051410001],[-71.383429518,41.8256774050001],[-71.383478579,41.825649669],[-71.3835276409999,41.8256212470001],[-71.383576733,41.825593489],[-71.383625823,41.825567102],[-71.38367497,41.8255420890001],[-71.383722313,41.8255177350001],[-71.383768768,41.825493404],[-71.383814307,41.825469759],[-71.383858958,41.8254454710001],[-71.383902693,41.825421206],[-71.3839454819999,41.825395545],[-71.383988242,41.8253692440001],[-71.384030175,41.8253436270001],[-71.384072965,41.8253173260001],[-71.384117526,41.8252923760001],[-71.3841630639999,41.8252680890001],[-71.384208663,41.82524442],[-71.384253342,41.8252214820001],[-71.384298937,41.825199895],[-71.384345477,41.825179588],[-71.384391099,41.825159372],[-71.3844358659999,41.825139796],[-71.384482405,41.8251195120001],[-71.384531666,41.825099209],[-71.3845818149999,41.8250782430001],[-71.384631934,41.825056568],[-71.3846820529999,41.8250348930001],[-71.384729482,41.8250139250001],[-71.384776022,41.8249929780001],[-71.384820728,41.8249720520001],[-71.384863662,41.8249511710001],[-71.3849047589999,41.8249309730001],[-71.384944998,41.824911506],[-71.384984351,41.824892656],[-71.385024646,41.824875864],[-71.385064942,41.8248590740001],[-71.38510432,41.824842968],[-71.385143758,41.824827548],[-71.385185027,41.824813411],[-71.385227185,41.8247986120001],[-71.385270287,41.8247851610001],[-71.385314277,41.8247723760001],[-71.385360158,41.8247609420001],[-71.3854087569999,41.8247507680001],[-71.385458274,41.824741304],[-71.385508707,41.8247325040001],[-71.38555917,41.824723659],[-71.385609602,41.824714859],[-71.3856573419999,41.824706742],[-71.385703308,41.8246993320001],[-71.385748386,41.8246926310001],[-71.385791658,41.8246873000001],[-71.3858331559999,41.824682013],[-71.385869242,41.8246774290001],[-71.385898911,41.8246702550001],[-71.385923054,41.8246590730001],[-71.385941727,41.824645988],[-71.385957623,41.824630202],[-71.385970797,41.824614436],[-71.385982169,41.824598736],[-71.385994485,41.824584341],[-71.386010496,41.8245726260001],[-71.3860310589999,41.824562858],[-71.386055288,41.824555106],[-71.386083153,41.8245479300001],[-71.386114656,41.8245413990001],[-71.386149824,41.8245368600001],[-71.386190519,41.824536305],[-71.386233105,41.824538406],[-71.3862775219999,41.824541858],[-71.3863173569999,41.824543315],[-71.386348087,41.824541584],[-71.386365957,41.824533209],[-71.386370169,41.824520292],[-71.386358914,41.824504867],[-71.3863368089999,41.8244882430001],[-71.386311034,41.8244710430001],[-71.386282571,41.824453132],[-71.3862531889999,41.8244359510001],[-71.38622292,41.8244194550001],[-71.38619268,41.8244036240001],[-71.386167852,41.8243870420001],[-71.3861502399999,41.8243710620001],[-71.3861416779999,41.824354269],[-71.386143972,41.8243366610001],[-71.386153539,41.8243209610001],[-71.386169463,41.8243065],[-71.386188166,41.8242933920001],[-71.386207508,41.824282914],[-71.386217238,41.824278533],[-71.386231068,41.824272487],[-71.3862534639999,41.8242633850001],[-71.3862749429999,41.824254281],[-71.3862937609999,41.8242459300001],[-71.3863059399999,41.8242400410001],[-71.386312518,41.824236892],[-71.386330361,41.824226482],[-71.386349063,41.8242147],[-71.386368654,41.8242015700001],[-71.386390018,41.824187755],[-71.3864122699999,41.824173897],[-71.3864373019999,41.8241607030001],[-71.386463191,41.824147511],[-71.3864900259999,41.824134959],[-71.386516834,41.8241210580001],[-71.386545387,41.8241050560001],[-71.386573911,41.8240884590001],[-71.386602437,41.8240711290001],[-71.386632767,41.8240531160001],[-71.386664872,41.8240343960001],[-71.3866988089999,41.824016339],[-71.3867336609999,41.8240002750001],[-71.386771295,41.823984212],[-71.3868107,41.8239694320001],[-71.38685197,41.823954654],[-71.386892351,41.82394127],[-71.386933648,41.823928504],[-71.38697586,41.8239164020001],[-71.387019021,41.823904987],[-71.387063067,41.8238935730001],[-71.387107081,41.8238821140001],[-71.38715113,41.823869991],[-71.3871942599999,41.8238578900001],[-71.387235499,41.8238431120001],[-71.387272214,41.823827712],[-71.387302543,41.823809698],[-71.387330095,41.823789692],[-71.387355785,41.823767694],[-71.387381445,41.8237450340001],[-71.3874043869999,41.823720999],[-71.3874246349999,41.8236984010001],[-71.387443967,41.8236758030001],[-71.38746513,41.8236545330001],[-71.387489017,41.823631871],[-71.3875155379999,41.82360713],[-71.387541114,41.823580421],[-71.387567577,41.8235522730001],[-71.3875930949999,41.8235241690001],[-71.3876168099999,41.8234947610001],[-71.3876395789999,41.8234646880001],[-71.3876614019999,41.8234332420001],[-71.387683285,41.8234024820001],[-71.3877060249999,41.823371724],[-71.387727906,41.823341672],[-71.387748871,41.823311575],[-71.387769836,41.823281523],[-71.387788051,41.823250165],[-71.387805379,41.82321876],[-71.387819959,41.8231860720001],[-71.387834509,41.823152721],[-71.387849978,41.8231186850001],[-71.387866302,41.823084603],[-71.387883602,41.823051896],[-71.387904479,41.823019808],[-71.387927278,41.8229890480001],[-71.3879509619999,41.8229596400001],[-71.387975594,41.822930872],[-71.388000225,41.822902104],[-71.388024827,41.8228726510001],[-71.388049428,41.82284322],[-71.3880731419999,41.822814452],[-71.388096826,41.8227850430001],[-71.388117791,41.822754968],[-71.3881387549999,41.8227242300001],[-71.388156082,41.822693557],[-71.38817341,41.822662861],[-71.3881907959999,41.822633538],[-71.388209097,41.822605518],[-71.38822923,41.8225788510001],[-71.388251197,41.822552161],[-71.3882749379999,41.822525451],[-71.388297822,41.822498717],[-71.388320676,41.8224720050001],[-71.3883426419999,41.822446002],[-71.388364579,41.82241865],[-71.3883874049999,41.8223905660001],[-71.3884111199999,41.8223611340001],[-71.3884311369999,41.822330418],[-71.3884494389999,41.822301759],[-71.3884650479999,41.822274469],[-71.388478881,41.8222485490001],[-71.3884918269999,41.822223337],[-71.388503884,41.8221988340001],[-71.3885141379999,41.8221743060001],[-71.388523474,41.8221498],[-71.388531008,41.822124697],[-71.3885394289999,41.8220995040001],[-71.388546904,41.8220730520001],[-71.388553464,41.8220451810001],[-71.3885599939999,41.8220173570001],[-71.388566526,41.82198816],[-71.388573086,41.821960335],[-71.3885796449999,41.821933196],[-71.38858715,41.821907384],[-71.388596516,41.8218835420001],[-71.388612267,41.821862335],[-71.3886317129999,41.8218438070001],[-71.388655682,41.821825878],[-71.388679683,41.8218079500001],[-71.388700902,41.8217893780001],[-71.388718486,41.821768859],[-71.388728826,41.821747052],[-71.3887327799999,41.821723981],[-71.388733096,41.8217002900001],[-71.3887324949999,41.8216766200001],[-71.3887373649999,41.8216535500001],[-71.3887467879999,41.821632429],[-71.388758959,41.8216126360001],[-71.388772962,41.8215941720001],[-71.388787883,41.821575732],[-71.388801918,41.8215565580001],[-71.388815864,41.821536059],[-71.388828955,41.821514918],[-71.388841644,41.821496795],[-71.3888437589999,41.8214937560001],[-71.388860483,41.8214752260001],[-71.3888799869999,41.8214587100001],[-71.388902296,41.8214455820001],[-71.388923774,41.8214364790001],[-71.388944421,41.8214300720001],[-71.388959657,41.821424461],[-71.388967619,41.821416922],[-71.3889718569999,41.821406041],[-71.388975182,41.821392438],[-71.388978419,41.8213768210001],[-71.388981594,41.821361251],[-71.3889839729999,41.8213469830001],[-71.3889863809999,41.821333424],[-71.3889878689999,41.821321213],[-71.388987614,41.8213103740001],[-71.388985609,41.8213022990001],[-71.388980025,41.8212962790001],[-71.388970891,41.821292337],[-71.3889590639999,41.8212898100001],[-71.388944516,41.8212866170001],[-71.3889281369999,41.821282782],[-71.388911728,41.8212775750001],[-71.38889526,41.8212710650001],[-71.388877909,41.8212631810001],[-71.388862331,41.821255276],[-71.388847609,41.8212473500001],[-71.388834752,41.8212394020001],[-71.388822841,41.8212321180001],[-71.388812703,41.821225499],[-71.388805347,41.8212188370001],[-71.3888015639999,41.8212134600001],[-71.388799618,41.8212073970001],[-71.388798645,41.8212047210001],[-71.388797671,41.821202021],[-71.388794865,41.8211979930001],[-71.388791114,41.8211926610001],[-71.388785532,41.8211859560001],[-71.38877989,41.8211779000001],[-71.388773333,41.82116854],[-71.38876583,41.821157785],[-71.3887573539999,41.8211443760001],[-71.388747876,41.821127604],[-71.388737453,41.8211081320001],[-71.3887278619999,41.8210859180001],[-71.3887182129999,41.8210610040001],[-71.3887093659999,41.821032707],[-71.388701377,41.8210023760001],[-71.3886933319999,41.8209700090001],[-71.388686145,41.820935585],[-71.3886798779999,41.8209011600001],[-71.388675354,41.8208653670001],[-71.3886708319999,41.820828224],[-71.388665362,41.8207910570001],[-71.3886590079999,41.820753294],[-71.38865085,41.820715507],[-71.3886426889999,41.8206790470001],[-71.388632754,41.8206426530001],[-71.388621902,41.8206069450001],[-71.388611053,41.820569864],[-71.388600173,41.8205321200001],[-71.388589236,41.820492341],[-71.388580103,41.820452586],[-71.388571027,41.8204147760001],[-71.388563812,41.8203797100001],[-71.388555797,41.820347321],[-71.388548638,41.8203149550001],[-71.38854151,41.8202825650001],[-71.388534383,41.8202495130001],[-71.388529029,41.820216418],[-71.388524591,41.8201840310001],[-71.388523821,41.8201522200001],[-71.388526715,41.8201230880001],[-71.388534218,41.8200972540001],[-71.3885445,41.8200741210001],[-71.388558476,41.8200543070001],[-71.388577949,41.8200371280001],[-71.388601147,41.820023269],[-71.3886261449999,41.8200107160001],[-71.388652119,41.820000221],[-71.388679038,41.8199910320001],[-71.38869109,41.8199874760001],[-71.38870779,41.8199825300001],[-71.388734738,41.8199747350001],[-71.388759851,41.8199669150001],[-71.3887811119999,41.8199585890001],[-71.388798311,41.819948794],[-71.388808877,41.8199378050001],[-71.388813117,41.8199255970001],[-71.388810024,41.8199107290001],[-71.3888032959999,41.8198945780001],[-71.3887928739999,41.819875106],[-71.388781506,41.819854971],[-71.3887692229999,41.8198334860001],[-71.388754219,41.8198120430001],[-71.388740072,41.8197892520001],[-71.388725957,41.8197663930001],[-71.388713615,41.819743557],[-71.3887031369999,41.8197214100001],[-71.388693544,41.8196998820001],[-71.3886866729999,41.8196783330001],[-71.388679801,41.8196560980001],[-71.388672014,41.8196338390001],[-71.388661505,41.8196116920001],[-71.388650109,41.8195895210001],[-71.3886386849999,41.8195666410001],[-71.38862729,41.8195444940001],[-71.388615864,41.8195223220001],[-71.388604498,41.819500792],[-71.3885958499999,41.819480636],[-71.388588149,41.819461785],[-71.388583194,41.8194449260001],[-71.388582824,41.819429375],[-71.388586032,41.819413072],[-71.38859554,41.819395382],[-71.388597072,41.819393027],[-71.388608628,41.8193755670001],[-71.388622604,41.8193550670001],[-71.3886374379999,41.8193338820001],[-71.388650496,41.8193134050001],[-71.388662669,41.8192929260001],[-71.388673008,41.8192718060001],[-71.3886806519999,41.8192527630001],[-71.3886838339999,41.8192344490001],[-71.388685209,41.819216818],[-71.38868481,41.8192005810001],[-71.3886845229999,41.819189398],[-71.388684408,41.8191850530001],[-71.388684037,41.8191701420001],[-71.3886872739999,41.8191545490001],[-71.388694119,41.8191382040001],[-71.388704515,41.8191198050001],[-71.388713966,41.819099393],[-71.388722442,41.819076921],[-71.3887282549999,41.819057442],[-71.3887291149999,41.8190544930001],[-71.388728574,41.819032173],[-71.388720814,41.8190113090001],[-71.3887076999999,41.818992544],[-71.388690977,41.81897517],[-71.388674282,41.8189591920001],[-71.3886576199999,41.8189424820001],[-71.388642729,41.818926436],[-71.3886296439999,41.8189090430001],[-71.3886165599999,41.818891605],[-71.388606163,41.8188748090001],[-71.3885976609999,41.818859364],[-71.388592794,41.818845272],[-71.388590456,41.8188363510001],[-71.3885897869999,41.8188337660001],[-71.3885877549999,41.818824342],[-71.3885866379999,41.818816246],[-71.3885864379999,41.818808104],[-71.388587155,41.8188006730001],[-71.38858784,41.81879251],[-71.38858859,41.8187837290001],[-71.3885883029999,41.818772912],[-71.3885889329999,41.818762072],[-71.388588676,41.8187512320001],[-71.388586587,41.8187397500001],[-71.388582663,41.8187283120001],[-71.388576966,41.8187168950001],[-71.3885731029999,41.8187061200001],[-71.388569208,41.818695345],[-71.3885662019999,41.818683885],[-71.38856228,41.8186710750001],[-71.388558328,41.8186582870001],[-71.388555293,41.8186454550001],[-71.388552288,41.818633332],[-71.3885511139999,41.818622491],[-71.388556099,41.8186041550001],[-71.388564059,41.8185973020001],[-71.388565177,41.8185695180001],[-71.388557818,41.8185642280001],[-71.388507677,41.8185493600001],[-71.3884958519999,41.8185461240001],[-71.3884689069999,41.818517398],[-71.3884677899999,41.8185093010001],[-71.3884675899999,41.818501182],[-71.388465614,41.8184944340001],[-71.388434517,41.8184806830001],[-71.38842547,41.8184801260001],[-71.388418224,41.8184802100001],[-71.388414617,41.818480252],[-71.388323548,41.8181269340001],[-71.388323375,41.818120187],[-71.3883232049999,41.818112732],[-71.3883220879999,41.818104636],[-71.388320971,41.818096516],[-71.388319885,41.818088419],[-71.3883187989999,41.8180803230001],[-71.388317624,41.8180701680001],[-71.3883164219999,41.818058046],[-71.388315134,41.818043135],[-71.388314791,41.818028956],[-71.38831442,41.818014045],[-71.388314076,41.8180005290001],[-71.388312905,41.817988384],[-71.388308122,41.8179789810001],[-71.388301621,41.817972275],[-71.3882924879999,41.817968378],[-71.38828155,41.8179651200001],[-71.388267949,41.817963277],[-71.388250681,41.817960837],[-71.388232554,41.8179590340001],[-71.3882116789999,41.817956613],[-71.3881898879999,41.817953528],[-71.388167209,41.817950464],[-71.388143585,41.817946713],[-71.388119075,41.8179423220001],[-71.388093646,41.8179386150001],[-71.388068217,41.817934908],[-71.388043736,41.817931866],[-71.388022862,41.817928781],[-71.3880073399999,41.8179235970001],[-71.387997261,41.8179183280001],[-71.3879925649999,41.8179116000001],[-71.3879914779999,41.817903481],[-71.387991249,41.8178946990001],[-71.387990992,41.8178845680001],[-71.387991652,41.8178743920001],[-71.387992283,41.817862889],[-71.387993771,41.8178506790001],[-71.387997066,41.817837098],[-71.3880011919999,41.817820797],[-71.388005258,41.8178025060001],[-71.388010127,41.817780785],[-71.3880149679999,41.817756321],[-71.388019695,41.8177285400001],[-71.38802531,41.8176986780001],[-71.38803267,41.817668133],[-71.3880409769999,41.817637543],[-71.388051087,41.817607664],[-71.388060281,41.8175770510001],[-71.388070391,41.8175471490001],[-71.38808053,41.8175179090001],[-71.388091555,41.8174886480001],[-71.388102611,41.81745941],[-71.388112721,41.8174301710001],[-71.3881237479999,41.8174002690001],[-71.388133829,41.8173689720001],[-71.3881439099999,41.8173376980001],[-71.388153992,41.817306446],[-71.388163215,41.817276565],[-71.38817152,41.8172473240001],[-71.388178997,41.817220164],[-71.388184725,41.8171957220001],[-71.3881896509999,41.817175374],[-71.388195551,41.817158342],[-71.388202454,41.8171440340001],[-71.3882084649999,41.817132445],[-71.388212762,41.817122913],[-71.388216228,41.8171161010001],[-71.3882196929999,41.8171106390001],[-71.3882241329999,41.8171065500001],[-71.388230374,41.81710308],[-71.388237505,41.8170989020001],[-71.388244635,41.8170947470001],[-71.388250849,41.817089927],[-71.3882552009999,41.817083757],[-71.388258639,41.817075619],[-71.388262906,41.8170653780001],[-71.3882698639999,41.817054453],[-71.388280374,41.817040788],[-71.388292688,41.817026393],[-71.38830675,41.817009301],[-71.388319865,41.8169915450001],[-71.388333869,41.8169723720001],[-71.388348731,41.8169518730001],[-71.388364512,41.8169306660001],[-71.388381121,41.8169074480001],[-71.388396813,41.8168842050001],[-71.388413423,41.8168603010001],[-71.388429174,41.816839094],[-71.388443205,41.8168213160001],[-71.388454603,41.8168069430001],[-71.38846159,41.8167967040001],[-71.388467775,41.8167911990001],[-71.3884758519999,41.8167876840001],[-71.3884893379999,41.8167848160001],[-71.388507351,41.8167811970001],[-71.388528025,41.8167761400001],[-71.3885496139999,41.816771794],[-71.388570348,41.8167681320001],[-71.388590192,41.8167658190001],[-71.388604624,41.8167642550001],[-71.388615476,41.8167641050001],[-71.3886208869999,41.816764065],[-71.388625412,41.816764],[-71.38862905,41.816763913],[-71.388636236,41.8167631650001],[-71.388646143,41.8167610020001],[-71.3886596309999,41.816758087],[-71.388676725,41.8167544680001],[-71.3886974289999,41.816750143],[-71.3887217389999,41.8167457540001],[-71.388749689,41.816741275],[-71.388779411,41.8167367990001],[-71.388811856,41.8167309300001],[-71.3888451569999,41.816725063],[-71.388879377,41.8167184860001],[-71.38891537,41.816711249],[-71.3889522819999,41.8167032810001],[-71.3889909979999,41.816695291],[-71.3890287959999,41.816687347],[-71.389064732,41.8166780280001],[-71.389099723,41.816667405],[-71.389134745,41.8166561190001],[-71.389168822,41.8166441220001],[-71.389202927,41.8166328130001],[-71.3892334239999,41.8166222310001],[-71.389262144,41.816613042],[-71.3892900069999,41.8166059120001],[-71.38931973,41.816600771],[-71.389350398,41.816596959],[-71.389383757,41.816592418],[-71.389417118,41.8165878980001],[-71.389451365,41.8165826950001],[-71.3894847239999,41.8165781530001],[-71.389517167,41.816574319],[-71.389544255,41.816571944],[-71.389564987,41.816568923],[-71.3895794489999,41.8165680440001],[-71.389589384,41.816567917],[-71.389598432,41.8165684750001],[-71.389607538,41.8165703820001],[-71.389618447,41.8165729300001],[-71.389632078,41.8165747730001],[-71.389647512,41.816577281],[-71.389665694,41.8165810720001],[-71.3896847949999,41.8165848630001],[-71.389706613,41.816589961],[-71.389731183,41.8165950380001],[-71.389757554,41.8166014440001],[-71.3897857589999,41.8166078290001],[-71.3898176009999,41.8166148120001],[-71.38985308,41.816623147],[-71.389892194,41.816632057],[-71.389933142,41.8166416330001],[-71.389975922,41.8166518960001],[-71.390017813,41.816663485],[-71.390057902,41.8166750950001],[-71.390096215,41.816688121],[-71.390133611,41.8167004370001],[-71.390169176,41.816711448],[-71.390201992,41.816721816],[-71.390230253,41.816730899],[-71.3902521589999,41.8167387190001],[-71.390269539,41.816746601],[-71.3902851459999,41.816755856],[-71.3903007499999,41.8167658180001],[-71.390316443,41.816777771],[-71.390332132,41.816791096],[-71.390348799,41.8168057240001],[-71.3903636599999,41.81682177],[-71.3903767159999,41.8168378130001],[-71.390388915,41.8168552510001],[-71.390399251,41.8168713600001],[-71.3904105349999,41.8168874250001],[-71.3904244779999,41.816902805],[-71.390442919,41.8169167500001],[-71.390464079,41.8169313380001],[-71.390485268,41.8169472980001],[-71.3905055709999,41.8169632560001],[-71.390524983,41.8169805640001],[-71.390542652,41.8169992640001],[-71.390558487,41.817018008],[-71.390572516,41.8170374380001],[-71.390587463,41.817056182],[-71.390600606,41.8170756550001],[-71.390612833,41.8170937100001],[-71.3906240859999,41.817110461],[-71.390634365,41.817123872],[-71.390644588,41.817134561],[-71.390653867,41.8171432140001],[-71.390661253,41.8171498990001],[-71.3906667799999,41.817153884],[-71.390669558,41.817155875],[-71.390671389,41.81715789],[-71.390674196,41.8171612310001],[-71.390677948,41.8171659230001],[-71.3906835019999,41.8171719430001],[-71.390690977,41.8171806400001],[-71.390700254,41.8171906420001],[-71.3907104749999,41.8172019950001],[-71.3907216429999,41.8172140350001],[-71.3907337269999,41.8172267150001],[-71.3907475569999,41.817238026],[-71.390763221,41.8172486280001],[-71.390778827,41.8172579290001],[-71.3907953199999,41.817266497],[-71.3908117569999,41.817273007],[-71.390829997,41.817278856],[-71.390849126,41.8172839970001],[-71.390867309,41.817287788],[-71.3908863789999,41.8172916020001],[-71.3909045629999,41.817294729],[-71.390921799,41.8172971920001],[-71.39093815,41.8172996770001],[-71.390953584,41.8173021850001],[-71.390969019,41.8173040070001],[-71.390984424,41.817305805],[-71.390998972,41.8173076480001],[-71.391012573,41.817309467],[-71.3910262049999,41.81731131],[-71.3910389169999,41.817313837],[-71.3910507149999,41.817315701],[-71.391062512,41.8173175650001],[-71.39107434,41.8173194510001],[-71.391086166,41.817322],[-71.3910988499999,41.8173238190001],[-71.391111592,41.81732637],[-71.391123418,41.817329606],[-71.391135245,41.817332155],[-71.3911461549999,41.8173339950001],[-71.3911570659999,41.8173358810001],[-71.3911697789999,41.817338432],[-71.3911825229999,41.8173409360001],[-71.3911961809999,41.8173448370001],[-71.391208924,41.817348028],[-71.391220748,41.817351263],[-71.3912352949999,41.8173544100001],[-71.391251674,41.817358267],[-71.391271691,41.8173620590001],[-71.391292623,41.817367156],[-71.3913144699999,41.8173736260001],[-71.391333657,41.8173808020001],[-71.3913528419999,41.817388641],[-71.39137117,41.8173971890001],[-71.391389467,41.817406422],[-71.391406934,41.817417004],[-71.391422539,41.817426966],[-71.391437259,41.8174361960001],[-71.391453723,41.817444101],[-71.391471963,41.817449928],[-71.3914920089999,41.817455732],[-71.391512053,41.81746156],[-71.391533043,41.8174687380001],[-71.391558585,41.8174771770001],[-71.391586818,41.8174855510001],[-71.391617803,41.817493927],[-71.3916497019999,41.8175036310001],[-71.391681357,41.817513381],[-71.391759075,41.817545013],[-71.3917989409999,41.817616995],[-71.391799841,41.817681485],[-71.391828032,41.8177330120001],[-71.3918930739999,41.8177764330001],[-71.3919670729999,41.8177843460001],[-71.392055263,41.8177886140001],[-71.392156825,41.8178027270001],[-71.3922328309999,41.817817001],[-71.392311596,41.8178263360001],[-71.39239028,41.817829245],[-71.3924950479999,41.817828041],[-71.392640801,41.8177231180001],[-71.392648346,41.8176535810001],[-71.393656579,41.8176641470001],[-71.3936760619999,41.8175661720001],[-71.394081714,41.8175778900001],[-71.394076314,41.817665129],[-71.3949069079999,41.817708908],[-71.394955801,41.817702092],[-71.394960816,41.817701388],[-71.3950400909999,41.817679529],[-71.395128787,41.8176540200001],[-71.395202431,41.817635701],[-71.39527892,41.8176166980001],[-71.395357328,41.8176012180001],[-71.3954404739999,41.817585652],[-71.395525521,41.817568007],[-71.395591216,41.8175494050001],[-71.3956029,41.8175461230001],[-71.395669799,41.817520776],[-71.395735781,41.817495475],[-71.395816001,41.8174742800001],[-71.395903887,41.817458695],[-71.395992749,41.8174438410001],[-71.39608437,41.81742396],[-71.39617025,41.8174006200001],[-71.396246655,41.817376632],[-71.3963475899999,41.8173439510001],[-71.396430518,41.8173121020001],[-71.396500122,41.817277565],[-71.396563148,41.8172458560001],[-71.396601082,41.8172292420001],[-71.396642258,41.817211236],[-71.39671376,41.817174504],[-71.396741313,41.8171119370001],[-71.3967555679999,41.817049427],[-71.396798475,41.8170008930001],[-71.396844061,41.8169396220001],[-71.3969019909999,41.816883143],[-71.3969619009999,41.816830941],[-71.397013312,41.8167788010001],[-71.3970780669999,41.8167357520001],[-71.397159154,41.816708223],[-71.397242246,41.8166877140001],[-71.397245304,41.8166869400001],[-71.397321545,41.816667959],[-71.397387443,41.816636939],[-71.397448326,41.8165882590001],[-71.397509126,41.816532538],[-71.3975520339999,41.816483271],[-71.398124836,41.8160527970001],[-71.398138106,41.81603138],[-71.398142427,41.816024317],[-71.398116348,41.815987659],[-71.3983028119999,41.8158409160001],[-71.398359081,41.815866715],[-71.398428189,41.8157956320001],[-71.39960209,41.8145882580001],[-71.4003901199999,41.815445309],[-71.4004047459999,41.815476377],[-71.400710841,41.815851369],[-71.400954267,41.816149604],[-71.4012097299999,41.816056863],[-71.401276192,41.8161343080001],[-71.401070983,41.816229494],[-71.4010715599999,41.8162712760001],[-71.401071808,41.8162889990001],[-71.401104635,41.816331974],[-71.40112569,41.816357172],[-71.401448681,41.816743907],[-71.401503496,41.816801583],[-71.401681463,41.816990837],[-71.402447261,41.8179501000001],[-71.402500043,41.8179999990001],[-71.402549258,41.818062678],[-71.4025946259999,41.818122541],[-71.402643649,41.8181717960001],[-71.402691725,41.8182202950001],[-71.402726613,41.8182760110001],[-71.4027280769999,41.818278687],[-71.402807691,41.818435542],[-71.4028576429999,41.8184968260001],[-71.402899054,41.818545435],[-71.402943256,41.8185889910001],[-71.403529063,41.8192789300001],[-71.404150139,41.819862442],[-71.404261898,41.819911017],[-71.404331382,41.81993527],[-71.4043898849999,41.8199836860001],[-71.404408609,41.8200359790001],[-71.4044141809999,41.8200510090001],[-71.40454599,41.820411849],[-71.404556382,41.8204345890001],[-71.404594173,41.820493119],[-71.404621569,41.8205531260001],[-71.404654563,41.8206102560001],[-71.404704565,41.8206608830001],[-71.4047695909999,41.820702925],[-71.404827089,41.8207698860001],[-71.40491335,41.8208621410001],[-71.404993079,41.8209473700001],[-71.4050512219999,41.8210130510001],[-71.405086838,41.8210346920001],[-71.4051964729999,41.821114983],[-71.4052245349999,41.821117041],[-71.405428026,41.821323873],[-71.4054168169999,41.8213371730001],[-71.405505,41.821432906],[-71.405496604,41.8214455230001],[-71.40555848,41.8215097660001],[-71.405560587,41.8215118480001],[-71.4058041449999,41.8217508430001],[-71.4058538479999,41.8217976270001],[-71.406002099,41.8219828250001],[-71.4060808199999,41.8220484770001],[-71.4061352579999,41.822119071],[-71.4062383689999,41.8222105850001],[-71.4062946569999,41.8222713700001],[-71.406303196,41.8223280450001],[-71.406379215,41.8224223720001],[-71.406470242,41.82254118],[-71.4065649679999,41.8226382890001],[-71.406627874,41.8227319420001],[-71.406687963,41.8228284050001],[-71.4067527619999,41.822924163],[-71.4068437719999,41.8230338920001],[-71.4069309659999,41.82311844],[-71.406977012,41.8232008960001],[-71.4070877629999,41.82335958],[-71.407206956,41.8235168530001],[-71.4072079859999,41.823544844],[-71.407358065,41.8237188140001],[-71.407429505,41.823853064],[-71.407467158,41.8239481370001],[-71.407511259,41.824001937],[-71.4075365309999,41.8240110360001],[-71.407580472,41.8240067500001],[-71.4076781749999,41.824162632],[-71.407704645,41.824209329],[-71.40778411223079,41.82418234746746],[-71.4099126300366,41.8271874954028],[-71.4101796595896,41.8275765943845],[-71.4102101788646,41.8276261855246],[-71.4103932818698,41.8279084741262],[-71.4104543174998,41.8280076562763],[-71.410530610582,41.8281564292571],[-71.4105992753629,41.828270869014],[-71.4106297931063,41.8283280895098],[-71.4106899167339,41.8284768624004],[-71.410823305036,41.8288656298338],[-71.4108668478114,41.8290523948584],[-71.4110017333235,41.8297011459988],[-71.4112628222969,41.8309462267564],[-71.4113237705667,41.8312181833332],[-71.411335167394,41.8314256265726],[-71.4113316989313,41.8315095471672],[-71.4113316977855,41.8316011008073],[-71.4113316978445,41.8316926535466],[-71.4113088099252,41.831871944623],[-71.4112630338082,41.8319863855267],[-71.411217256616,41.8321084558783],[-71.4112019986766,41.8321427875005],[-71.4111791107841,41.8321771222243],[-71.4111638514942,41.8321923783662],[-71.4111104464981,41.8322343414488],[-71.4110417812762,41.8322686722235],[-71.4110112632405,41.8322839318328],[-71.410950229274,41.8323068206592],[-71.4108420468866,41.8323565344689],[-71.4108203494493,41.8323682301304],[-71.4107992428098,41.8323853309789],[-71.4107835619693,41.8324006344603],[-71.4107751115403,41.8324132407396],[-71.4107569999477,41.8324434069187],[-71.4107503444915,41.8324663756866],[-71.4107137171227,41.833077389856],[-71.4106908311362,41.8332147177936],[-71.4106603116658,41.8333215300189],[-71.4106221644698,41.8334092680324],[-71.4105458707566,41.8335771145504],[-71.4101720300389,41.8343629424054],[-71.410149941272,41.8344292071308],[-71.4101491409478,41.8344316059062],[-71.4101415123869,41.8345079000026],[-71.4101262545609,41.8346299712269],[-71.4100957370574,41.8348512234624],[-71.4100652204654,41.8353356913306],[-71.4100499603185,41.8356294227808],[-71.4099507775896,41.8364266933943],[-71.4099355185222,41.836525876161],[-71.4099050006618,41.8367814599556],[-71.409897371253,41.8368081642947],[-71.4098821125484,41.8369035314161],[-71.4097676718447,41.8373956274454],[-71.409721894981,41.8375863613429],[-71.4096990075383,41.8376741001718],[-71.4096303459004,41.8379716464992],[-71.4096150837072,41.838036497518],[-71.4095311607928,41.8383531162141],[-71.4094853837423,41.8385438508853],[-71.4093862025882,41.8388299539869],[-71.409332796727,41.8389863571951],[-71.4092281832032,41.8392621550888],[-71.4091649496341,41.8394288593042],[-71.4087300742902,41.8406190468758],[-71.408722445147,41.8406381198605],[-71.4082951972208,41.8414887980744],[-71.4081502401072,41.8417253097519],[-71.4080510585178,41.8418855264128],[-71.4079823929874,41.8419999672886],[-71.4079671323543,41.8420190413074],[-71.4077916587593,41.8423204027378],[-71.4075093707981,41.8427934243973],[-71.4072194535833,41.8432855190992],[-71.4072042926824,41.8433126988252],[-71.4065938430141,41.8444070423315],[-71.4065851202854,41.8444222572298],[-71.4059224559667,41.845578155497],[-71.4059179776925,41.8455857317618],[-71.4052052936175,41.8467912292132],[-71.4051904968181,41.8468145114012],[-71.4046864927653,41.8476075740927],[-71.4042398692105,41.848307047365],[-71.4037633364168,41.8490533454386],[-71.4035268265119,41.8494271852794],[-71.4033183507077,41.8497649168323],[-71.4031453561431,41.8500451653629],[-71.4028047875633,41.85061903077],[-71.4024367229717,41.8512392147297],[-71.402382416688,41.8513307192109],[-71.4020155392857,41.8519306614092],[-71.4014516292744,41.8528527832526],[-71.4011388249152,41.8533715811394],[-71.4007573555153,41.8540048216404],[-71.4001470032772,41.8554887407156],[-71.3996663510089,41.8566255203421],[-71.39965860767181,41.85662730506629]]]]}},{"type":"Feature","properties":{"OBJECTID":2,"zone":"North","path":"MultiPolygon?crs=EPSG:4326&field=OBJECTID:integer(0,0)&field=NAME:string(0,0)&field=COUNTY:string(0,0)&field=OSP:double(0,0)&field=TWNCODE:string(0,0)&field=LAND:string(0,0)&field=Shape__Area:double(0,0)&field=Shape__Length:double(0,0)&field=OBJECTID_2:integer(0,0)&field=SURFACE:integer(0,0)&field=CLASS:integer(0,0)&field=MCODE:integer(0,0)&field=RTNO:string(0,0)&field=NAME_2:string(0,0)&field=SCENIC:integer(0,0)&field=JURIS:integer(0,0)&field=LANES:integer(0,0)&field=NHS:integer(0,0)&field=LTWN:string(0,0)&field=RTWN:string(0,0)&field=DIVISION:string(0,0)&field=ROADTYPE:string(0,0)&field=COUNTY_2:string(0,0)&field=ROADCLASS:integer(0,0)&field=F_SYSTEM:integer(0,0)&field=Urban_Code:integer(0,0)&field=Shape_Leng:double(0,0)&uid={f8e53fc4-8dde-4fe0-9045-80a5bebdcd47}","displayColor":"#C2470A"},"geometry":{"type":"MultiPolygon","coordinates":[[[[-71.416854078,41.8596353350001],[-71.414033876,41.859244436],[-71.4127405899999,41.8590734900001],[-71.4109252069999,41.8588505010001],[-71.4108225859999,41.8588166330001],[-71.410859736,41.8585816880001],[-71.410844601,41.8584108470001],[-71.410735669,41.8582961060001],[-71.4101858619999,41.8575511350001],[-71.40981241,41.8571897190001],[-71.40933553,41.8565603160001],[-71.4090422849999,41.8565124030001],[-71.40539596,41.8565529370001],[-71.403028768,41.8565844940001],[-71.401446657,41.8566086170001],[-71.3996912279999,41.856627336],[-71.398456381,41.8566261650001],[-71.39965860767181,41.85662730506629],[-71.3996663510089,41.8566255203421],[-71.4001470032772,41.8554887407156],[-71.4007573555153,41.8540048216404],[-71.4011388249152,41.8533715811394],[-71.4014516292744,41.8528527832526],[-71.4020155392857,41.8519306614092],[-71.402382416688,41.8513307192109],[-71.4024367229717,41.8512392147297],[-71.4028047875633,41.85061903077],[-71.4031453561431,41.8500451653629],[-71.4033183507077,41.8497649168323],[-71.4035268265119,41.8494271852794],[-71.4037633364168,41.8490533454386],[-71.4042398692105,41.848307047365],[-71.4046864927653,41.8476075740927],[-71.4051904968181,41.8468145114012],[-71.4052052936175,41.8467912292132],[-71.4059179776925,41.8455857317618],[-71.4059224559667,41.845578155497],[-71.4065851202854,41.8444222572298],[-71.4065938430141,41.8444070423315],[-71.4072042926824,41.8433126988252],[-71.4072194535833,41.8432855190992],[-71.4075093707981,41.8427934243973],[-71.4077916587593,41.8423204027378],[-71.4079671323543,41.8420190413074],[-71.4079823929874,41.8419999672886],[-71.4080510585178,41.8418855264128],[-71.4081502401072,41.8417253097519],[-71.4082951972208,41.8414887980744],[-71.408722445147,41.8406381198605],[-71.4087300742902,41.8406190468758],[-71.4091649496341,41.8394288593042],[-71.4092281832032,41.8392621550888],[-71.409332796727,41.8389863571951],[-71.4093862025882,41.8388299539869],[-71.4094853837423,41.8385438508853],[-71.4095311607928,41.8383531162141],[-71.4096150837072,41.838036497518],[-71.4096303459004,41.8379716464992],[-71.4096990075383,41.8376741001718],[-71.409721894981,41.8375863613429],[-71.4097676718447,41.8373956274454],[-71.4098821125484,41.8369035314161],[-71.409897371253,41.8368081642947],[-71.4099050006618,41.8367814599556],[-71.4099355185222,41.836525876161],[-71.4099507775896,41.8364266933943],[-71.4100499603185,41.8356294227808],[-71.4100652204654,41.8353356913306],[-71.4100957370574,41.8348512234624],[-71.4101262545609,41.8346299712269],[-71.4101415123869,41.8345079000026],[-71.4101491409478,41.8344316059062],[-71.410149941272,41.8344292071308],[-71.4101720300389,41.8343629424054],[-71.4105458707566,41.8335771145504],[-71.4106221644698,41.8334092680324],[-71.4106603116658,41.8333215300189],[-71.4106908311362,41.8332147177936],[-71.4107137171227,41.833077389856],[-71.4107503444915,41.8324663756866],[-71.4107569999477,41.8324434069187],[-71.4107751115403,41.8324132407396],[-71.4107835619693,41.8324006344603],[-71.4107992428098,41.8323853309789],[-71.4108203494493,41.8323682301304],[-71.4108420468866,41.8323565344689],[-71.410950229274,41.8323068206592],[-71.4110112632405,41.8322839318328],[-71.4110417812762,41.8322686722235],[-71.4111104464981,41.8322343414488],[-71.4111638514942,41.8321923783662],[-71.4111791107841,41.8321771222243],[-71.4112019986766,41.8321427875005],[-71.411217256616,41.8321084558783],[-71.4112630338082,41.8319863855267],[-71.4113088099252,41.831871944623],[-71.4113316978445,41.8316926535466],[-71.4113316977855,41.8316011008073],[-71.4113316989313,41.8315095471672],[-71.411335167394,41.8314256265726],[-71.4114811971736,41.8314083113394],[-71.4116476519428,41.8314051640565],[-71.4122038609254,41.8314678345349],[-71.4128076347145,41.831531900646],[-71.4140871229677,41.8316592659686],[-71.4144506514342,41.83168574524],[-71.4155543839605,41.8317619094841],[-71.4162898950922,41.8318337951708],[-71.4165822584346,41.831862138036],[-71.4168773585016,41.8319024602427],[-71.4171976646502,41.8319597379342],[-71.4172234814402,41.8319630517803],[-71.4172559818187,41.8319692533196],[-71.4174508722834,41.8320214403152],[-71.4175616637658,41.8320570760532],[-71.4177352240354,41.8321185918703],[-71.4180169468635,41.832215268166],[-71.4181542755309,41.8322648604098],[-71.4183568911509,41.8323409841702],[-71.4189091084921,41.8325609634038],[-71.4191384674324,41.832650144261],[-71.4191931884574,41.8326730279584],[-71.4199929608243,41.8329820338568],[-71.4205575358886,41.8332109045917],[-71.4211425869634,41.8334405113741],[-71.4215896042537,41.8336258504273],[-71.4219742432316,41.8337754775766],[-71.4236193298335,41.8344200091132],[-71.4240481535596,41.8345880120654],[-71.4244525459241,41.8347545685098],[-71.4248505255926,41.8349122582024],[-71.4253054181841,41.8350943520873],[-71.42564715551,41.8352212504754],[-71.4258307254242,41.8351525869164],[-71.426689674875,41.8349580341313],[-71.4271092910448,41.8348626681428],[-71.4273076552478,41.8348207057335],[-71.4275517949768,41.834763484118],[-71.4280324482576,41.8346528591875],[-71.4281621486349,41.834626156211],[-71.4283910305279,41.8345803791705],[-71.428879312979,41.8344811969469],[-71.4291310808243,41.8344277914268],[-71.429253151913,41.8344049026454],[-71.429596475859,41.8343324238687],[-71.4302373430915,41.8342027240843],[-71.4305348905678,41.8341340600349],[-71.4309773947723,41.8340463214054],[-71.4312381779741,41.8339946147172],[-71.4314199001751,41.8339585837715],[-71.4316564112958,41.8339318811422],[-71.432076027661,41.8338708458],[-71.4323735748223,41.8338403288221],[-71.4324498684993,41.833832699228],[-71.4325261629674,41.8338288843174],[-71.4326634920501,41.8338288847712],[-71.4328084517112,41.8338365135899],[-71.4330373325992,41.8338632162279],[-71.4331212569687,41.8338746598028],[-71.433350137431,41.8339089921848],[-71.4334264321164,41.8339166217779],[-71.4336934617557,41.833958583438],[-71.4339299720786,41.8339891016335],[-71.4341435972775,41.8340005442601],[-71.4343114425103,41.8340005449292],[-71.4344640306905,41.8339891014519],[-71.4345479535141,41.8339776573821],[-71.4346700242261,41.8339547691439],[-71.4347463182921,41.8339395103582],[-71.4351354150746,41.8338365132378],[-71.4353185228263,41.8337716633756],[-71.4354634811614,41.8337220723374],[-71.4362111625277,41.8334397845986],[-71.4365239669409,41.8333253438892],[-71.436836773852,41.8332109023269],[-71.4371419471975,41.8330964620358],[-71.4374623832276,41.832978205504],[-71.4378285947898,41.8328485061481],[-71.4380651049627,41.8327645837047],[-71.4385381271064,41.832592921719],[-71.4389577439449,41.832501368553],[-71.4393392146392,41.8324250742618],[-71.4395375790891,41.8324021868945],[-71.4398046068814,41.8323678540682],[-71.4398122367996,41.8323640388297],[-71.4401326716511,41.8323373365708],[-71.4402394823639,41.8323258930624],[-71.440277630915,41.8323258921946],[-71.4405522893913,41.8323030040003],[-71.4408422051544,41.8322801167052],[-71.440933758376,41.832276301365],[-71.4410100516975,41.8322724862194],[-71.4413610051975,41.8322763014756],[-71.4417119578383,41.8322877451289],[-71.4417272165275,41.8322877447673],[-71.4417501051627,41.8322877446718],[-71.441834027508,41.8322915587156],[-71.4422917911614,41.8323030051133],[-71.4424977847051,41.832314448179],[-71.4425206723442,41.8323182635645],[-71.4433446484845,41.8323449654983],[-71.4438939667862,41.8323640395841],[-71.4445272041386,41.8324555928452],[-71.4451070380664,41.8325318860787],[-71.4455800625205,41.8325891070809],[-71.4458623497471,41.8326310683968],[-71.4463048528646,41.8326959186008],[-71.4466329178651,41.8327416943385],[-71.4470754244615,41.832802729541],[-71.4473653407216,41.8328408768424],[-71.4476323698835,41.8328713943154],[-71.4479222862667,41.832905724576],[-71.4480290965373,41.8328942828284],[-71.4481130191282,41.8328828387487],[-71.4481969440976,41.8328713937083],[-71.4486623357912,41.832825616947],[-71.4488149247062,41.8328065447415],[-71.4489751423343,41.8327874703201],[-71.4492421721025,41.8327569528],[-71.4493489830958,41.8327455098252],[-71.4497457127815,41.8327073629598],[-71.4498525236044,41.8326959177158],[-71.4503408046829,41.8326539570763],[-71.4506078339275,41.8326272538162],[-71.4510350794535,41.8325814762403],[-71.4513249980425,41.8325547738642],[-71.4516072840081,41.8325280711425],[-71.4517675020648,41.8325128120617],[-71.4520497900702,41.8324861091534],[-71.4522100091202,41.8324708512564],[-71.4523397102157,41.832459406017],[-71.452782210511,41.8324174448048],[-71.4528432461743,41.832409816098],[-71.453026352698,41.8323907418168],[-71.4534917455449,41.8323487809271],[-71.4537969210972,41.8323182628514],[-71.4543233506791,41.8322686711467],[-71.4545522311964,41.8322495991193],[-71.4546895625727,41.8322381542446],[-71.4552388755486,41.8321923776003],[-71.4552617653549,41.8321923766135],[-71.4552770254724,41.8321885624186],[-71.4553990964807,41.8321809344916],[-71.4556356063,41.8321618596656],[-71.456177294858,41.8321237140616],[-71.4562154408822,41.8321237133017],[-71.4562535881096,41.8321237134299],[-71.4562764754838,41.8321237122399],[-71.4562917341332,41.832123713545],[-71.456390917347,41.8321198986911],[-71.4564977280675,41.8321160839393],[-71.4566045410143,41.8321160838241],[-71.4566884641831,41.8321160830846],[-71.4567647584694,41.8321198986495],[-71.4568410503577,41.8321237132625],[-71.4569707514535,41.8321351575058],[-71.4571004511139,41.8321542301718],[-71.4572225219892,41.8321771190875],[-71.4573217032695,41.8321961927396],[-71.4574132568379,41.8322228947492],[-71.4574590323875,41.8322381535438],[-71.4575048080742,41.8322495975852],[-71.4575811029965,41.8322801157528],[-71.4576497667318,41.8323144484924],[-71.4577184318474,41.832344965556],[-71.4579320541521,41.8324784804758],[-71.4581609357297,41.8326310679253],[-71.4583974483366,41.832787471513],[-71.4585805537457,41.8328980965575],[-71.4586949948014,41.8329667606694],[-71.4588170649689,41.8330316126675],[-71.4589009914179,41.8330697585575],[-71.4589772819859,41.833096461958],[-71.4590535762295,41.8331231644085],[-71.459190906143,41.8331422374306],[-71.459396899373,41.8331536817011],[-71.4595494871307,41.8331613109816],[-71.4596334116753,41.8331651264268],[-71.4597554816718,41.833168939875],[-71.4602819107615,41.833176569796],[-71.4604192385151,41.8331803842119],[-71.4609151487683,41.8331880133159],[-71.4609761843807,41.8331880133587],[-71.4610372199926,41.8331880142694],[-71.4610906267554,41.8331880143646],[-71.4611592887088,41.8331841985572],[-71.4612279541587,41.8331765697763],[-71.4612889894334,41.833165123649],[-71.4613500243446,41.8331422377875],[-71.4614034324316,41.833107905128],[-71.46145683685,41.8330735724423],[-71.4615026135831,41.8330392398765],[-71.4615407601111,41.8330010927045],[-71.4615789064667,41.8329591316853],[-71.4616399433894,41.8328980965234],[-71.4617009765841,41.8328370622276],[-71.4617620132754,41.8327760260991],[-71.4618077881491,41.8327340639399],[-71.4618154175851,41.8327188066372],[-71.4618459377827,41.8326921037315],[-71.4618993414733,41.8326539561025],[-71.4619527467508,41.8326272526532],[-71.4620061521354,41.832604364814],[-71.4620671877741,41.8325891071387],[-71.462128223704,41.8325814761994],[-71.4621816298,41.8325776619527],[-71.4622426637942,41.8325814778574],[-71.4622960705613,41.8325929206961],[-71.4623494751116,41.8326081791443],[-71.4624105084695,41.8326234382635],[-71.4625173220409,41.8326692148692],[-71.4630056037688,41.8329438728865],[-71.4632650043259,41.8330888305099],[-71.463860097624,41.8334130799159],[-71.4642339370441,41.8335961871146],[-71.4644857071808,41.8337144418531],[-71.4645543710198,41.8337449602248],[-71.4646917009925,41.8338021776098],[-71.46476799458,41.8338403276661],[-71.464851918637,41.8338670295023],[-71.4649968766385,41.8338937327844],[-71.4654470114879,41.8339204362477],[-71.4655461952496,41.8339242510608],[-71.4660268447401,41.8339356952616],[-71.4662557285443,41.8339356951982],[-71.4669042275994,41.833931879157],[-71.4674840598922,41.8339166201462],[-71.4677663480334,41.833893732969],[-71.4678273826154,41.8338899182385],[-71.4682241124676,41.8338021790405],[-71.4685292880185,41.8337297011728],[-71.4686360986268,41.8337029975348],[-71.4690099390869,41.8335961865015],[-71.4692083030143,41.8335046331027],[-71.4693532635428,41.8334397835709],[-71.4694600751833,41.8333863787267],[-71.4697881379194,41.8332337896682],[-71.4700093897626,41.8331422372958],[-71.4702382732651,41.8330354257345],[-71.4703603440197,41.8329705761965],[-71.4703756021287,41.8329591314269],[-71.47044389391111,41.83292105505475],[-71.470653113,41.8329993310001],[-71.470884237,41.8331015270001],[-71.471041859,41.833203789],[-71.47135702,41.833337478],[-71.471567165,41.833431778],[-71.471756319,41.8335418510001],[-71.471924331,41.833754142],[-71.472092376,41.833887793],[-71.4722815119999,41.8340450330001],[-71.472428582,41.834162898],[-71.472481051,41.834280827],[-71.472470444,41.834414435],[-71.472417857,41.8345716160001],[-71.4723023,41.8347681440001],[-71.472147862,41.8349785550001],[-71.472102352,41.835208117],[-71.47209171,41.8354202780001],[-71.472112721,41.8356246430001],[-71.472112629,41.835836806],[-71.472133475,41.8361590870001],[-71.472206899,41.8363476860001],[-71.472648068,41.8368350650001],[-71.4710324499999,41.8377944650001],[-71.469951642,41.838502201],[-71.468538725,41.839397214],[-71.466706997,41.8406524430001],[-71.464911244,41.841843763],[-71.463586028,41.84274586],[-71.461540624,41.844086609],[-71.461039216,41.844457597],[-71.460421954,41.84484904],[-71.4601062199999,41.8450269620001],[-71.45904566,41.8457972030001],[-71.457499062,41.8468390200001],[-71.456153742,41.847651322],[-71.4552989439999,41.848291084],[-71.4530906859999,41.849761282],[-71.45052186,41.8514822080001],[-71.4482612629999,41.853007518],[-71.446532185,41.854161102],[-71.444845732,41.855295814],[-71.4428439069999,41.8566623180001],[-71.441180291,41.8577694590001],[-71.439677993,41.8587831],[-71.4384258329999,41.8595661690001],[-71.436394714,41.8609332300001],[-71.4353343769999,41.8616222090001],[-71.4349727869999,41.861846003],[-71.433333911,41.8617366660001],[-71.4317677929999,41.861607797],[-71.431128071,41.861549272],[-71.430769187,41.8614848240001],[-71.427556161,41.8610755820001],[-71.423756065,41.860561497],[-71.418368598,41.8598646200001],[-71.416854078,41.8596353350001]]]]}}]}

/***/ }),

/***/ "./node_modules/leaflet/dist/leaflet-src.js":
/*!**************************************************!*\
  !*** ./node_modules/leaflet/dist/leaflet-src.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* @preserve
 * Leaflet 1.5.1+build.2e3e0ff, a JS library for interactive maps. http://leafletjs.com
 * (c) 2010-2018 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 */

(function (global, factory) {
	 true ? factory(exports) :
	undefined;
}(this, (function (exports) { 'use strict';

var version = "1.5.1+build.2e3e0ffb";

/*
 * @namespace Util
 *
 * Various utility functions, used by Leaflet internally.
 */

var freeze = Object.freeze;
Object.freeze = function (obj) { return obj; };

// @function extend(dest: Object, src?: Object): Object
// Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
function extend(dest) {
	var i, j, len, src;

	for (j = 1, len = arguments.length; j < len; j++) {
		src = arguments[j];
		for (i in src) {
			dest[i] = src[i];
		}
	}
	return dest;
}

// @function create(proto: Object, properties?: Object): Object
// Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
var create = Object.create || (function () {
	function F() {}
	return function (proto) {
		F.prototype = proto;
		return new F();
	};
})();

// @function bind(fn: Function, …): Function
// Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
// Has a `L.bind()` shortcut.
function bind(fn, obj) {
	var slice = Array.prototype.slice;

	if (fn.bind) {
		return fn.bind.apply(fn, slice.call(arguments, 1));
	}

	var args = slice.call(arguments, 2);

	return function () {
		return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
	};
}

// @property lastId: Number
// Last unique ID used by [`stamp()`](#util-stamp)
var lastId = 0;

// @function stamp(obj: Object): Number
// Returns the unique ID of an object, assigning it one if it doesn't have it.
function stamp(obj) {
	/*eslint-disable */
	obj._leaflet_id = obj._leaflet_id || ++lastId;
	return obj._leaflet_id;
	/* eslint-enable */
}

// @function throttle(fn: Function, time: Number, context: Object): Function
// Returns a function which executes function `fn` with the given scope `context`
// (so that the `this` keyword refers to `context` inside `fn`'s code). The function
// `fn` will be called no more than one time per given amount of `time`. The arguments
// received by the bound function will be any arguments passed when binding the
// function, followed by any arguments passed when invoking the bound function.
// Has an `L.throttle` shortcut.
function throttle(fn, time, context) {
	var lock, args, wrapperFn, later;

	later = function () {
		// reset lock and call if queued
		lock = false;
		if (args) {
			wrapperFn.apply(context, args);
			args = false;
		}
	};

	wrapperFn = function () {
		if (lock) {
			// called too soon, queue to call later
			args = arguments;

		} else {
			// call and lock until later
			fn.apply(context, arguments);
			setTimeout(later, time);
			lock = true;
		}
	};

	return wrapperFn;
}

// @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
// Returns the number `num` modulo `range` in such a way so it lies within
// `range[0]` and `range[1]`. The returned value will be always smaller than
// `range[1]` unless `includeMax` is set to `true`.
function wrapNum(x, range, includeMax) {
	var max = range[1],
	    min = range[0],
	    d = max - min;
	return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
}

// @function falseFn(): Function
// Returns a function which always returns `false`.
function falseFn() { return false; }

// @function formatNum(num: Number, digits?: Number): Number
// Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
function formatNum(num, digits) {
	digits = (digits === undefined ? 6 : digits);
	return +(Math.round(num + ('e+' + digits)) + ('e-' + digits));
}

// @function trim(str: String): String
// Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
function trim(str) {
	return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

// @function splitWords(str: String): String[]
// Trims and splits the string on whitespace and returns the array of parts.
function splitWords(str) {
	return trim(str).split(/\s+/);
}

// @function setOptions(obj: Object, options: Object): Object
// Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`. Has an `L.setOptions` shortcut.
function setOptions(obj, options) {
	if (!obj.hasOwnProperty('options')) {
		obj.options = obj.options ? create(obj.options) : {};
	}
	for (var i in options) {
		obj.options[i] = options[i];
	}
	return obj.options;
}

// @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
// Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
// translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
// be appended at the end. If `uppercase` is `true`, the parameter names will
// be uppercased (e.g. `'?A=foo&B=bar'`)
function getParamString(obj, existingUrl, uppercase) {
	var params = [];
	for (var i in obj) {
		params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
	}
	return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
}

var templateRe = /\{ *([\w_-]+) *\}/g;

// @function template(str: String, data: Object): String
// Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
// and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
// `('Hello foo, bar')`. You can also specify functions instead of strings for
// data values — they will be evaluated passing `data` as an argument.
function template(str, data) {
	return str.replace(templateRe, function (str, key) {
		var value = data[key];

		if (value === undefined) {
			throw new Error('No value provided for variable ' + str);

		} else if (typeof value === 'function') {
			value = value(data);
		}
		return value;
	});
}

// @function isArray(obj): Boolean
// Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
var isArray = Array.isArray || function (obj) {
	return (Object.prototype.toString.call(obj) === '[object Array]');
};

// @function indexOf(array: Array, el: Object): Number
// Compatibility polyfill for [Array.prototype.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
function indexOf(array, el) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] === el) { return i; }
	}
	return -1;
}

// @property emptyImageUrl: String
// Data URI string containing a base64-encoded empty GIF image.
// Used as a hack to free memory from unused images on WebKit-powered
// mobile devices (by setting image `src` to this string).
var emptyImageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

// inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

function getPrefixed(name) {
	return window['webkit' + name] || window['moz' + name] || window['ms' + name];
}

var lastTime = 0;

// fallback for IE 7-8
function timeoutDefer(fn) {
	var time = +new Date(),
	    timeToCall = Math.max(0, 16 - (time - lastTime));

	lastTime = time + timeToCall;
	return window.setTimeout(fn, timeToCall);
}

var requestFn = window.requestAnimationFrame || getPrefixed('RequestAnimationFrame') || timeoutDefer;
var cancelFn = window.cancelAnimationFrame || getPrefixed('CancelAnimationFrame') ||
		getPrefixed('CancelRequestAnimationFrame') || function (id) { window.clearTimeout(id); };

// @function requestAnimFrame(fn: Function, context?: Object, immediate?: Boolean): Number
// Schedules `fn` to be executed when the browser repaints. `fn` is bound to
// `context` if given. When `immediate` is set, `fn` is called immediately if
// the browser doesn't have native support for
// [`window.requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/window/requestAnimationFrame),
// otherwise it's delayed. Returns a request ID that can be used to cancel the request.
function requestAnimFrame(fn, context, immediate) {
	if (immediate && requestFn === timeoutDefer) {
		fn.call(context);
	} else {
		return requestFn.call(window, bind(fn, context));
	}
}

// @function cancelAnimFrame(id: Number): undefined
// Cancels a previous `requestAnimFrame`. See also [window.cancelAnimationFrame](https://developer.mozilla.org/docs/Web/API/window/cancelAnimationFrame).
function cancelAnimFrame(id) {
	if (id) {
		cancelFn.call(window, id);
	}
}


var Util = (Object.freeze || Object)({
	freeze: freeze,
	extend: extend,
	create: create,
	bind: bind,
	lastId: lastId,
	stamp: stamp,
	throttle: throttle,
	wrapNum: wrapNum,
	falseFn: falseFn,
	formatNum: formatNum,
	trim: trim,
	splitWords: splitWords,
	setOptions: setOptions,
	getParamString: getParamString,
	template: template,
	isArray: isArray,
	indexOf: indexOf,
	emptyImageUrl: emptyImageUrl,
	requestFn: requestFn,
	cancelFn: cancelFn,
	requestAnimFrame: requestAnimFrame,
	cancelAnimFrame: cancelAnimFrame
});

// @class Class
// @aka L.Class

// @section
// @uninheritable

// Thanks to John Resig and Dean Edwards for inspiration!

function Class() {}

Class.extend = function (props) {

	// @function extend(props: Object): Function
	// [Extends the current class](#class-inheritance) given the properties to be included.
	// Returns a Javascript function that is a class constructor (to be called with `new`).
	var NewClass = function () {

		// call the constructor
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}

		// call all constructor hooks
		this.callInitHooks();
	};

	var parentProto = NewClass.__super__ = this.prototype;

	var proto = create(parentProto);
	proto.constructor = NewClass;

	NewClass.prototype = proto;

	// inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype' && i !== '__super__') {
			NewClass[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		extend(NewClass, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		checkDeprecatedMixinEvents(props.includes);
		extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (proto.options) {
		props.options = extend(create(proto.options), props.options);
	}

	// mix given properties into the prototype
	extend(proto, props);

	proto._initHooks = [];

	// add method for calling all hooks
	proto.callInitHooks = function () {

		if (this._initHooksCalled) { return; }

		if (parentProto.callInitHooks) {
			parentProto.callInitHooks.call(this);
		}

		this._initHooksCalled = true;

		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
			proto._initHooks[i].call(this);
		}
	};

	return NewClass;
};


// @function include(properties: Object): this
// [Includes a mixin](#class-includes) into the current class.
Class.include = function (props) {
	extend(this.prototype, props);
	return this;
};

// @function mergeOptions(options: Object): this
// [Merges `options`](#class-options) into the defaults of the class.
Class.mergeOptions = function (options) {
	extend(this.prototype.options, options);
	return this;
};

// @function addInitHook(fn: Function): this
// Adds a [constructor hook](#class-constructor-hooks) to the class.
Class.addInitHook = function (fn) { // (Function) || (String, args...)
	var args = Array.prototype.slice.call(arguments, 1);

	var init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};

	this.prototype._initHooks = this.prototype._initHooks || [];
	this.prototype._initHooks.push(init);
	return this;
};

function checkDeprecatedMixinEvents(includes) {
	if (typeof L === 'undefined' || !L || !L.Mixin) { return; }

	includes = isArray(includes) ? includes : [includes];

	for (var i = 0; i < includes.length; i++) {
		if (includes[i] === L.Mixin.Events) {
			console.warn('Deprecated include of L.Mixin.Events: ' +
				'this property will be removed in future releases, ' +
				'please inherit from L.Evented instead.', new Error().stack);
		}
	}
}

/*
 * @class Evented
 * @aka L.Evented
 * @inherits Class
 *
 * A set of methods shared between event-powered classes (like `Map` and `Marker`). Generally, events allow you to execute some function when something happens with an object (e.g. the user clicks on the map, causing the map to fire `'click'` event).
 *
 * @example
 *
 * ```js
 * map.on('click', function(e) {
 * 	alert(e.latlng);
 * } );
 * ```
 *
 * Leaflet deals with event listeners by reference, so if you want to add a listener and then remove it, define it as a function:
 *
 * ```js
 * function onClick(e) { ... }
 *
 * map.on('click', onClick);
 * map.off('click', onClick);
 * ```
 */

var Events = {
	/* @method on(type: String, fn: Function, context?: Object): this
	 * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
	 *
	 * @alternative
	 * @method on(eventMap: Object): this
	 * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
	 */
	on: function (types, fn, context) {

		// types can be a map of types/handlers
		if (typeof types === 'object') {
			for (var type in types) {
				// we don't process space-separated events here for performance;
				// it's a hot path since Layer uses the on(obj) syntax
				this._on(type, types[type], fn);
			}

		} else {
			// types can be a string of space-separated words
			types = splitWords(types);

			for (var i = 0, len = types.length; i < len; i++) {
				this._on(types[i], fn, context);
			}
		}

		return this;
	},

	/* @method off(type: String, fn?: Function, context?: Object): this
	 * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
	 *
	 * @alternative
	 * @method off(eventMap: Object): this
	 * Removes a set of type/listener pairs.
	 *
	 * @alternative
	 * @method off: this
	 * Removes all listeners to all events on the object. This includes implicitly attached events.
	 */
	off: function (types, fn, context) {

		if (!types) {
			// clear all listeners if called without arguments
			delete this._events;

		} else if (typeof types === 'object') {
			for (var type in types) {
				this._off(type, types[type], fn);
			}

		} else {
			types = splitWords(types);

			for (var i = 0, len = types.length; i < len; i++) {
				this._off(types[i], fn, context);
			}
		}

		return this;
	},

	// attach listener (without syntactic sugar now)
	_on: function (type, fn, context) {
		this._events = this._events || {};

		/* get/init listeners for type */
		var typeListeners = this._events[type];
		if (!typeListeners) {
			typeListeners = [];
			this._events[type] = typeListeners;
		}

		if (context === this) {
			// Less memory footprint.
			context = undefined;
		}
		var newListener = {fn: fn, ctx: context},
		    listeners = typeListeners;

		// check if fn already there
		for (var i = 0, len = listeners.length; i < len; i++) {
			if (listeners[i].fn === fn && listeners[i].ctx === context) {
				return;
			}
		}

		listeners.push(newListener);
	},

	_off: function (type, fn, context) {
		var listeners,
		    i,
		    len;

		if (!this._events) { return; }

		listeners = this._events[type];

		if (!listeners) {
			return;
		}

		if (!fn) {
			// Set all removed listeners to noop so they are not called if remove happens in fire
			for (i = 0, len = listeners.length; i < len; i++) {
				listeners[i].fn = falseFn;
			}
			// clear all listeners for a type if function isn't specified
			delete this._events[type];
			return;
		}

		if (context === this) {
			context = undefined;
		}

		if (listeners) {

			// find fn and remove it
			for (i = 0, len = listeners.length; i < len; i++) {
				var l = listeners[i];
				if (l.ctx !== context) { continue; }
				if (l.fn === fn) {

					// set the removed listener to noop so that's not called if remove happens in fire
					l.fn = falseFn;

					if (this._firingCount) {
						/* copy array in case events are being fired */
						this._events[type] = listeners = listeners.slice();
					}
					listeners.splice(i, 1);

					return;
				}
			}
		}
	},

	// @method fire(type: String, data?: Object, propagate?: Boolean): this
	// Fires an event of the specified type. You can optionally provide an data
	// object — the first argument of the listener function will contain its
	// properties. The event can optionally be propagated to event parents.
	fire: function (type, data, propagate) {
		if (!this.listens(type, propagate)) { return this; }

		var event = extend({}, data, {
			type: type,
			target: this,
			sourceTarget: data && data.sourceTarget || this
		});

		if (this._events) {
			var listeners = this._events[type];

			if (listeners) {
				this._firingCount = (this._firingCount + 1) || 1;
				for (var i = 0, len = listeners.length; i < len; i++) {
					var l = listeners[i];
					l.fn.call(l.ctx || this, event);
				}

				this._firingCount--;
			}
		}

		if (propagate) {
			// propagate the event to parents (set with addEventParent)
			this._propagateEvent(event);
		}

		return this;
	},

	// @method listens(type: String): Boolean
	// Returns `true` if a particular event type has any listeners attached to it.
	listens: function (type, propagate) {
		var listeners = this._events && this._events[type];
		if (listeners && listeners.length) { return true; }

		if (propagate) {
			// also check parents for listeners if event propagates
			for (var id in this._eventParents) {
				if (this._eventParents[id].listens(type, propagate)) { return true; }
			}
		}
		return false;
	},

	// @method once(…): this
	// Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
	once: function (types, fn, context) {

		if (typeof types === 'object') {
			for (var type in types) {
				this.once(type, types[type], fn);
			}
			return this;
		}

		var handler = bind(function () {
			this
			    .off(types, fn, context)
			    .off(types, handler, context);
		}, this);

		// add a listener that's executed once and removed after that
		return this
		    .on(types, fn, context)
		    .on(types, handler, context);
	},

	// @method addEventParent(obj: Evented): this
	// Adds an event parent - an `Evented` that will receive propagated events
	addEventParent: function (obj) {
		this._eventParents = this._eventParents || {};
		this._eventParents[stamp(obj)] = obj;
		return this;
	},

	// @method removeEventParent(obj: Evented): this
	// Removes an event parent, so it will stop receiving propagated events
	removeEventParent: function (obj) {
		if (this._eventParents) {
			delete this._eventParents[stamp(obj)];
		}
		return this;
	},

	_propagateEvent: function (e) {
		for (var id in this._eventParents) {
			this._eventParents[id].fire(e.type, extend({
				layer: e.target,
				propagatedFrom: e.target
			}, e), true);
		}
	}
};

// aliases; we should ditch those eventually

// @method addEventListener(…): this
// Alias to [`on(…)`](#evented-on)
Events.addEventListener = Events.on;

// @method removeEventListener(…): this
// Alias to [`off(…)`](#evented-off)

// @method clearAllEventListeners(…): this
// Alias to [`off()`](#evented-off)
Events.removeEventListener = Events.clearAllEventListeners = Events.off;

// @method addOneTimeEventListener(…): this
// Alias to [`once(…)`](#evented-once)
Events.addOneTimeEventListener = Events.once;

// @method fireEvent(…): this
// Alias to [`fire(…)`](#evented-fire)
Events.fireEvent = Events.fire;

// @method hasEventListeners(…): Boolean
// Alias to [`listens(…)`](#evented-listens)
Events.hasEventListeners = Events.listens;

var Evented = Class.extend(Events);

/*
 * @class Point
 * @aka L.Point
 *
 * Represents a point with `x` and `y` coordinates in pixels.
 *
 * @example
 *
 * ```js
 * var point = L.point(200, 300);
 * ```
 *
 * All Leaflet methods and options that accept `Point` objects also accept them in a simple Array form (unless noted otherwise), so these lines are equivalent:
 *
 * ```js
 * map.panBy([200, 300]);
 * map.panBy(L.point(200, 300));
 * ```
 *
 * Note that `Point` does not inherit from Leafet's `Class` object,
 * which means new classes can't inherit from it, and new methods
 * can't be added to it with the `include` function.
 */

function Point(x, y, round) {
	// @property x: Number; The `x` coordinate of the point
	this.x = (round ? Math.round(x) : x);
	// @property y: Number; The `y` coordinate of the point
	this.y = (round ? Math.round(y) : y);
}

var trunc = Math.trunc || function (v) {
	return v > 0 ? Math.floor(v) : Math.ceil(v);
};

Point.prototype = {

	// @method clone(): Point
	// Returns a copy of the current point.
	clone: function () {
		return new Point(this.x, this.y);
	},

	// @method add(otherPoint: Point): Point
	// Returns the result of addition of the current and the given points.
	add: function (point) {
		// non-destructive, returns a new point
		return this.clone()._add(toPoint(point));
	},

	_add: function (point) {
		// destructive, used directly for performance in situations where it's safe to modify existing point
		this.x += point.x;
		this.y += point.y;
		return this;
	},

	// @method subtract(otherPoint: Point): Point
	// Returns the result of subtraction of the given point from the current.
	subtract: function (point) {
		return this.clone()._subtract(toPoint(point));
	},

	_subtract: function (point) {
		this.x -= point.x;
		this.y -= point.y;
		return this;
	},

	// @method divideBy(num: Number): Point
	// Returns the result of division of the current point by the given number.
	divideBy: function (num) {
		return this.clone()._divideBy(num);
	},

	_divideBy: function (num) {
		this.x /= num;
		this.y /= num;
		return this;
	},

	// @method multiplyBy(num: Number): Point
	// Returns the result of multiplication of the current point by the given number.
	multiplyBy: function (num) {
		return this.clone()._multiplyBy(num);
	},

	_multiplyBy: function (num) {
		this.x *= num;
		this.y *= num;
		return this;
	},

	// @method scaleBy(scale: Point): Point
	// Multiply each coordinate of the current point by each coordinate of
	// `scale`. In linear algebra terms, multiply the point by the
	// [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
	// defined by `scale`.
	scaleBy: function (point) {
		return new Point(this.x * point.x, this.y * point.y);
	},

	// @method unscaleBy(scale: Point): Point
	// Inverse of `scaleBy`. Divide each coordinate of the current point by
	// each coordinate of `scale`.
	unscaleBy: function (point) {
		return new Point(this.x / point.x, this.y / point.y);
	},

	// @method round(): Point
	// Returns a copy of the current point with rounded coordinates.
	round: function () {
		return this.clone()._round();
	},

	_round: function () {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	},

	// @method floor(): Point
	// Returns a copy of the current point with floored coordinates (rounded down).
	floor: function () {
		return this.clone()._floor();
	},

	_floor: function () {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	},

	// @method ceil(): Point
	// Returns a copy of the current point with ceiled coordinates (rounded up).
	ceil: function () {
		return this.clone()._ceil();
	},

	_ceil: function () {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		return this;
	},

	// @method trunc(): Point
	// Returns a copy of the current point with truncated coordinates (rounded towards zero).
	trunc: function () {
		return this.clone()._trunc();
	},

	_trunc: function () {
		this.x = trunc(this.x);
		this.y = trunc(this.y);
		return this;
	},

	// @method distanceTo(otherPoint: Point): Number
	// Returns the cartesian distance between the current and the given points.
	distanceTo: function (point) {
		point = toPoint(point);

		var x = point.x - this.x,
		    y = point.y - this.y;

		return Math.sqrt(x * x + y * y);
	},

	// @method equals(otherPoint: Point): Boolean
	// Returns `true` if the given point has the same coordinates.
	equals: function (point) {
		point = toPoint(point);

		return point.x === this.x &&
		       point.y === this.y;
	},

	// @method contains(otherPoint: Point): Boolean
	// Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
	contains: function (point) {
		point = toPoint(point);

		return Math.abs(point.x) <= Math.abs(this.x) &&
		       Math.abs(point.y) <= Math.abs(this.y);
	},

	// @method toString(): String
	// Returns a string representation of the point for debugging purposes.
	toString: function () {
		return 'Point(' +
		        formatNum(this.x) + ', ' +
		        formatNum(this.y) + ')';
	}
};

// @factory L.point(x: Number, y: Number, round?: Boolean)
// Creates a Point object with the given `x` and `y` coordinates. If optional `round` is set to true, rounds the `x` and `y` values.

// @alternative
// @factory L.point(coords: Number[])
// Expects an array of the form `[x, y]` instead.

// @alternative
// @factory L.point(coords: Object)
// Expects a plain object of the form `{x: Number, y: Number}` instead.
function toPoint(x, y, round) {
	if (x instanceof Point) {
		return x;
	}
	if (isArray(x)) {
		return new Point(x[0], x[1]);
	}
	if (x === undefined || x === null) {
		return x;
	}
	if (typeof x === 'object' && 'x' in x && 'y' in x) {
		return new Point(x.x, x.y);
	}
	return new Point(x, y, round);
}

/*
 * @class Bounds
 * @aka L.Bounds
 *
 * Represents a rectangular area in pixel coordinates.
 *
 * @example
 *
 * ```js
 * var p1 = L.point(10, 10),
 * p2 = L.point(40, 60),
 * bounds = L.bounds(p1, p2);
 * ```
 *
 * All Leaflet methods that accept `Bounds` objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
 *
 * ```js
 * otherBounds.intersects([[10, 10], [40, 60]]);
 * ```
 *
 * Note that `Bounds` does not inherit from Leafet's `Class` object,
 * which means new classes can't inherit from it, and new methods
 * can't be added to it with the `include` function.
 */

function Bounds(a, b) {
	if (!a) { return; }

	var points = b ? [a, b] : a;

	for (var i = 0, len = points.length; i < len; i++) {
		this.extend(points[i]);
	}
}

Bounds.prototype = {
	// @method extend(point: Point): this
	// Extends the bounds to contain the given point.
	extend: function (point) { // (Point)
		point = toPoint(point);

		// @property min: Point
		// The top left corner of the rectangle.
		// @property max: Point
		// The bottom right corner of the rectangle.
		if (!this.min && !this.max) {
			this.min = point.clone();
			this.max = point.clone();
		} else {
			this.min.x = Math.min(point.x, this.min.x);
			this.max.x = Math.max(point.x, this.max.x);
			this.min.y = Math.min(point.y, this.min.y);
			this.max.y = Math.max(point.y, this.max.y);
		}
		return this;
	},

	// @method getCenter(round?: Boolean): Point
	// Returns the center point of the bounds.
	getCenter: function (round) {
		return new Point(
		        (this.min.x + this.max.x) / 2,
		        (this.min.y + this.max.y) / 2, round);
	},

	// @method getBottomLeft(): Point
	// Returns the bottom-left point of the bounds.
	getBottomLeft: function () {
		return new Point(this.min.x, this.max.y);
	},

	// @method getTopRight(): Point
	// Returns the top-right point of the bounds.
	getTopRight: function () { // -> Point
		return new Point(this.max.x, this.min.y);
	},

	// @method getTopLeft(): Point
	// Returns the top-left point of the bounds (i.e. [`this.min`](#bounds-min)).
	getTopLeft: function () {
		return this.min; // left, top
	},

	// @method getBottomRight(): Point
	// Returns the bottom-right point of the bounds (i.e. [`this.max`](#bounds-max)).
	getBottomRight: function () {
		return this.max; // right, bottom
	},

	// @method getSize(): Point
	// Returns the size of the given bounds
	getSize: function () {
		return this.max.subtract(this.min);
	},

	// @method contains(otherBounds: Bounds): Boolean
	// Returns `true` if the rectangle contains the given one.
	// @alternative
	// @method contains(point: Point): Boolean
	// Returns `true` if the rectangle contains the given point.
	contains: function (obj) {
		var min, max;

		if (typeof obj[0] === 'number' || obj instanceof Point) {
			obj = toPoint(obj);
		} else {
			obj = toBounds(obj);
		}

		if (obj instanceof Bounds) {
			min = obj.min;
			max = obj.max;
		} else {
			min = max = obj;
		}

		return (min.x >= this.min.x) &&
		       (max.x <= this.max.x) &&
		       (min.y >= this.min.y) &&
		       (max.y <= this.max.y);
	},

	// @method intersects(otherBounds: Bounds): Boolean
	// Returns `true` if the rectangle intersects the given bounds. Two bounds
	// intersect if they have at least one point in common.
	intersects: function (bounds) { // (Bounds) -> Boolean
		bounds = toBounds(bounds);

		var min = this.min,
		    max = this.max,
		    min2 = bounds.min,
		    max2 = bounds.max,
		    xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
		    yIntersects = (max2.y >= min.y) && (min2.y <= max.y);

		return xIntersects && yIntersects;
	},

	// @method overlaps(otherBounds: Bounds): Boolean
	// Returns `true` if the rectangle overlaps the given bounds. Two bounds
	// overlap if their intersection is an area.
	overlaps: function (bounds) { // (Bounds) -> Boolean
		bounds = toBounds(bounds);

		var min = this.min,
		    max = this.max,
		    min2 = bounds.min,
		    max2 = bounds.max,
		    xOverlaps = (max2.x > min.x) && (min2.x < max.x),
		    yOverlaps = (max2.y > min.y) && (min2.y < max.y);

		return xOverlaps && yOverlaps;
	},

	isValid: function () {
		return !!(this.min && this.max);
	}
};


// @factory L.bounds(corner1: Point, corner2: Point)
// Creates a Bounds object from two corners coordinate pairs.
// @alternative
// @factory L.bounds(points: Point[])
// Creates a Bounds object from the given array of points.
function toBounds(a, b) {
	if (!a || a instanceof Bounds) {
		return a;
	}
	return new Bounds(a, b);
}

/*
 * @class LatLngBounds
 * @aka L.LatLngBounds
 *
 * Represents a rectangular geographical area on a map.
 *
 * @example
 *
 * ```js
 * var corner1 = L.latLng(40.712, -74.227),
 * corner2 = L.latLng(40.774, -74.125),
 * bounds = L.latLngBounds(corner1, corner2);
 * ```
 *
 * All Leaflet methods that accept LatLngBounds objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
 *
 * ```js
 * map.fitBounds([
 * 	[40.712, -74.227],
 * 	[40.774, -74.125]
 * ]);
 * ```
 *
 * Caution: if the area crosses the antimeridian (often confused with the International Date Line), you must specify corners _outside_ the [-180, 180] degrees longitude range.
 *
 * Note that `LatLngBounds` does not inherit from Leafet's `Class` object,
 * which means new classes can't inherit from it, and new methods
 * can't be added to it with the `include` function.
 */

function LatLngBounds(corner1, corner2) { // (LatLng, LatLng) or (LatLng[])
	if (!corner1) { return; }

	var latlngs = corner2 ? [corner1, corner2] : corner1;

	for (var i = 0, len = latlngs.length; i < len; i++) {
		this.extend(latlngs[i]);
	}
}

LatLngBounds.prototype = {

	// @method extend(latlng: LatLng): this
	// Extend the bounds to contain the given point

	// @alternative
	// @method extend(otherBounds: LatLngBounds): this
	// Extend the bounds to contain the given bounds
	extend: function (obj) {
		var sw = this._southWest,
		    ne = this._northEast,
		    sw2, ne2;

		if (obj instanceof LatLng) {
			sw2 = obj;
			ne2 = obj;

		} else if (obj instanceof LatLngBounds) {
			sw2 = obj._southWest;
			ne2 = obj._northEast;

			if (!sw2 || !ne2) { return this; }

		} else {
			return obj ? this.extend(toLatLng(obj) || toLatLngBounds(obj)) : this;
		}

		if (!sw && !ne) {
			this._southWest = new LatLng(sw2.lat, sw2.lng);
			this._northEast = new LatLng(ne2.lat, ne2.lng);
		} else {
			sw.lat = Math.min(sw2.lat, sw.lat);
			sw.lng = Math.min(sw2.lng, sw.lng);
			ne.lat = Math.max(ne2.lat, ne.lat);
			ne.lng = Math.max(ne2.lng, ne.lng);
		}

		return this;
	},

	// @method pad(bufferRatio: Number): LatLngBounds
	// Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
	// For example, a ratio of 0.5 extends the bounds by 50% in each direction.
	// Negative values will retract the bounds.
	pad: function (bufferRatio) {
		var sw = this._southWest,
		    ne = this._northEast,
		    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
		    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

		return new LatLngBounds(
		        new LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
		        new LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
	},

	// @method getCenter(): LatLng
	// Returns the center point of the bounds.
	getCenter: function () {
		return new LatLng(
		        (this._southWest.lat + this._northEast.lat) / 2,
		        (this._southWest.lng + this._northEast.lng) / 2);
	},

	// @method getSouthWest(): LatLng
	// Returns the south-west point of the bounds.
	getSouthWest: function () {
		return this._southWest;
	},

	// @method getNorthEast(): LatLng
	// Returns the north-east point of the bounds.
	getNorthEast: function () {
		return this._northEast;
	},

	// @method getNorthWest(): LatLng
	// Returns the north-west point of the bounds.
	getNorthWest: function () {
		return new LatLng(this.getNorth(), this.getWest());
	},

	// @method getSouthEast(): LatLng
	// Returns the south-east point of the bounds.
	getSouthEast: function () {
		return new LatLng(this.getSouth(), this.getEast());
	},

	// @method getWest(): Number
	// Returns the west longitude of the bounds
	getWest: function () {
		return this._southWest.lng;
	},

	// @method getSouth(): Number
	// Returns the south latitude of the bounds
	getSouth: function () {
		return this._southWest.lat;
	},

	// @method getEast(): Number
	// Returns the east longitude of the bounds
	getEast: function () {
		return this._northEast.lng;
	},

	// @method getNorth(): Number
	// Returns the north latitude of the bounds
	getNorth: function () {
		return this._northEast.lat;
	},

	// @method contains(otherBounds: LatLngBounds): Boolean
	// Returns `true` if the rectangle contains the given one.

	// @alternative
	// @method contains (latlng: LatLng): Boolean
	// Returns `true` if the rectangle contains the given point.
	contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
		if (typeof obj[0] === 'number' || obj instanceof LatLng || 'lat' in obj) {
			obj = toLatLng(obj);
		} else {
			obj = toLatLngBounds(obj);
		}

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2, ne2;

		if (obj instanceof LatLngBounds) {
			sw2 = obj.getSouthWest();
			ne2 = obj.getNorthEast();
		} else {
			sw2 = ne2 = obj;
		}

		return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
		       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
	},

	// @method intersects(otherBounds: LatLngBounds): Boolean
	// Returns `true` if the rectangle intersects the given bounds. Two bounds intersect if they have at least one point in common.
	intersects: function (bounds) {
		bounds = toLatLngBounds(bounds);

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2 = bounds.getSouthWest(),
		    ne2 = bounds.getNorthEast(),

		    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
		    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);

		return latIntersects && lngIntersects;
	},

	// @method overlaps(otherBounds: Bounds): Boolean
	// Returns `true` if the rectangle overlaps the given bounds. Two bounds overlap if their intersection is an area.
	overlaps: function (bounds) {
		bounds = toLatLngBounds(bounds);

		var sw = this._southWest,
		    ne = this._northEast,
		    sw2 = bounds.getSouthWest(),
		    ne2 = bounds.getNorthEast(),

		    latOverlaps = (ne2.lat > sw.lat) && (sw2.lat < ne.lat),
		    lngOverlaps = (ne2.lng > sw.lng) && (sw2.lng < ne.lng);

		return latOverlaps && lngOverlaps;
	},

	// @method toBBoxString(): String
	// Returns a string with bounding box coordinates in a 'southwest_lng,southwest_lat,northeast_lng,northeast_lat' format. Useful for sending requests to web services that return geo data.
	toBBoxString: function () {
		return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
	},

	// @method equals(otherBounds: LatLngBounds, maxMargin?: Number): Boolean
	// Returns `true` if the rectangle is equivalent (within a small margin of error) to the given bounds. The margin of error can be overridden by setting `maxMargin` to a small number.
	equals: function (bounds, maxMargin) {
		if (!bounds) { return false; }

		bounds = toLatLngBounds(bounds);

		return this._southWest.equals(bounds.getSouthWest(), maxMargin) &&
		       this._northEast.equals(bounds.getNorthEast(), maxMargin);
	},

	// @method isValid(): Boolean
	// Returns `true` if the bounds are properly initialized.
	isValid: function () {
		return !!(this._southWest && this._northEast);
	}
};

// TODO International date line?

// @factory L.latLngBounds(corner1: LatLng, corner2: LatLng)
// Creates a `LatLngBounds` object by defining two diagonally opposite corners of the rectangle.

// @alternative
// @factory L.latLngBounds(latlngs: LatLng[])
// Creates a `LatLngBounds` object defined by the geographical points it contains. Very useful for zooming the map to fit a particular set of locations with [`fitBounds`](#map-fitbounds).
function toLatLngBounds(a, b) {
	if (a instanceof LatLngBounds) {
		return a;
	}
	return new LatLngBounds(a, b);
}

/* @class LatLng
 * @aka L.LatLng
 *
 * Represents a geographical point with a certain latitude and longitude.
 *
 * @example
 *
 * ```
 * var latlng = L.latLng(50.5, 30.5);
 * ```
 *
 * All Leaflet methods that accept LatLng objects also accept them in a simple Array form and simple object form (unless noted otherwise), so these lines are equivalent:
 *
 * ```
 * map.panTo([50, 30]);
 * map.panTo({lon: 30, lat: 50});
 * map.panTo({lat: 50, lng: 30});
 * map.panTo(L.latLng(50, 30));
 * ```
 *
 * Note that `LatLng` does not inherit from Leaflet's `Class` object,
 * which means new classes can't inherit from it, and new methods
 * can't be added to it with the `include` function.
 */

function LatLng(lat, lng, alt) {
	if (isNaN(lat) || isNaN(lng)) {
		throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
	}

	// @property lat: Number
	// Latitude in degrees
	this.lat = +lat;

	// @property lng: Number
	// Longitude in degrees
	this.lng = +lng;

	// @property alt: Number
	// Altitude in meters (optional)
	if (alt !== undefined) {
		this.alt = +alt;
	}
}

LatLng.prototype = {
	// @method equals(otherLatLng: LatLng, maxMargin?: Number): Boolean
	// Returns `true` if the given `LatLng` point is at the same position (within a small margin of error). The margin of error can be overridden by setting `maxMargin` to a small number.
	equals: function (obj, maxMargin) {
		if (!obj) { return false; }

		obj = toLatLng(obj);

		var margin = Math.max(
		        Math.abs(this.lat - obj.lat),
		        Math.abs(this.lng - obj.lng));

		return margin <= (maxMargin === undefined ? 1.0E-9 : maxMargin);
	},

	// @method toString(): String
	// Returns a string representation of the point (for debugging purposes).
	toString: function (precision) {
		return 'LatLng(' +
		        formatNum(this.lat, precision) + ', ' +
		        formatNum(this.lng, precision) + ')';
	},

	// @method distanceTo(otherLatLng: LatLng): Number
	// Returns the distance (in meters) to the given `LatLng` calculated using the [Spherical Law of Cosines](https://en.wikipedia.org/wiki/Spherical_law_of_cosines).
	distanceTo: function (other) {
		return Earth.distance(this, toLatLng(other));
	},

	// @method wrap(): LatLng
	// Returns a new `LatLng` object with the longitude wrapped so it's always between -180 and +180 degrees.
	wrap: function () {
		return Earth.wrapLatLng(this);
	},

	// @method toBounds(sizeInMeters: Number): LatLngBounds
	// Returns a new `LatLngBounds` object in which each boundary is `sizeInMeters/2` meters apart from the `LatLng`.
	toBounds: function (sizeInMeters) {
		var latAccuracy = 180 * sizeInMeters / 40075017,
		    lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * this.lat);

		return toLatLngBounds(
		        [this.lat - latAccuracy, this.lng - lngAccuracy],
		        [this.lat + latAccuracy, this.lng + lngAccuracy]);
	},

	clone: function () {
		return new LatLng(this.lat, this.lng, this.alt);
	}
};



// @factory L.latLng(latitude: Number, longitude: Number, altitude?: Number): LatLng
// Creates an object representing a geographical point with the given latitude and longitude (and optionally altitude).

// @alternative
// @factory L.latLng(coords: Array): LatLng
// Expects an array of the form `[Number, Number]` or `[Number, Number, Number]` instead.

// @alternative
// @factory L.latLng(coords: Object): LatLng
// Expects an plain object of the form `{lat: Number, lng: Number}` or `{lat: Number, lng: Number, alt: Number}` instead.

function toLatLng(a, b, c) {
	if (a instanceof LatLng) {
		return a;
	}
	if (isArray(a) && typeof a[0] !== 'object') {
		if (a.length === 3) {
			return new LatLng(a[0], a[1], a[2]);
		}
		if (a.length === 2) {
			return new LatLng(a[0], a[1]);
		}
		return null;
	}
	if (a === undefined || a === null) {
		return a;
	}
	if (typeof a === 'object' && 'lat' in a) {
		return new LatLng(a.lat, 'lng' in a ? a.lng : a.lon, a.alt);
	}
	if (b === undefined) {
		return null;
	}
	return new LatLng(a, b, c);
}

/*
 * @namespace CRS
 * @crs L.CRS.Base
 * Object that defines coordinate reference systems for projecting
 * geographical points into pixel (screen) coordinates and back (and to
 * coordinates in other units for [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services). See
 * [spatial reference system](http://en.wikipedia.org/wiki/Coordinate_reference_system).
 *
 * Leaflet defines the most usual CRSs by default. If you want to use a
 * CRS not defined by default, take a look at the
 * [Proj4Leaflet](https://github.com/kartena/Proj4Leaflet) plugin.
 *
 * Note that the CRS instances do not inherit from Leafet's `Class` object,
 * and can't be instantiated. Also, new classes can't inherit from them,
 * and methods can't be added to them with the `include` function.
 */

var CRS = {
	// @method latLngToPoint(latlng: LatLng, zoom: Number): Point
	// Projects geographical coordinates into pixel coordinates for a given zoom.
	latLngToPoint: function (latlng, zoom) {
		var projectedPoint = this.projection.project(latlng),
		    scale = this.scale(zoom);

		return this.transformation._transform(projectedPoint, scale);
	},

	// @method pointToLatLng(point: Point, zoom: Number): LatLng
	// The inverse of `latLngToPoint`. Projects pixel coordinates on a given
	// zoom into geographical coordinates.
	pointToLatLng: function (point, zoom) {
		var scale = this.scale(zoom),
		    untransformedPoint = this.transformation.untransform(point, scale);

		return this.projection.unproject(untransformedPoint);
	},

	// @method project(latlng: LatLng): Point
	// Projects geographical coordinates into coordinates in units accepted for
	// this CRS (e.g. meters for EPSG:3857, for passing it to WMS services).
	project: function (latlng) {
		return this.projection.project(latlng);
	},

	// @method unproject(point: Point): LatLng
	// Given a projected coordinate returns the corresponding LatLng.
	// The inverse of `project`.
	unproject: function (point) {
		return this.projection.unproject(point);
	},

	// @method scale(zoom: Number): Number
	// Returns the scale used when transforming projected coordinates into
	// pixel coordinates for a particular zoom. For example, it returns
	// `256 * 2^zoom` for Mercator-based CRS.
	scale: function (zoom) {
		return 256 * Math.pow(2, zoom);
	},

	// @method zoom(scale: Number): Number
	// Inverse of `scale()`, returns the zoom level corresponding to a scale
	// factor of `scale`.
	zoom: function (scale) {
		return Math.log(scale / 256) / Math.LN2;
	},

	// @method getProjectedBounds(zoom: Number): Bounds
	// Returns the projection's bounds scaled and transformed for the provided `zoom`.
	getProjectedBounds: function (zoom) {
		if (this.infinite) { return null; }

		var b = this.projection.bounds,
		    s = this.scale(zoom),
		    min = this.transformation.transform(b.min, s),
		    max = this.transformation.transform(b.max, s);

		return new Bounds(min, max);
	},

	// @method distance(latlng1: LatLng, latlng2: LatLng): Number
	// Returns the distance between two geographical coordinates.

	// @property code: String
	// Standard code name of the CRS passed into WMS services (e.g. `'EPSG:3857'`)
	//
	// @property wrapLng: Number[]
	// An array of two numbers defining whether the longitude (horizontal) coordinate
	// axis wraps around a given range and how. Defaults to `[-180, 180]` in most
	// geographical CRSs. If `undefined`, the longitude axis does not wrap around.
	//
	// @property wrapLat: Number[]
	// Like `wrapLng`, but for the latitude (vertical) axis.

	// wrapLng: [min, max],
	// wrapLat: [min, max],

	// @property infinite: Boolean
	// If true, the coordinate space will be unbounded (infinite in both axes)
	infinite: false,

	// @method wrapLatLng(latlng: LatLng): LatLng
	// Returns a `LatLng` where lat and lng has been wrapped according to the
	// CRS's `wrapLat` and `wrapLng` properties, if they are outside the CRS's bounds.
	wrapLatLng: function (latlng) {
		var lng = this.wrapLng ? wrapNum(latlng.lng, this.wrapLng, true) : latlng.lng,
		    lat = this.wrapLat ? wrapNum(latlng.lat, this.wrapLat, true) : latlng.lat,
		    alt = latlng.alt;

		return new LatLng(lat, lng, alt);
	},

	// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
	// Returns a `LatLngBounds` with the same size as the given one, ensuring
	// that its center is within the CRS's bounds.
	// Only accepts actual `L.LatLngBounds` instances, not arrays.
	wrapLatLngBounds: function (bounds) {
		var center = bounds.getCenter(),
		    newCenter = this.wrapLatLng(center),
		    latShift = center.lat - newCenter.lat,
		    lngShift = center.lng - newCenter.lng;

		if (latShift === 0 && lngShift === 0) {
			return bounds;
		}

		var sw = bounds.getSouthWest(),
		    ne = bounds.getNorthEast(),
		    newSw = new LatLng(sw.lat - latShift, sw.lng - lngShift),
		    newNe = new LatLng(ne.lat - latShift, ne.lng - lngShift);

		return new LatLngBounds(newSw, newNe);
	}
};

/*
 * @namespace CRS
 * @crs L.CRS.Earth
 *
 * Serves as the base for CRS that are global such that they cover the earth.
 * Can only be used as the base for other CRS and cannot be used directly,
 * since it does not have a `code`, `projection` or `transformation`. `distance()` returns
 * meters.
 */

var Earth = extend({}, CRS, {
	wrapLng: [-180, 180],

	// Mean Earth Radius, as recommended for use by
	// the International Union of Geodesy and Geophysics,
	// see http://rosettacode.org/wiki/Haversine_formula
	R: 6371000,

	// distance between two geographical points using spherical law of cosines approximation
	distance: function (latlng1, latlng2) {
		var rad = Math.PI / 180,
		    lat1 = latlng1.lat * rad,
		    lat2 = latlng2.lat * rad,
		    sinDLat = Math.sin((latlng2.lat - latlng1.lat) * rad / 2),
		    sinDLon = Math.sin((latlng2.lng - latlng1.lng) * rad / 2),
		    a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon,
		    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return this.R * c;
	}
});

/*
 * @namespace Projection
 * @projection L.Projection.SphericalMercator
 *
 * Spherical Mercator projection — the most common projection for online maps,
 * used by almost all free and commercial tile providers. Assumes that Earth is
 * a sphere. Used by the `EPSG:3857` CRS.
 */

var earthRadius = 6378137;

var SphericalMercator = {

	R: earthRadius,
	MAX_LATITUDE: 85.0511287798,

	project: function (latlng) {
		var d = Math.PI / 180,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    sin = Math.sin(lat * d);

		return new Point(
			this.R * latlng.lng * d,
			this.R * Math.log((1 + sin) / (1 - sin)) / 2);
	},

	unproject: function (point) {
		var d = 180 / Math.PI;

		return new LatLng(
			(2 * Math.atan(Math.exp(point.y / this.R)) - (Math.PI / 2)) * d,
			point.x * d / this.R);
	},

	bounds: (function () {
		var d = earthRadius * Math.PI;
		return new Bounds([-d, -d], [d, d]);
	})()
};

/*
 * @class Transformation
 * @aka L.Transformation
 *
 * Represents an affine transformation: a set of coefficients `a`, `b`, `c`, `d`
 * for transforming a point of a form `(x, y)` into `(a*x + b, c*y + d)` and doing
 * the reverse. Used by Leaflet in its projections code.
 *
 * @example
 *
 * ```js
 * var transformation = L.transformation(2, 5, -1, 10),
 * 	p = L.point(1, 2),
 * 	p2 = transformation.transform(p), //  L.point(7, 8)
 * 	p3 = transformation.untransform(p2); //  L.point(1, 2)
 * ```
 */


// factory new L.Transformation(a: Number, b: Number, c: Number, d: Number)
// Creates a `Transformation` object with the given coefficients.
function Transformation(a, b, c, d) {
	if (isArray(a)) {
		// use array properties
		this._a = a[0];
		this._b = a[1];
		this._c = a[2];
		this._d = a[3];
		return;
	}
	this._a = a;
	this._b = b;
	this._c = c;
	this._d = d;
}

Transformation.prototype = {
	// @method transform(point: Point, scale?: Number): Point
	// Returns a transformed point, optionally multiplied by the given scale.
	// Only accepts actual `L.Point` instances, not arrays.
	transform: function (point, scale) { // (Point, Number) -> Point
		return this._transform(point.clone(), scale);
	},

	// destructive transform (faster)
	_transform: function (point, scale) {
		scale = scale || 1;
		point.x = scale * (this._a * point.x + this._b);
		point.y = scale * (this._c * point.y + this._d);
		return point;
	},

	// @method untransform(point: Point, scale?: Number): Point
	// Returns the reverse transformation of the given point, optionally divided
	// by the given scale. Only accepts actual `L.Point` instances, not arrays.
	untransform: function (point, scale) {
		scale = scale || 1;
		return new Point(
		        (point.x / scale - this._b) / this._a,
		        (point.y / scale - this._d) / this._c);
	}
};

// factory L.transformation(a: Number, b: Number, c: Number, d: Number)

// @factory L.transformation(a: Number, b: Number, c: Number, d: Number)
// Instantiates a Transformation object with the given coefficients.

// @alternative
// @factory L.transformation(coefficients: Array): Transformation
// Expects an coefficients array of the form
// `[a: Number, b: Number, c: Number, d: Number]`.

function toTransformation(a, b, c, d) {
	return new Transformation(a, b, c, d);
}

/*
 * @namespace CRS
 * @crs L.CRS.EPSG3857
 *
 * The most common CRS for online maps, used by almost all free and commercial
 * tile providers. Uses Spherical Mercator projection. Set in by default in
 * Map's `crs` option.
 */

var EPSG3857 = extend({}, Earth, {
	code: 'EPSG:3857',
	projection: SphericalMercator,

	transformation: (function () {
		var scale = 0.5 / (Math.PI * SphericalMercator.R);
		return toTransformation(scale, 0.5, -scale, 0.5);
	}())
});

var EPSG900913 = extend({}, EPSG3857, {
	code: 'EPSG:900913'
});

// @namespace SVG; @section
// There are several static functions which can be called without instantiating L.SVG:

// @function create(name: String): SVGElement
// Returns a instance of [SVGElement](https://developer.mozilla.org/docs/Web/API/SVGElement),
// corresponding to the class name passed. For example, using 'line' will return
// an instance of [SVGLineElement](https://developer.mozilla.org/docs/Web/API/SVGLineElement).
function svgCreate(name) {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}

// @function pointsToPath(rings: Point[], closed: Boolean): String
// Generates a SVG path string for multiple rings, with each ring turning
// into "M..L..L.." instructions
function pointsToPath(rings, closed) {
	var str = '',
	i, j, len, len2, points, p;

	for (i = 0, len = rings.length; i < len; i++) {
		points = rings[i];

		for (j = 0, len2 = points.length; j < len2; j++) {
			p = points[j];
			str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
		}

		// closes the ring for polygons; "x" is VML syntax
		str += closed ? (svg ? 'z' : 'x') : '';
	}

	// SVG complains about empty path strings
	return str || 'M0 0';
}

/*
 * @namespace Browser
 * @aka L.Browser
 *
 * A namespace with static properties for browser/feature detection used by Leaflet internally.
 *
 * @example
 *
 * ```js
 * if (L.Browser.ielt9) {
 *   alert('Upgrade your browser, dude!');
 * }
 * ```
 */

var style$1 = document.documentElement.style;

// @property ie: Boolean; `true` for all Internet Explorer versions (not Edge).
var ie = 'ActiveXObject' in window;

// @property ielt9: Boolean; `true` for Internet Explorer versions less than 9.
var ielt9 = ie && !document.addEventListener;

// @property edge: Boolean; `true` for the Edge web browser.
var edge = 'msLaunchUri' in navigator && !('documentMode' in document);

// @property webkit: Boolean;
// `true` for webkit-based browsers like Chrome and Safari (including mobile versions).
var webkit = userAgentContains('webkit');

// @property android: Boolean
// `true` for any browser running on an Android platform.
var android = userAgentContains('android');

// @property android23: Boolean; `true` for browsers running on Android 2 or Android 3.
var android23 = userAgentContains('android 2') || userAgentContains('android 3');

/* See https://stackoverflow.com/a/17961266 for details on detecting stock Android */
var webkitVer = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10); // also matches AppleWebKit
// @property androidStock: Boolean; `true` for the Android stock browser (i.e. not Chrome)
var androidStock = android && userAgentContains('Google') && webkitVer < 537 && !('AudioNode' in window);

// @property opera: Boolean; `true` for the Opera browser
var opera = !!window.opera;

// @property chrome: Boolean; `true` for the Chrome browser.
var chrome = userAgentContains('chrome');

// @property gecko: Boolean; `true` for gecko-based browsers like Firefox.
var gecko = userAgentContains('gecko') && !webkit && !opera && !ie;

// @property safari: Boolean; `true` for the Safari browser.
var safari = !chrome && userAgentContains('safari');

var phantom = userAgentContains('phantom');

// @property opera12: Boolean
// `true` for the Opera browser supporting CSS transforms (version 12 or later).
var opera12 = 'OTransition' in style$1;

// @property win: Boolean; `true` when the browser is running in a Windows platform
var win = navigator.platform.indexOf('Win') === 0;

// @property ie3d: Boolean; `true` for all Internet Explorer versions supporting CSS transforms.
var ie3d = ie && ('transition' in style$1);

// @property webkit3d: Boolean; `true` for webkit-based browsers supporting CSS transforms.
var webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23;

// @property gecko3d: Boolean; `true` for gecko-based browsers supporting CSS transforms.
var gecko3d = 'MozPerspective' in style$1;

// @property any3d: Boolean
// `true` for all browsers supporting CSS transforms.
var any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d) && !opera12 && !phantom;

// @property mobile: Boolean; `true` for all browsers running in a mobile device.
var mobile = typeof orientation !== 'undefined' || userAgentContains('mobile');

// @property mobileWebkit: Boolean; `true` for all webkit-based browsers in a mobile device.
var mobileWebkit = mobile && webkit;

// @property mobileWebkit3d: Boolean
// `true` for all webkit-based browsers in a mobile device supporting CSS transforms.
var mobileWebkit3d = mobile && webkit3d;

// @property msPointer: Boolean
// `true` for browsers implementing the Microsoft touch events model (notably IE10).
var msPointer = !window.PointerEvent && window.MSPointerEvent;

// @property pointer: Boolean
// `true` for all browsers supporting [pointer events](https://msdn.microsoft.com/en-us/library/dn433244%28v=vs.85%29.aspx).
var pointer = !!(window.PointerEvent || msPointer);

// @property touch: Boolean
// `true` for all browsers supporting [touch events](https://developer.mozilla.org/docs/Web/API/Touch_events).
// This does not necessarily mean that the browser is running in a computer with
// a touchscreen, it only means that the browser is capable of understanding
// touch events.
var touch = !window.L_NO_TOUCH && (pointer || 'ontouchstart' in window ||
		(window.DocumentTouch && document instanceof window.DocumentTouch));

// @property mobileOpera: Boolean; `true` for the Opera browser in a mobile device.
var mobileOpera = mobile && opera;

// @property mobileGecko: Boolean
// `true` for gecko-based browsers running in a mobile device.
var mobileGecko = mobile && gecko;

// @property retina: Boolean
// `true` for browsers on a high-resolution "retina" screen or on any screen when browser's display zoom is more than 100%.
var retina = (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1;


// @property canvas: Boolean
// `true` when the browser supports [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
var canvas = (function () {
	return !!document.createElement('canvas').getContext;
}());

// @property svg: Boolean
// `true` when the browser supports [SVG](https://developer.mozilla.org/docs/Web/SVG).
var svg = !!(document.createElementNS && svgCreate('svg').createSVGRect);

// @property vml: Boolean
// `true` if the browser supports [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language).
var vml = !svg && (function () {
	try {
		var div = document.createElement('div');
		div.innerHTML = '<v:shape adj="1"/>';

		var shape = div.firstChild;
		shape.style.behavior = 'url(#default#VML)';

		return shape && (typeof shape.adj === 'object');

	} catch (e) {
		return false;
	}
}());


function userAgentContains(str) {
	return navigator.userAgent.toLowerCase().indexOf(str) >= 0;
}


var Browser = (Object.freeze || Object)({
	ie: ie,
	ielt9: ielt9,
	edge: edge,
	webkit: webkit,
	android: android,
	android23: android23,
	androidStock: androidStock,
	opera: opera,
	chrome: chrome,
	gecko: gecko,
	safari: safari,
	phantom: phantom,
	opera12: opera12,
	win: win,
	ie3d: ie3d,
	webkit3d: webkit3d,
	gecko3d: gecko3d,
	any3d: any3d,
	mobile: mobile,
	mobileWebkit: mobileWebkit,
	mobileWebkit3d: mobileWebkit3d,
	msPointer: msPointer,
	pointer: pointer,
	touch: touch,
	mobileOpera: mobileOpera,
	mobileGecko: mobileGecko,
	retina: retina,
	canvas: canvas,
	svg: svg,
	vml: vml
});

/*
 * Extends L.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
 */


var POINTER_DOWN =   msPointer ? 'MSPointerDown'   : 'pointerdown';
var POINTER_MOVE =   msPointer ? 'MSPointerMove'   : 'pointermove';
var POINTER_UP =     msPointer ? 'MSPointerUp'     : 'pointerup';
var POINTER_CANCEL = msPointer ? 'MSPointerCancel' : 'pointercancel';
var TAG_WHITE_LIST = ['INPUT', 'SELECT', 'OPTION'];

var _pointers = {};
var _pointerDocListener = false;

// DomEvent.DoubleTap needs to know about this
var _pointersCount = 0;

// Provides a touch events wrapper for (ms)pointer events.
// ref http://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890

function addPointerListener(obj, type, handler, id) {
	if (type === 'touchstart') {
		_addPointerStart(obj, handler, id);

	} else if (type === 'touchmove') {
		_addPointerMove(obj, handler, id);

	} else if (type === 'touchend') {
		_addPointerEnd(obj, handler, id);
	}

	return this;
}

function removePointerListener(obj, type, id) {
	var handler = obj['_leaflet_' + type + id];

	if (type === 'touchstart') {
		obj.removeEventListener(POINTER_DOWN, handler, false);

	} else if (type === 'touchmove') {
		obj.removeEventListener(POINTER_MOVE, handler, false);

	} else if (type === 'touchend') {
		obj.removeEventListener(POINTER_UP, handler, false);
		obj.removeEventListener(POINTER_CANCEL, handler, false);
	}

	return this;
}

function _addPointerStart(obj, handler, id) {
	var onDown = bind(function (e) {
		if (e.pointerType !== 'mouse' && e.MSPOINTER_TYPE_MOUSE && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
			// In IE11, some touch events needs to fire for form controls, or
			// the controls will stop working. We keep a whitelist of tag names that
			// need these events. For other target tags, we prevent default on the event.
			if (TAG_WHITE_LIST.indexOf(e.target.tagName) < 0) {
				preventDefault(e);
			} else {
				return;
			}
		}

		_handlePointer(e, handler);
	});

	obj['_leaflet_touchstart' + id] = onDown;
	obj.addEventListener(POINTER_DOWN, onDown, false);

	// need to keep track of what pointers and how many are active to provide e.touches emulation
	if (!_pointerDocListener) {
		// we listen documentElement as any drags that end by moving the touch off the screen get fired there
		document.documentElement.addEventListener(POINTER_DOWN, _globalPointerDown, true);
		document.documentElement.addEventListener(POINTER_MOVE, _globalPointerMove, true);
		document.documentElement.addEventListener(POINTER_UP, _globalPointerUp, true);
		document.documentElement.addEventListener(POINTER_CANCEL, _globalPointerUp, true);

		_pointerDocListener = true;
	}
}

function _globalPointerDown(e) {
	_pointers[e.pointerId] = e;
	_pointersCount++;
}

function _globalPointerMove(e) {
	if (_pointers[e.pointerId]) {
		_pointers[e.pointerId] = e;
	}
}

function _globalPointerUp(e) {
	delete _pointers[e.pointerId];
	_pointersCount--;
}

function _handlePointer(e, handler) {
	e.touches = [];
	for (var i in _pointers) {
		e.touches.push(_pointers[i]);
	}
	e.changedTouches = [e];

	handler(e);
}

function _addPointerMove(obj, handler, id) {
	var onMove = function (e) {
		// don't fire touch moves when mouse isn't down
		if ((e.pointerType === e.MSPOINTER_TYPE_MOUSE || e.pointerType === 'mouse') && e.buttons === 0) { return; }

		_handlePointer(e, handler);
	};

	obj['_leaflet_touchmove' + id] = onMove;
	obj.addEventListener(POINTER_MOVE, onMove, false);
}

function _addPointerEnd(obj, handler, id) {
	var onUp = function (e) {
		_handlePointer(e, handler);
	};

	obj['_leaflet_touchend' + id] = onUp;
	obj.addEventListener(POINTER_UP, onUp, false);
	obj.addEventListener(POINTER_CANCEL, onUp, false);
}

/*
 * Extends the event handling code with double tap support for mobile browsers.
 */

var _touchstart = msPointer ? 'MSPointerDown' : pointer ? 'pointerdown' : 'touchstart';
var _touchend = msPointer ? 'MSPointerUp' : pointer ? 'pointerup' : 'touchend';
var _pre = '_leaflet_';

// inspired by Zepto touch code by Thomas Fuchs
function addDoubleTapListener(obj, handler, id) {
	var last, touch$$1,
	    doubleTap = false,
	    delay = 250;

	function onTouchStart(e) {
		var count;

		if (pointer) {
			if ((!edge) || e.pointerType === 'mouse') { return; }
			count = _pointersCount;
		} else {
			count = e.touches.length;
		}

		if (count > 1) { return; }

		var now = Date.now(),
		    delta = now - (last || now);

		touch$$1 = e.touches ? e.touches[0] : e;
		doubleTap = (delta > 0 && delta <= delay);
		last = now;
	}

	function onTouchEnd(e) {
		if (doubleTap && !touch$$1.cancelBubble) {
			if (pointer) {
				if ((!edge) || e.pointerType === 'mouse') { return; }
				// work around .type being readonly with MSPointer* events
				var newTouch = {},
				    prop, i;

				for (i in touch$$1) {
					prop = touch$$1[i];
					newTouch[i] = prop && prop.bind ? prop.bind(touch$$1) : prop;
				}
				touch$$1 = newTouch;
			}
			touch$$1.type = 'dblclick';
			touch$$1.button = 0;
			handler(touch$$1);
			last = null;
		}
	}

	obj[_pre + _touchstart + id] = onTouchStart;
	obj[_pre + _touchend + id] = onTouchEnd;
	obj[_pre + 'dblclick' + id] = handler;

	obj.addEventListener(_touchstart, onTouchStart, false);
	obj.addEventListener(_touchend, onTouchEnd, false);

	// On some platforms (notably, chrome<55 on win10 + touchscreen + mouse),
	// the browser doesn't fire touchend/pointerup events but does fire
	// native dblclicks. See #4127.
	// Edge 14 also fires native dblclicks, but only for pointerType mouse, see #5180.
	obj.addEventListener('dblclick', handler, false);

	return this;
}

function removeDoubleTapListener(obj, id) {
	var touchstart = obj[_pre + _touchstart + id],
	    touchend = obj[_pre + _touchend + id],
	    dblclick = obj[_pre + 'dblclick' + id];

	obj.removeEventListener(_touchstart, touchstart, false);
	obj.removeEventListener(_touchend, touchend, false);
	if (!edge) {
		obj.removeEventListener('dblclick', dblclick, false);
	}

	return this;
}

/*
 * @namespace DomUtil
 *
 * Utility functions to work with the [DOM](https://developer.mozilla.org/docs/Web/API/Document_Object_Model)
 * tree, used by Leaflet internally.
 *
 * Most functions expecting or returning a `HTMLElement` also work for
 * SVG elements. The only difference is that classes refer to CSS classes
 * in HTML and SVG classes in SVG.
 */


// @property TRANSFORM: String
// Vendor-prefixed transform style name (e.g. `'webkitTransform'` for WebKit).
var TRANSFORM = testProp(
	['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

// webkitTransition comes first because some browser versions that drop vendor prefix don't do
// the same for the transitionend event, in particular the Android 4.1 stock browser

// @property TRANSITION: String
// Vendor-prefixed transition style name.
var TRANSITION = testProp(
	['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

// @property TRANSITION_END: String
// Vendor-prefixed transitionend event name.
var TRANSITION_END =
	TRANSITION === 'webkitTransition' || TRANSITION === 'OTransition' ? TRANSITION + 'End' : 'transitionend';


// @function get(id: String|HTMLElement): HTMLElement
// Returns an element given its DOM id, or returns the element itself
// if it was passed directly.
function get(id) {
	return typeof id === 'string' ? document.getElementById(id) : id;
}

// @function getStyle(el: HTMLElement, styleAttrib: String): String
// Returns the value for a certain style attribute on an element,
// including computed values or values set through CSS.
function getStyle(el, style) {
	var value = el.style[style] || (el.currentStyle && el.currentStyle[style]);

	if ((!value || value === 'auto') && document.defaultView) {
		var css = document.defaultView.getComputedStyle(el, null);
		value = css ? css[style] : null;
	}
	return value === 'auto' ? null : value;
}

// @function create(tagName: String, className?: String, container?: HTMLElement): HTMLElement
// Creates an HTML element with `tagName`, sets its class to `className`, and optionally appends it to `container` element.
function create$1(tagName, className, container) {
	var el = document.createElement(tagName);
	el.className = className || '';

	if (container) {
		container.appendChild(el);
	}
	return el;
}

// @function remove(el: HTMLElement)
// Removes `el` from its parent element
function remove(el) {
	var parent = el.parentNode;
	if (parent) {
		parent.removeChild(el);
	}
}

// @function empty(el: HTMLElement)
// Removes all of `el`'s children elements from `el`
function empty(el) {
	while (el.firstChild) {
		el.removeChild(el.firstChild);
	}
}

// @function toFront(el: HTMLElement)
// Makes `el` the last child of its parent, so it renders in front of the other children.
function toFront(el) {
	var parent = el.parentNode;
	if (parent && parent.lastChild !== el) {
		parent.appendChild(el);
	}
}

// @function toBack(el: HTMLElement)
// Makes `el` the first child of its parent, so it renders behind the other children.
function toBack(el) {
	var parent = el.parentNode;
	if (parent && parent.firstChild !== el) {
		parent.insertBefore(el, parent.firstChild);
	}
}

// @function hasClass(el: HTMLElement, name: String): Boolean
// Returns `true` if the element's class attribute contains `name`.
function hasClass(el, name) {
	if (el.classList !== undefined) {
		return el.classList.contains(name);
	}
	var className = getClass(el);
	return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
}

// @function addClass(el: HTMLElement, name: String)
// Adds `name` to the element's class attribute.
function addClass(el, name) {
	if (el.classList !== undefined) {
		var classes = splitWords(name);
		for (var i = 0, len = classes.length; i < len; i++) {
			el.classList.add(classes[i]);
		}
	} else if (!hasClass(el, name)) {
		var className = getClass(el);
		setClass(el, (className ? className + ' ' : '') + name);
	}
}

// @function removeClass(el: HTMLElement, name: String)
// Removes `name` from the element's class attribute.
function removeClass(el, name) {
	if (el.classList !== undefined) {
		el.classList.remove(name);
	} else {
		setClass(el, trim((' ' + getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
	}
}

// @function setClass(el: HTMLElement, name: String)
// Sets the element's class.
function setClass(el, name) {
	if (el.className.baseVal === undefined) {
		el.className = name;
	} else {
		// in case of SVG element
		el.className.baseVal = name;
	}
}

// @function getClass(el: HTMLElement): String
// Returns the element's class.
function getClass(el) {
	// Check if the element is an SVGElementInstance and use the correspondingElement instead
	// (Required for linked SVG elements in IE11.)
	if (el.correspondingElement) {
		el = el.correspondingElement;
	}
	return el.className.baseVal === undefined ? el.className : el.className.baseVal;
}

// @function setOpacity(el: HTMLElement, opacity: Number)
// Set the opacity of an element (including old IE support).
// `opacity` must be a number from `0` to `1`.
function setOpacity(el, value) {
	if ('opacity' in el.style) {
		el.style.opacity = value;
	} else if ('filter' in el.style) {
		_setOpacityIE(el, value);
	}
}

function _setOpacityIE(el, value) {
	var filter = false,
	    filterName = 'DXImageTransform.Microsoft.Alpha';

	// filters collection throws an error if we try to retrieve a filter that doesn't exist
	try {
		filter = el.filters.item(filterName);
	} catch (e) {
		// don't set opacity to 1 if we haven't already set an opacity,
		// it isn't needed and breaks transparent pngs.
		if (value === 1) { return; }
	}

	value = Math.round(value * 100);

	if (filter) {
		filter.Enabled = (value !== 100);
		filter.Opacity = value;
	} else {
		el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
	}
}

// @function testProp(props: String[]): String|false
// Goes through the array of style names and returns the first name
// that is a valid style name for an element. If no such name is found,
// it returns false. Useful for vendor-prefixed styles like `transform`.
function testProp(props) {
	var style = document.documentElement.style;

	for (var i = 0; i < props.length; i++) {
		if (props[i] in style) {
			return props[i];
		}
	}
	return false;
}

// @function setTransform(el: HTMLElement, offset: Point, scale?: Number)
// Resets the 3D CSS transform of `el` so it is translated by `offset` pixels
// and optionally scaled by `scale`. Does not have an effect if the
// browser doesn't support 3D CSS transforms.
function setTransform(el, offset, scale) {
	var pos = offset || new Point(0, 0);

	el.style[TRANSFORM] =
		(ie3d ?
			'translate(' + pos.x + 'px,' + pos.y + 'px)' :
			'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
		(scale ? ' scale(' + scale + ')' : '');
}

// @function setPosition(el: HTMLElement, position: Point)
// Sets the position of `el` to coordinates specified by `position`,
// using CSS translate or top/left positioning depending on the browser
// (used by Leaflet internally to position its layers).
function setPosition(el, point) {

	/*eslint-disable */
	el._leaflet_pos = point;
	/* eslint-enable */

	if (any3d) {
		setTransform(el, point);
	} else {
		el.style.left = point.x + 'px';
		el.style.top = point.y + 'px';
	}
}

// @function getPosition(el: HTMLElement): Point
// Returns the coordinates of an element previously positioned with setPosition.
function getPosition(el) {
	// this method is only used for elements previously positioned using setPosition,
	// so it's safe to cache the position for performance

	return el._leaflet_pos || new Point(0, 0);
}

// @function disableTextSelection()
// Prevents the user from generating `selectstart` DOM events, usually generated
// when the user drags the mouse through a page with text. Used internally
// by Leaflet to override the behaviour of any click-and-drag interaction on
// the map. Affects drag interactions on the whole document.

// @function enableTextSelection()
// Cancels the effects of a previous [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection).
var disableTextSelection;
var enableTextSelection;
var _userSelect;
if ('onselectstart' in document) {
	disableTextSelection = function () {
		on(window, 'selectstart', preventDefault);
	};
	enableTextSelection = function () {
		off(window, 'selectstart', preventDefault);
	};
} else {
	var userSelectProperty = testProp(
		['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

	disableTextSelection = function () {
		if (userSelectProperty) {
			var style = document.documentElement.style;
			_userSelect = style[userSelectProperty];
			style[userSelectProperty] = 'none';
		}
	};
	enableTextSelection = function () {
		if (userSelectProperty) {
			document.documentElement.style[userSelectProperty] = _userSelect;
			_userSelect = undefined;
		}
	};
}

// @function disableImageDrag()
// As [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection), but
// for `dragstart` DOM events, usually generated when the user drags an image.
function disableImageDrag() {
	on(window, 'dragstart', preventDefault);
}

// @function enableImageDrag()
// Cancels the effects of a previous [`L.DomUtil.disableImageDrag`](#domutil-disabletextselection).
function enableImageDrag() {
	off(window, 'dragstart', preventDefault);
}

var _outlineElement;
var _outlineStyle;
// @function preventOutline(el: HTMLElement)
// Makes the [outline](https://developer.mozilla.org/docs/Web/CSS/outline)
// of the element `el` invisible. Used internally by Leaflet to prevent
// focusable elements from displaying an outline when the user performs a
// drag interaction on them.
function preventOutline(element) {
	while (element.tabIndex === -1) {
		element = element.parentNode;
	}
	if (!element.style) { return; }
	restoreOutline();
	_outlineElement = element;
	_outlineStyle = element.style.outline;
	element.style.outline = 'none';
	on(window, 'keydown', restoreOutline);
}

// @function restoreOutline()
// Cancels the effects of a previous [`L.DomUtil.preventOutline`]().
function restoreOutline() {
	if (!_outlineElement) { return; }
	_outlineElement.style.outline = _outlineStyle;
	_outlineElement = undefined;
	_outlineStyle = undefined;
	off(window, 'keydown', restoreOutline);
}

// @function getSizedParentNode(el: HTMLElement): HTMLElement
// Finds the closest parent node which size (width and height) is not null.
function getSizedParentNode(element) {
	do {
		element = element.parentNode;
	} while ((!element.offsetWidth || !element.offsetHeight) && element !== document.body);
	return element;
}

// @function getScale(el: HTMLElement): Object
// Computes the CSS scale currently applied on the element.
// Returns an object with `x` and `y` members as horizontal and vertical scales respectively,
// and `boundingClientRect` as the result of [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
function getScale(element) {
	var rect = element.getBoundingClientRect(); // Read-only in old browsers.

	return {
		x: rect.width / element.offsetWidth || 1,
		y: rect.height / element.offsetHeight || 1,
		boundingClientRect: rect
	};
}


var DomUtil = (Object.freeze || Object)({
	TRANSFORM: TRANSFORM,
	TRANSITION: TRANSITION,
	TRANSITION_END: TRANSITION_END,
	get: get,
	getStyle: getStyle,
	create: create$1,
	remove: remove,
	empty: empty,
	toFront: toFront,
	toBack: toBack,
	hasClass: hasClass,
	addClass: addClass,
	removeClass: removeClass,
	setClass: setClass,
	getClass: getClass,
	setOpacity: setOpacity,
	testProp: testProp,
	setTransform: setTransform,
	setPosition: setPosition,
	getPosition: getPosition,
	disableTextSelection: disableTextSelection,
	enableTextSelection: enableTextSelection,
	disableImageDrag: disableImageDrag,
	enableImageDrag: enableImageDrag,
	preventOutline: preventOutline,
	restoreOutline: restoreOutline,
	getSizedParentNode: getSizedParentNode,
	getScale: getScale
});

/*
 * @namespace DomEvent
 * Utility functions to work with the [DOM events](https://developer.mozilla.org/docs/Web/API/Event), used by Leaflet internally.
 */

// Inspired by John Resig, Dean Edwards and YUI addEvent implementations.

// @function on(el: HTMLElement, types: String, fn: Function, context?: Object): this
// Adds a listener function (`fn`) to a particular DOM event type of the
// element `el`. You can optionally specify the context of the listener
// (object the `this` keyword will point to). You can also pass several
// space-separated types (e.g. `'click dblclick'`).

// @alternative
// @function on(el: HTMLElement, eventMap: Object, context?: Object): this
// Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
function on(obj, types, fn, context) {

	if (typeof types === 'object') {
		for (var type in types) {
			addOne(obj, type, types[type], fn);
		}
	} else {
		types = splitWords(types);

		for (var i = 0, len = types.length; i < len; i++) {
			addOne(obj, types[i], fn, context);
		}
	}

	return this;
}

var eventsKey = '_leaflet_events';

// @function off(el: HTMLElement, types: String, fn: Function, context?: Object): this
// Removes a previously added listener function.
// Note that if you passed a custom context to on, you must pass the same
// context to `off` in order to remove the listener.

// @alternative
// @function off(el: HTMLElement, eventMap: Object, context?: Object): this
// Removes a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
function off(obj, types, fn, context) {

	if (typeof types === 'object') {
		for (var type in types) {
			removeOne(obj, type, types[type], fn);
		}
	} else if (types) {
		types = splitWords(types);

		for (var i = 0, len = types.length; i < len; i++) {
			removeOne(obj, types[i], fn, context);
		}
	} else {
		for (var j in obj[eventsKey]) {
			removeOne(obj, j, obj[eventsKey][j]);
		}
		delete obj[eventsKey];
	}

	return this;
}

function addOne(obj, type, fn, context) {
	var id = type + stamp(fn) + (context ? '_' + stamp(context) : '');

	if (obj[eventsKey] && obj[eventsKey][id]) { return this; }

	var handler = function (e) {
		return fn.call(context || obj, e || window.event);
	};

	var originalHandler = handler;

	if (pointer && type.indexOf('touch') === 0) {
		// Needs DomEvent.Pointer.js
		addPointerListener(obj, type, handler, id);

	} else if (touch && (type === 'dblclick') && addDoubleTapListener &&
	           !(pointer && chrome)) {
		// Chrome >55 does not need the synthetic dblclicks from addDoubleTapListener
		// See #5180
		addDoubleTapListener(obj, handler, id);

	} else if ('addEventListener' in obj) {

		if (type === 'mousewheel') {
			obj.addEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, false);

		} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
			handler = function (e) {
				e = e || window.event;
				if (isExternalTarget(obj, e)) {
					originalHandler(e);
				}
			};
			obj.addEventListener(type === 'mouseenter' ? 'mouseover' : 'mouseout', handler, false);

		} else {
			if (type === 'click' && android) {
				handler = function (e) {
					filterClick(e, originalHandler);
				};
			}
			obj.addEventListener(type, handler, false);
		}

	} else if ('attachEvent' in obj) {
		obj.attachEvent('on' + type, handler);
	}

	obj[eventsKey] = obj[eventsKey] || {};
	obj[eventsKey][id] = handler;
}

function removeOne(obj, type, fn, context) {

	var id = type + stamp(fn) + (context ? '_' + stamp(context) : ''),
	    handler = obj[eventsKey] && obj[eventsKey][id];

	if (!handler) { return this; }

	if (pointer && type.indexOf('touch') === 0) {
		removePointerListener(obj, type, id);

	} else if (touch && (type === 'dblclick') && removeDoubleTapListener &&
	           !(pointer && chrome)) {
		removeDoubleTapListener(obj, id);

	} else if ('removeEventListener' in obj) {

		if (type === 'mousewheel') {
			obj.removeEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, false);

		} else {
			obj.removeEventListener(
				type === 'mouseenter' ? 'mouseover' :
				type === 'mouseleave' ? 'mouseout' : type, handler, false);
		}

	} else if ('detachEvent' in obj) {
		obj.detachEvent('on' + type, handler);
	}

	obj[eventsKey][id] = null;
}

// @function stopPropagation(ev: DOMEvent): this
// Stop the given event from propagation to parent elements. Used inside the listener functions:
// ```js
// L.DomEvent.on(div, 'click', function (ev) {
// 	L.DomEvent.stopPropagation(ev);
// });
// ```
function stopPropagation(e) {

	if (e.stopPropagation) {
		e.stopPropagation();
	} else if (e.originalEvent) {  // In case of Leaflet event.
		e.originalEvent._stopped = true;
	} else {
		e.cancelBubble = true;
	}
	skipped(e);

	return this;
}

// @function disableScrollPropagation(el: HTMLElement): this
// Adds `stopPropagation` to the element's `'mousewheel'` events (plus browser variants).
function disableScrollPropagation(el) {
	addOne(el, 'mousewheel', stopPropagation);
	return this;
}

// @function disableClickPropagation(el: HTMLElement): this
// Adds `stopPropagation` to the element's `'click'`, `'doubleclick'`,
// `'mousedown'` and `'touchstart'` events (plus browser variants).
function disableClickPropagation(el) {
	on(el, 'mousedown touchstart dblclick', stopPropagation);
	addOne(el, 'click', fakeStop);
	return this;
}

// @function preventDefault(ev: DOMEvent): this
// Prevents the default action of the DOM Event `ev` from happening (such as
// following a link in the href of the a element, or doing a POST request
// with page reload when a `<form>` is submitted).
// Use it inside listener functions.
function preventDefault(e) {
	if (e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
	return this;
}

// @function stop(ev: DOMEvent): this
// Does `stopPropagation` and `preventDefault` at the same time.
function stop(e) {
	preventDefault(e);
	stopPropagation(e);
	return this;
}

// @function getMousePosition(ev: DOMEvent, container?: HTMLElement): Point
// Gets normalized mouse position from a DOM event relative to the
// `container` (border excluded) or to the whole page if not specified.
function getMousePosition(e, container) {
	if (!container) {
		return new Point(e.clientX, e.clientY);
	}

	var scale = getScale(container),
	    offset = scale.boundingClientRect; // left and top  values are in page scale (like the event clientX/Y)

	return new Point(
		// offset.left/top values are in page scale (like clientX/Y),
		// whereas clientLeft/Top (border width) values are the original values (before CSS scale applies).
		(e.clientX - offset.left) / scale.x - container.clientLeft,
		(e.clientY - offset.top) / scale.y - container.clientTop
	);
}

// Chrome on Win scrolls double the pixels as in other platforms (see #4538),
// and Firefox scrolls device pixels, not CSS pixels
var wheelPxFactor =
	(win && chrome) ? 2 * window.devicePixelRatio :
	gecko ? window.devicePixelRatio : 1;

// @function getWheelDelta(ev: DOMEvent): Number
// Gets normalized wheel delta from a mousewheel DOM event, in vertical
// pixels scrolled (negative if scrolling down).
// Events from pointing devices without precise scrolling are mapped to
// a best guess of 60 pixels.
function getWheelDelta(e) {
	return (edge) ? e.wheelDeltaY / 2 : // Don't trust window-geometry-based delta
	       (e.deltaY && e.deltaMode === 0) ? -e.deltaY / wheelPxFactor : // Pixels
	       (e.deltaY && e.deltaMode === 1) ? -e.deltaY * 20 : // Lines
	       (e.deltaY && e.deltaMode === 2) ? -e.deltaY * 60 : // Pages
	       (e.deltaX || e.deltaZ) ? 0 :	// Skip horizontal/depth wheel events
	       e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : // Legacy IE pixels
	       (e.detail && Math.abs(e.detail) < 32765) ? -e.detail * 20 : // Legacy Moz lines
	       e.detail ? e.detail / -32765 * 60 : // Legacy Moz pages
	       0;
}

var skipEvents = {};

function fakeStop(e) {
	// fakes stopPropagation by setting a special event flag, checked/reset with skipped(e)
	skipEvents[e.type] = true;
}

function skipped(e) {
	var events = skipEvents[e.type];
	// reset when checking, as it's only used in map container and propagates outside of the map
	skipEvents[e.type] = false;
	return events;
}

// check if element really left/entered the event target (for mouseenter/mouseleave)
function isExternalTarget(el, e) {

	var related = e.relatedTarget;

	if (!related) { return true; }

	try {
		while (related && (related !== el)) {
			related = related.parentNode;
		}
	} catch (err) {
		return false;
	}
	return (related !== el);
}

var lastClick;

// this is a horrible workaround for a bug in Android where a single touch triggers two click events
function filterClick(e, handler) {
	var timeStamp = (e.timeStamp || (e.originalEvent && e.originalEvent.timeStamp)),
	    elapsed = lastClick && (timeStamp - lastClick);

	// are they closer together than 500ms yet more than 100ms?
	// Android typically triggers them ~300ms apart while multiple listeners
	// on the same event should be triggered far faster;
	// or check if click is simulated on the element, and if it is, reject any non-simulated events

	if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
		stop(e);
		return;
	}
	lastClick = timeStamp;

	handler(e);
}




var DomEvent = (Object.freeze || Object)({
	on: on,
	off: off,
	stopPropagation: stopPropagation,
	disableScrollPropagation: disableScrollPropagation,
	disableClickPropagation: disableClickPropagation,
	preventDefault: preventDefault,
	stop: stop,
	getMousePosition: getMousePosition,
	getWheelDelta: getWheelDelta,
	fakeStop: fakeStop,
	skipped: skipped,
	isExternalTarget: isExternalTarget,
	addListener: on,
	removeListener: off
});

/*
 * @class PosAnimation
 * @aka L.PosAnimation
 * @inherits Evented
 * Used internally for panning animations, utilizing CSS3 Transitions for modern browsers and a timer fallback for IE6-9.
 *
 * @example
 * ```js
 * var fx = new L.PosAnimation();
 * fx.run(el, [300, 500], 0.5);
 * ```
 *
 * @constructor L.PosAnimation()
 * Creates a `PosAnimation` object.
 *
 */

var PosAnimation = Evented.extend({

	// @method run(el: HTMLElement, newPos: Point, duration?: Number, easeLinearity?: Number)
	// Run an animation of a given element to a new position, optionally setting
	// duration in seconds (`0.25` by default) and easing linearity factor (3rd
	// argument of the [cubic bezier curve](http://cubic-bezier.com/#0,0,.5,1),
	// `0.5` by default).
	run: function (el, newPos, duration, easeLinearity) {
		this.stop();

		this._el = el;
		this._inProgress = true;
		this._duration = duration || 0.25;
		this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);

		this._startPos = getPosition(el);
		this._offset = newPos.subtract(this._startPos);
		this._startTime = +new Date();

		// @event start: Event
		// Fired when the animation starts
		this.fire('start');

		this._animate();
	},

	// @method stop()
	// Stops the animation (if currently running).
	stop: function () {
		if (!this._inProgress) { return; }

		this._step(true);
		this._complete();
	},

	_animate: function () {
		// animation loop
		this._animId = requestAnimFrame(this._animate, this);
		this._step();
	},

	_step: function (round) {
		var elapsed = (+new Date()) - this._startTime,
		    duration = this._duration * 1000;

		if (elapsed < duration) {
			this._runFrame(this._easeOut(elapsed / duration), round);
		} else {
			this._runFrame(1);
			this._complete();
		}
	},

	_runFrame: function (progress, round) {
		var pos = this._startPos.add(this._offset.multiplyBy(progress));
		if (round) {
			pos._round();
		}
		setPosition(this._el, pos);

		// @event step: Event
		// Fired continuously during the animation.
		this.fire('step');
	},

	_complete: function () {
		cancelAnimFrame(this._animId);

		this._inProgress = false;
		// @event end: Event
		// Fired when the animation ends.
		this.fire('end');
	},

	_easeOut: function (t) {
		return 1 - Math.pow(1 - t, this._easeOutPower);
	}
});

/*
 * @class Map
 * @aka L.Map
 * @inherits Evented
 *
 * The central class of the API — it is used to create a map on a page and manipulate it.
 *
 * @example
 *
 * ```js
 * // initialize the map on the "map" div with a given center and zoom
 * var map = L.map('map', {
 * 	center: [51.505, -0.09],
 * 	zoom: 13
 * });
 * ```
 *
 */

var Map = Evented.extend({

	options: {
		// @section Map State Options
		// @option crs: CRS = L.CRS.EPSG3857
		// The [Coordinate Reference System](#crs) to use. Don't change this if you're not
		// sure what it means.
		crs: EPSG3857,

		// @option center: LatLng = undefined
		// Initial geographic center of the map
		center: undefined,

		// @option zoom: Number = undefined
		// Initial map zoom level
		zoom: undefined,

		// @option minZoom: Number = *
		// Minimum zoom level of the map.
		// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
		// the lowest of their `minZoom` options will be used instead.
		minZoom: undefined,

		// @option maxZoom: Number = *
		// Maximum zoom level of the map.
		// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
		// the highest of their `maxZoom` options will be used instead.
		maxZoom: undefined,

		// @option layers: Layer[] = []
		// Array of layers that will be added to the map initially
		layers: [],

		// @option maxBounds: LatLngBounds = null
		// When this option is set, the map restricts the view to the given
		// geographical bounds, bouncing the user back if the user tries to pan
		// outside the view. To set the restriction dynamically, use
		// [`setMaxBounds`](#map-setmaxbounds) method.
		maxBounds: undefined,

		// @option renderer: Renderer = *
		// The default method for drawing vector layers on the map. `L.SVG`
		// or `L.Canvas` by default depending on browser support.
		renderer: undefined,


		// @section Animation Options
		// @option zoomAnimation: Boolean = true
		// Whether the map zoom animation is enabled. By default it's enabled
		// in all browsers that support CSS3 Transitions except Android.
		zoomAnimation: true,

		// @option zoomAnimationThreshold: Number = 4
		// Won't animate zoom if the zoom difference exceeds this value.
		zoomAnimationThreshold: 4,

		// @option fadeAnimation: Boolean = true
		// Whether the tile fade animation is enabled. By default it's enabled
		// in all browsers that support CSS3 Transitions except Android.
		fadeAnimation: true,

		// @option markerZoomAnimation: Boolean = true
		// Whether markers animate their zoom with the zoom animation, if disabled
		// they will disappear for the length of the animation. By default it's
		// enabled in all browsers that support CSS3 Transitions except Android.
		markerZoomAnimation: true,

		// @option transform3DLimit: Number = 2^23
		// Defines the maximum size of a CSS translation transform. The default
		// value should not be changed unless a web browser positions layers in
		// the wrong place after doing a large `panBy`.
		transform3DLimit: 8388608, // Precision limit of a 32-bit float

		// @section Interaction Options
		// @option zoomSnap: Number = 1
		// Forces the map's zoom level to always be a multiple of this, particularly
		// right after a [`fitBounds()`](#map-fitbounds) or a pinch-zoom.
		// By default, the zoom level snaps to the nearest integer; lower values
		// (e.g. `0.5` or `0.1`) allow for greater granularity. A value of `0`
		// means the zoom level will not be snapped after `fitBounds` or a pinch-zoom.
		zoomSnap: 1,

		// @option zoomDelta: Number = 1
		// Controls how much the map's zoom level will change after a
		// [`zoomIn()`](#map-zoomin), [`zoomOut()`](#map-zoomout), pressing `+`
		// or `-` on the keyboard, or using the [zoom controls](#control-zoom).
		// Values smaller than `1` (e.g. `0.5`) allow for greater granularity.
		zoomDelta: 1,

		// @option trackResize: Boolean = true
		// Whether the map automatically handles browser window resize to update itself.
		trackResize: true
	},

	initialize: function (id, options) { // (HTMLElement or String, Object)
		options = setOptions(this, options);

		// Make sure to assign internal flags at the beginning,
		// to avoid inconsistent state in some edge cases.
		this._handlers = [];
		this._layers = {};
		this._zoomBoundLayers = {};
		this._sizeChanged = true;

		this._initContainer(id);
		this._initLayout();

		// hack for https://github.com/Leaflet/Leaflet/issues/1980
		this._onResize = bind(this._onResize, this);

		this._initEvents();

		if (options.maxBounds) {
			this.setMaxBounds(options.maxBounds);
		}

		if (options.zoom !== undefined) {
			this._zoom = this._limitZoom(options.zoom);
		}

		if (options.center && options.zoom !== undefined) {
			this.setView(toLatLng(options.center), options.zoom, {reset: true});
		}

		this.callInitHooks();

		// don't animate on browsers without hardware-accelerated transitions or old Android/Opera
		this._zoomAnimated = TRANSITION && any3d && !mobileOpera &&
				this.options.zoomAnimation;

		// zoom transitions run with the same duration for all layers, so if one of transitionend events
		// happens after starting zoom animation (propagating to the map pane), we know that it ended globally
		if (this._zoomAnimated) {
			this._createAnimProxy();
			on(this._proxy, TRANSITION_END, this._catchTransitionEnd, this);
		}

		this._addLayers(this.options.layers);
	},


	// @section Methods for modifying map state

	// @method setView(center: LatLng, zoom: Number, options?: Zoom/pan options): this
	// Sets the view of the map (geographical center and zoom) with the given
	// animation options.
	setView: function (center, zoom, options) {

		zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
		center = this._limitCenter(toLatLng(center), zoom, this.options.maxBounds);
		options = options || {};

		this._stop();

		if (this._loaded && !options.reset && options !== true) {

			if (options.animate !== undefined) {
				options.zoom = extend({animate: options.animate}, options.zoom);
				options.pan = extend({animate: options.animate, duration: options.duration}, options.pan);
			}

			// try animating pan or zoom
			var moved = (this._zoom !== zoom) ?
				this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) :
				this._tryAnimatedPan(center, options.pan);

			if (moved) {
				// prevent resize handler call, the view will refresh after animation anyway
				clearTimeout(this._sizeTimer);
				return this;
			}
		}

		// animation didn't start, just reset the map view
		this._resetView(center, zoom);

		return this;
	},

	// @method setZoom(zoom: Number, options?: Zoom/pan options): this
	// Sets the zoom of the map.
	setZoom: function (zoom, options) {
		if (!this._loaded) {
			this._zoom = zoom;
			return this;
		}
		return this.setView(this.getCenter(), zoom, {zoom: options});
	},

	// @method zoomIn(delta?: Number, options?: Zoom options): this
	// Increases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
	zoomIn: function (delta, options) {
		delta = delta || (any3d ? this.options.zoomDelta : 1);
		return this.setZoom(this._zoom + delta, options);
	},

	// @method zoomOut(delta?: Number, options?: Zoom options): this
	// Decreases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
	zoomOut: function (delta, options) {
		delta = delta || (any3d ? this.options.zoomDelta : 1);
		return this.setZoom(this._zoom - delta, options);
	},

	// @method setZoomAround(latlng: LatLng, zoom: Number, options: Zoom options): this
	// Zooms the map while keeping a specified geographical point on the map
	// stationary (e.g. used internally for scroll zoom and double-click zoom).
	// @alternative
	// @method setZoomAround(offset: Point, zoom: Number, options: Zoom options): this
	// Zooms the map while keeping a specified pixel on the map (relative to the top-left corner) stationary.
	setZoomAround: function (latlng, zoom, options) {
		var scale = this.getZoomScale(zoom),
		    viewHalf = this.getSize().divideBy(2),
		    containerPoint = latlng instanceof Point ? latlng : this.latLngToContainerPoint(latlng),

		    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
		    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));

		return this.setView(newCenter, zoom, {zoom: options});
	},

	_getBoundsCenterZoom: function (bounds, options) {

		options = options || {};
		bounds = bounds.getBounds ? bounds.getBounds() : toLatLngBounds(bounds);

		var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
		    paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),

		    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));

		zoom = (typeof options.maxZoom === 'number') ? Math.min(options.maxZoom, zoom) : zoom;

		if (zoom === Infinity) {
			return {
				center: bounds.getCenter(),
				zoom: zoom
			};
		}

		var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

		    swPoint = this.project(bounds.getSouthWest(), zoom),
		    nePoint = this.project(bounds.getNorthEast(), zoom),
		    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

		return {
			center: center,
			zoom: zoom
		};
	},

	// @method fitBounds(bounds: LatLngBounds, options?: fitBounds options): this
	// Sets a map view that contains the given geographical bounds with the
	// maximum zoom level possible.
	fitBounds: function (bounds, options) {

		bounds = toLatLngBounds(bounds);

		if (!bounds.isValid()) {
			throw new Error('Bounds are not valid.');
		}

		var target = this._getBoundsCenterZoom(bounds, options);
		return this.setView(target.center, target.zoom, options);
	},

	// @method fitWorld(options?: fitBounds options): this
	// Sets a map view that mostly contains the whole world with the maximum
	// zoom level possible.
	fitWorld: function (options) {
		return this.fitBounds([[-90, -180], [90, 180]], options);
	},

	// @method panTo(latlng: LatLng, options?: Pan options): this
	// Pans the map to a given center.
	panTo: function (center, options) { // (LatLng)
		return this.setView(center, this._zoom, {pan: options});
	},

	// @method panBy(offset: Point, options?: Pan options): this
	// Pans the map by a given number of pixels (animated).
	panBy: function (offset, options) {
		offset = toPoint(offset).round();
		options = options || {};

		if (!offset.x && !offset.y) {
			return this.fire('moveend');
		}
		// If we pan too far, Chrome gets issues with tiles
		// and makes them disappear or appear in the wrong place (slightly offset) #2602
		if (options.animate !== true && !this.getSize().contains(offset)) {
			this._resetView(this.unproject(this.project(this.getCenter()).add(offset)), this.getZoom());
			return this;
		}

		if (!this._panAnim) {
			this._panAnim = new PosAnimation();

			this._panAnim.on({
				'step': this._onPanTransitionStep,
				'end': this._onPanTransitionEnd
			}, this);
		}

		// don't fire movestart if animating inertia
		if (!options.noMoveStart) {
			this.fire('movestart');
		}

		// animate pan unless animate: false specified
		if (options.animate !== false) {
			addClass(this._mapPane, 'leaflet-pan-anim');

			var newPos = this._getMapPanePos().subtract(offset).round();
			this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
		} else {
			this._rawPanBy(offset);
			this.fire('move').fire('moveend');
		}

		return this;
	},

	// @method flyTo(latlng: LatLng, zoom?: Number, options?: Zoom/pan options): this
	// Sets the view of the map (geographical center and zoom) performing a smooth
	// pan-zoom animation.
	flyTo: function (targetCenter, targetZoom, options) {

		options = options || {};
		if (options.animate === false || !any3d) {
			return this.setView(targetCenter, targetZoom, options);
		}

		this._stop();

		var from = this.project(this.getCenter()),
		    to = this.project(targetCenter),
		    size = this.getSize(),
		    startZoom = this._zoom;

		targetCenter = toLatLng(targetCenter);
		targetZoom = targetZoom === undefined ? startZoom : targetZoom;

		var w0 = Math.max(size.x, size.y),
		    w1 = w0 * this.getZoomScale(startZoom, targetZoom),
		    u1 = (to.distanceTo(from)) || 1,
		    rho = 1.42,
		    rho2 = rho * rho;

		function r(i) {
			var s1 = i ? -1 : 1,
			    s2 = i ? w1 : w0,
			    t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1,
			    b1 = 2 * s2 * rho2 * u1,
			    b = t1 / b1,
			    sq = Math.sqrt(b * b + 1) - b;

			    // workaround for floating point precision bug when sq = 0, log = -Infinite,
			    // thus triggering an infinite loop in flyTo
			    var log = sq < 0.000000001 ? -18 : Math.log(sq);

			return log;
		}

		function sinh(n) { return (Math.exp(n) - Math.exp(-n)) / 2; }
		function cosh(n) { return (Math.exp(n) + Math.exp(-n)) / 2; }
		function tanh(n) { return sinh(n) / cosh(n); }

		var r0 = r(0);

		function w(s) { return w0 * (cosh(r0) / cosh(r0 + rho * s)); }
		function u(s) { return w0 * (cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2; }

		function easeOut(t) { return 1 - Math.pow(1 - t, 1.5); }

		var start = Date.now(),
		    S = (r(1) - r0) / rho,
		    duration = options.duration ? 1000 * options.duration : 1000 * S * 0.8;

		function frame() {
			var t = (Date.now() - start) / duration,
			    s = easeOut(t) * S;

			if (t <= 1) {
				this._flyToFrame = requestAnimFrame(frame, this);

				this._move(
					this.unproject(from.add(to.subtract(from).multiplyBy(u(s) / u1)), startZoom),
					this.getScaleZoom(w0 / w(s), startZoom),
					{flyTo: true});

			} else {
				this
					._move(targetCenter, targetZoom)
					._moveEnd(true);
			}
		}

		this._moveStart(true, options.noMoveStart);

		frame.call(this);
		return this;
	},

	// @method flyToBounds(bounds: LatLngBounds, options?: fitBounds options): this
	// Sets the view of the map with a smooth animation like [`flyTo`](#map-flyto),
	// but takes a bounds parameter like [`fitBounds`](#map-fitbounds).
	flyToBounds: function (bounds, options) {
		var target = this._getBoundsCenterZoom(bounds, options);
		return this.flyTo(target.center, target.zoom, options);
	},

	// @method setMaxBounds(bounds: Bounds): this
	// Restricts the map view to the given bounds (see the [maxBounds](#map-maxbounds) option).
	setMaxBounds: function (bounds) {
		bounds = toLatLngBounds(bounds);

		if (!bounds.isValid()) {
			this.options.maxBounds = null;
			return this.off('moveend', this._panInsideMaxBounds);
		} else if (this.options.maxBounds) {
			this.off('moveend', this._panInsideMaxBounds);
		}

		this.options.maxBounds = bounds;

		if (this._loaded) {
			this._panInsideMaxBounds();
		}

		return this.on('moveend', this._panInsideMaxBounds);
	},

	// @method setMinZoom(zoom: Number): this
	// Sets the lower limit for the available zoom levels (see the [minZoom](#map-minzoom) option).
	setMinZoom: function (zoom) {
		var oldZoom = this.options.minZoom;
		this.options.minZoom = zoom;

		if (this._loaded && oldZoom !== zoom) {
			this.fire('zoomlevelschange');

			if (this.getZoom() < this.options.minZoom) {
				return this.setZoom(zoom);
			}
		}

		return this;
	},

	// @method setMaxZoom(zoom: Number): this
	// Sets the upper limit for the available zoom levels (see the [maxZoom](#map-maxzoom) option).
	setMaxZoom: function (zoom) {
		var oldZoom = this.options.maxZoom;
		this.options.maxZoom = zoom;

		if (this._loaded && oldZoom !== zoom) {
			this.fire('zoomlevelschange');

			if (this.getZoom() > this.options.maxZoom) {
				return this.setZoom(zoom);
			}
		}

		return this;
	},

	// @method panInsideBounds(bounds: LatLngBounds, options?: Pan options): this
	// Pans the map to the closest view that would lie inside the given bounds (if it's not already), controlling the animation using the options specific, if any.
	panInsideBounds: function (bounds, options) {
		this._enforcingBounds = true;
		var center = this.getCenter(),
		    newCenter = this._limitCenter(center, this._zoom, toLatLngBounds(bounds));

		if (!center.equals(newCenter)) {
			this.panTo(newCenter, options);
		}

		this._enforcingBounds = false;
		return this;
	},

	// @method panInside(latlng: LatLng, options?: options): this
	// Pans the map the minimum amount to make the `latlng` visible. Use
	// `padding`, `paddingTopLeft` and `paddingTopRight` options to fit
	// the display to more restricted bounds, like [`fitBounds`](#map-fitbounds).
	// If `latlng` is already within the (optionally padded) display bounds,
	// the map will not be panned.
	panInside: function (latlng, options) {
		options = options || {};

		var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
		    paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),
		    center = this.getCenter(),
		    pixelCenter = this.project(center),
		    pixelPoint = this.project(latlng),
		    pixelBounds = this.getPixelBounds(),
		    halfPixelBounds = pixelBounds.getSize().divideBy(2),
		    paddedBounds = toBounds([pixelBounds.min.add(paddingTL), pixelBounds.max.subtract(paddingBR)]);

		if (!paddedBounds.contains(pixelPoint)) {
			this._enforcingBounds = true;
			var diff = pixelCenter.subtract(pixelPoint),
			    newCenter = toPoint(pixelPoint.x + diff.x, pixelPoint.y + diff.y);

			if (pixelPoint.x < paddedBounds.min.x || pixelPoint.x > paddedBounds.max.x) {
				newCenter.x = pixelCenter.x - diff.x;
				if (diff.x > 0) {
					newCenter.x += halfPixelBounds.x - paddingTL.x;
				} else {
					newCenter.x -= halfPixelBounds.x - paddingBR.x;
				}
			}
			if (pixelPoint.y < paddedBounds.min.y || pixelPoint.y > paddedBounds.max.y) {
				newCenter.y = pixelCenter.y - diff.y;
				if (diff.y > 0) {
					newCenter.y += halfPixelBounds.y - paddingTL.y;
				} else {
					newCenter.y -= halfPixelBounds.y - paddingBR.y;
				}
			}
			this.panTo(this.unproject(newCenter), options);
			this._enforcingBounds = false;
		}
		return this;
	},

	// @method invalidateSize(options: Zoom/pan options): this
	// Checks if the map container size changed and updates the map if so —
	// call it after you've changed the map size dynamically, also animating
	// pan by default. If `options.pan` is `false`, panning will not occur.
	// If `options.debounceMoveend` is `true`, it will delay `moveend` event so
	// that it doesn't happen often even if the method is called many
	// times in a row.

	// @alternative
	// @method invalidateSize(animate: Boolean): this
	// Checks if the map container size changed and updates the map if so —
	// call it after you've changed the map size dynamically, also animating
	// pan by default.
	invalidateSize: function (options) {
		if (!this._loaded) { return this; }

		options = extend({
			animate: false,
			pan: true
		}, options === true ? {animate: true} : options);

		var oldSize = this.getSize();
		this._sizeChanged = true;
		this._lastCenter = null;

		var newSize = this.getSize(),
		    oldCenter = oldSize.divideBy(2).round(),
		    newCenter = newSize.divideBy(2).round(),
		    offset = oldCenter.subtract(newCenter);

		if (!offset.x && !offset.y) { return this; }

		if (options.animate && options.pan) {
			this.panBy(offset);

		} else {
			if (options.pan) {
				this._rawPanBy(offset);
			}

			this.fire('move');

			if (options.debounceMoveend) {
				clearTimeout(this._sizeTimer);
				this._sizeTimer = setTimeout(bind(this.fire, this, 'moveend'), 200);
			} else {
				this.fire('moveend');
			}
		}

		// @section Map state change events
		// @event resize: ResizeEvent
		// Fired when the map is resized.
		return this.fire('resize', {
			oldSize: oldSize,
			newSize: newSize
		});
	},

	// @section Methods for modifying map state
	// @method stop(): this
	// Stops the currently running `panTo` or `flyTo` animation, if any.
	stop: function () {
		this.setZoom(this._limitZoom(this._zoom));
		if (!this.options.zoomSnap) {
			this.fire('viewreset');
		}
		return this._stop();
	},

	// @section Geolocation methods
	// @method locate(options?: Locate options): this
	// Tries to locate the user using the Geolocation API, firing a [`locationfound`](#map-locationfound)
	// event with location data on success or a [`locationerror`](#map-locationerror) event on failure,
	// and optionally sets the map view to the user's location with respect to
	// detection accuracy (or to the world view if geolocation failed).
	// Note that, if your page doesn't use HTTPS, this method will fail in
	// modern browsers ([Chrome 50 and newer](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins))
	// See `Locate options` for more details.
	locate: function (options) {

		options = this._locateOptions = extend({
			timeout: 10000,
			watch: false
			// setView: false
			// maxZoom: <Number>
			// maximumAge: 0
			// enableHighAccuracy: false
		}, options);

		if (!('geolocation' in navigator)) {
			this._handleGeolocationError({
				code: 0,
				message: 'Geolocation not supported.'
			});
			return this;
		}

		var onResponse = bind(this._handleGeolocationResponse, this),
		    onError = bind(this._handleGeolocationError, this);

		if (options.watch) {
			this._locationWatchId =
			        navigator.geolocation.watchPosition(onResponse, onError, options);
		} else {
			navigator.geolocation.getCurrentPosition(onResponse, onError, options);
		}
		return this;
	},

	// @method stopLocate(): this
	// Stops watching location previously initiated by `map.locate({watch: true})`
	// and aborts resetting the map view if map.locate was called with
	// `{setView: true}`.
	stopLocate: function () {
		if (navigator.geolocation && navigator.geolocation.clearWatch) {
			navigator.geolocation.clearWatch(this._locationWatchId);
		}
		if (this._locateOptions) {
			this._locateOptions.setView = false;
		}
		return this;
	},

	_handleGeolocationError: function (error) {
		var c = error.code,
		    message = error.message ||
		            (c === 1 ? 'permission denied' :
		            (c === 2 ? 'position unavailable' : 'timeout'));

		if (this._locateOptions.setView && !this._loaded) {
			this.fitWorld();
		}

		// @section Location events
		// @event locationerror: ErrorEvent
		// Fired when geolocation (using the [`locate`](#map-locate) method) failed.
		this.fire('locationerror', {
			code: c,
			message: 'Geolocation error: ' + message + '.'
		});
	},

	_handleGeolocationResponse: function (pos) {
		var lat = pos.coords.latitude,
		    lng = pos.coords.longitude,
		    latlng = new LatLng(lat, lng),
		    bounds = latlng.toBounds(pos.coords.accuracy * 2),
		    options = this._locateOptions;

		if (options.setView) {
			var zoom = this.getBoundsZoom(bounds);
			this.setView(latlng, options.maxZoom ? Math.min(zoom, options.maxZoom) : zoom);
		}

		var data = {
			latlng: latlng,
			bounds: bounds,
			timestamp: pos.timestamp
		};

		for (var i in pos.coords) {
			if (typeof pos.coords[i] === 'number') {
				data[i] = pos.coords[i];
			}
		}

		// @event locationfound: LocationEvent
		// Fired when geolocation (using the [`locate`](#map-locate) method)
		// went successfully.
		this.fire('locationfound', data);
	},

	// TODO Appropriate docs section?
	// @section Other Methods
	// @method addHandler(name: String, HandlerClass: Function): this
	// Adds a new `Handler` to the map, given its name and constructor function.
	addHandler: function (name, HandlerClass) {
		if (!HandlerClass) { return this; }

		var handler = this[name] = new HandlerClass(this);

		this._handlers.push(handler);

		if (this.options[name]) {
			handler.enable();
		}

		return this;
	},

	// @method remove(): this
	// Destroys the map and clears all related event listeners.
	remove: function () {

		this._initEvents(true);

		if (this._containerId !== this._container._leaflet_id) {
			throw new Error('Map container is being reused by another instance');
		}

		try {
			// throws error in IE6-8
			delete this._container._leaflet_id;
			delete this._containerId;
		} catch (e) {
			/*eslint-disable */
			this._container._leaflet_id = undefined;
			/* eslint-enable */
			this._containerId = undefined;
		}

		if (this._locationWatchId !== undefined) {
			this.stopLocate();
		}

		this._stop();

		remove(this._mapPane);

		if (this._clearControlPos) {
			this._clearControlPos();
		}
		if (this._resizeRequest) {
			cancelAnimFrame(this._resizeRequest);
			this._resizeRequest = null;
		}

		this._clearHandlers();

		if (this._loaded) {
			// @section Map state change events
			// @event unload: Event
			// Fired when the map is destroyed with [remove](#map-remove) method.
			this.fire('unload');
		}

		var i;
		for (i in this._layers) {
			this._layers[i].remove();
		}
		for (i in this._panes) {
			remove(this._panes[i]);
		}

		this._layers = [];
		this._panes = [];
		delete this._mapPane;
		delete this._renderer;

		return this;
	},

	// @section Other Methods
	// @method createPane(name: String, container?: HTMLElement): HTMLElement
	// Creates a new [map pane](#map-pane) with the given name if it doesn't exist already,
	// then returns it. The pane is created as a child of `container`, or
	// as a child of the main map pane if not set.
	createPane: function (name, container) {
		var className = 'leaflet-pane' + (name ? ' leaflet-' + name.replace('Pane', '') + '-pane' : ''),
		    pane = create$1('div', className, container || this._mapPane);

		if (name) {
			this._panes[name] = pane;
		}
		return pane;
	},

	// @section Methods for Getting Map State

	// @method getCenter(): LatLng
	// Returns the geographical center of the map view
	getCenter: function () {
		this._checkIfLoaded();

		if (this._lastCenter && !this._moved()) {
			return this._lastCenter;
		}
		return this.layerPointToLatLng(this._getCenterLayerPoint());
	},

	// @method getZoom(): Number
	// Returns the current zoom level of the map view
	getZoom: function () {
		return this._zoom;
	},

	// @method getBounds(): LatLngBounds
	// Returns the geographical bounds visible in the current map view
	getBounds: function () {
		var bounds = this.getPixelBounds(),
		    sw = this.unproject(bounds.getBottomLeft()),
		    ne = this.unproject(bounds.getTopRight());

		return new LatLngBounds(sw, ne);
	},

	// @method getMinZoom(): Number
	// Returns the minimum zoom level of the map (if set in the `minZoom` option of the map or of any layers), or `0` by default.
	getMinZoom: function () {
		return this.options.minZoom === undefined ? this._layersMinZoom || 0 : this.options.minZoom;
	},

	// @method getMaxZoom(): Number
	// Returns the maximum zoom level of the map (if set in the `maxZoom` option of the map or of any layers).
	getMaxZoom: function () {
		return this.options.maxZoom === undefined ?
			(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
			this.options.maxZoom;
	},

	// @method getBoundsZoom(bounds: LatLngBounds, inside?: Boolean, padding?: Point): Number
	// Returns the maximum zoom level on which the given bounds fit to the map
	// view in its entirety. If `inside` (optional) is set to `true`, the method
	// instead returns the minimum zoom level on which the map view fits into
	// the given bounds in its entirety.
	getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
		bounds = toLatLngBounds(bounds);
		padding = toPoint(padding || [0, 0]);

		var zoom = this.getZoom() || 0,
		    min = this.getMinZoom(),
		    max = this.getMaxZoom(),
		    nw = bounds.getNorthWest(),
		    se = bounds.getSouthEast(),
		    size = this.getSize().subtract(padding),
		    boundsSize = toBounds(this.project(se, zoom), this.project(nw, zoom)).getSize(),
		    snap = any3d ? this.options.zoomSnap : 1,
		    scalex = size.x / boundsSize.x,
		    scaley = size.y / boundsSize.y,
		    scale = inside ? Math.max(scalex, scaley) : Math.min(scalex, scaley);

		zoom = this.getScaleZoom(scale, zoom);

		if (snap) {
			zoom = Math.round(zoom / (snap / 100)) * (snap / 100); // don't jump if within 1% of a snap level
			zoom = inside ? Math.ceil(zoom / snap) * snap : Math.floor(zoom / snap) * snap;
		}

		return Math.max(min, Math.min(max, zoom));
	},

	// @method getSize(): Point
	// Returns the current size of the map container (in pixels).
	getSize: function () {
		if (!this._size || this._sizeChanged) {
			this._size = new Point(
				this._container.clientWidth || 0,
				this._container.clientHeight || 0);

			this._sizeChanged = false;
		}
		return this._size.clone();
	},

	// @method getPixelBounds(): Bounds
	// Returns the bounds of the current map view in projected pixel
	// coordinates (sometimes useful in layer and overlay implementations).
	getPixelBounds: function (center, zoom) {
		var topLeftPoint = this._getTopLeftPoint(center, zoom);
		return new Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
	},

	// TODO: Check semantics - isn't the pixel origin the 0,0 coord relative to
	// the map pane? "left point of the map layer" can be confusing, specially
	// since there can be negative offsets.
	// @method getPixelOrigin(): Point
	// Returns the projected pixel coordinates of the top left point of
	// the map layer (useful in custom layer and overlay implementations).
	getPixelOrigin: function () {
		this._checkIfLoaded();
		return this._pixelOrigin;
	},

	// @method getPixelWorldBounds(zoom?: Number): Bounds
	// Returns the world's bounds in pixel coordinates for zoom level `zoom`.
	// If `zoom` is omitted, the map's current zoom level is used.
	getPixelWorldBounds: function (zoom) {
		return this.options.crs.getProjectedBounds(zoom === undefined ? this.getZoom() : zoom);
	},

	// @section Other Methods

	// @method getPane(pane: String|HTMLElement): HTMLElement
	// Returns a [map pane](#map-pane), given its name or its HTML element (its identity).
	getPane: function (pane) {
		return typeof pane === 'string' ? this._panes[pane] : pane;
	},

	// @method getPanes(): Object
	// Returns a plain object containing the names of all [panes](#map-pane) as keys and
	// the panes as values.
	getPanes: function () {
		return this._panes;
	},

	// @method getContainer: HTMLElement
	// Returns the HTML element that contains the map.
	getContainer: function () {
		return this._container;
	},


	// @section Conversion Methods

	// @method getZoomScale(toZoom: Number, fromZoom: Number): Number
	// Returns the scale factor to be applied to a map transition from zoom level
	// `fromZoom` to `toZoom`. Used internally to help with zoom animations.
	getZoomScale: function (toZoom, fromZoom) {
		// TODO replace with universal implementation after refactoring projections
		var crs = this.options.crs;
		fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
		return crs.scale(toZoom) / crs.scale(fromZoom);
	},

	// @method getScaleZoom(scale: Number, fromZoom: Number): Number
	// Returns the zoom level that the map would end up at, if it is at `fromZoom`
	// level and everything is scaled by a factor of `scale`. Inverse of
	// [`getZoomScale`](#map-getZoomScale).
	getScaleZoom: function (scale, fromZoom) {
		var crs = this.options.crs;
		fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
		var zoom = crs.zoom(scale * crs.scale(fromZoom));
		return isNaN(zoom) ? Infinity : zoom;
	},

	// @method project(latlng: LatLng, zoom: Number): Point
	// Projects a geographical coordinate `LatLng` according to the projection
	// of the map's CRS, then scales it according to `zoom` and the CRS's
	// `Transformation`. The result is pixel coordinate relative to
	// the CRS origin.
	project: function (latlng, zoom) {
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.latLngToPoint(toLatLng(latlng), zoom);
	},

	// @method unproject(point: Point, zoom: Number): LatLng
	// Inverse of [`project`](#map-project).
	unproject: function (point, zoom) {
		zoom = zoom === undefined ? this._zoom : zoom;
		return this.options.crs.pointToLatLng(toPoint(point), zoom);
	},

	// @method layerPointToLatLng(point: Point): LatLng
	// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
	// returns the corresponding geographical coordinate (for the current zoom level).
	layerPointToLatLng: function (point) {
		var projectedPoint = toPoint(point).add(this.getPixelOrigin());
		return this.unproject(projectedPoint);
	},

	// @method latLngToLayerPoint(latlng: LatLng): Point
	// Given a geographical coordinate, returns the corresponding pixel coordinate
	// relative to the [origin pixel](#map-getpixelorigin).
	latLngToLayerPoint: function (latlng) {
		var projectedPoint = this.project(toLatLng(latlng))._round();
		return projectedPoint._subtract(this.getPixelOrigin());
	},

	// @method wrapLatLng(latlng: LatLng): LatLng
	// Returns a `LatLng` where `lat` and `lng` has been wrapped according to the
	// map's CRS's `wrapLat` and `wrapLng` properties, if they are outside the
	// CRS's bounds.
	// By default this means longitude is wrapped around the dateline so its
	// value is between -180 and +180 degrees.
	wrapLatLng: function (latlng) {
		return this.options.crs.wrapLatLng(toLatLng(latlng));
	},

	// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
	// Returns a `LatLngBounds` with the same size as the given one, ensuring that
	// its center is within the CRS's bounds.
	// By default this means the center longitude is wrapped around the dateline so its
	// value is between -180 and +180 degrees, and the majority of the bounds
	// overlaps the CRS's bounds.
	wrapLatLngBounds: function (latlng) {
		return this.options.crs.wrapLatLngBounds(toLatLngBounds(latlng));
	},

	// @method distance(latlng1: LatLng, latlng2: LatLng): Number
	// Returns the distance between two geographical coordinates according to
	// the map's CRS. By default this measures distance in meters.
	distance: function (latlng1, latlng2) {
		return this.options.crs.distance(toLatLng(latlng1), toLatLng(latlng2));
	},

	// @method containerPointToLayerPoint(point: Point): Point
	// Given a pixel coordinate relative to the map container, returns the corresponding
	// pixel coordinate relative to the [origin pixel](#map-getpixelorigin).
	containerPointToLayerPoint: function (point) { // (Point)
		return toPoint(point).subtract(this._getMapPanePos());
	},

	// @method layerPointToContainerPoint(point: Point): Point
	// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
	// returns the corresponding pixel coordinate relative to the map container.
	layerPointToContainerPoint: function (point) { // (Point)
		return toPoint(point).add(this._getMapPanePos());
	},

	// @method containerPointToLatLng(point: Point): LatLng
	// Given a pixel coordinate relative to the map container, returns
	// the corresponding geographical coordinate (for the current zoom level).
	containerPointToLatLng: function (point) {
		var layerPoint = this.containerPointToLayerPoint(toPoint(point));
		return this.layerPointToLatLng(layerPoint);
	},

	// @method latLngToContainerPoint(latlng: LatLng): Point
	// Given a geographical coordinate, returns the corresponding pixel coordinate
	// relative to the map container.
	latLngToContainerPoint: function (latlng) {
		return this.layerPointToContainerPoint(this.latLngToLayerPoint(toLatLng(latlng)));
	},

	// @method mouseEventToContainerPoint(ev: MouseEvent): Point
	// Given a MouseEvent object, returns the pixel coordinate relative to the
	// map container where the event took place.
	mouseEventToContainerPoint: function (e) {
		return getMousePosition(e, this._container);
	},

	// @method mouseEventToLayerPoint(ev: MouseEvent): Point
	// Given a MouseEvent object, returns the pixel coordinate relative to
	// the [origin pixel](#map-getpixelorigin) where the event took place.
	mouseEventToLayerPoint: function (e) {
		return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
	},

	// @method mouseEventToLatLng(ev: MouseEvent): LatLng
	// Given a MouseEvent object, returns geographical coordinate where the
	// event took place.
	mouseEventToLatLng: function (e) { // (MouseEvent)
		return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
	},


	// map initialization methods

	_initContainer: function (id) {
		var container = this._container = get(id);

		if (!container) {
			throw new Error('Map container not found.');
		} else if (container._leaflet_id) {
			throw new Error('Map container is already initialized.');
		}

		on(container, 'scroll', this._onScroll, this);
		this._containerId = stamp(container);
	},

	_initLayout: function () {
		var container = this._container;

		this._fadeAnimated = this.options.fadeAnimation && any3d;

		addClass(container, 'leaflet-container' +
			(touch ? ' leaflet-touch' : '') +
			(retina ? ' leaflet-retina' : '') +
			(ielt9 ? ' leaflet-oldie' : '') +
			(safari ? ' leaflet-safari' : '') +
			(this._fadeAnimated ? ' leaflet-fade-anim' : ''));

		var position = getStyle(container, 'position');

		if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
			container.style.position = 'relative';
		}

		this._initPanes();

		if (this._initControlPos) {
			this._initControlPos();
		}
	},

	_initPanes: function () {
		var panes = this._panes = {};
		this._paneRenderers = {};

		// @section
		//
		// Panes are DOM elements used to control the ordering of layers on the map. You
		// can access panes with [`map.getPane`](#map-getpane) or
		// [`map.getPanes`](#map-getpanes) methods. New panes can be created with the
		// [`map.createPane`](#map-createpane) method.
		//
		// Every map has the following default panes that differ only in zIndex.
		//
		// @pane mapPane: HTMLElement = 'auto'
		// Pane that contains all other map panes

		this._mapPane = this.createPane('mapPane', this._container);
		setPosition(this._mapPane, new Point(0, 0));

		// @pane tilePane: HTMLElement = 200
		// Pane for `GridLayer`s and `TileLayer`s
		this.createPane('tilePane');
		// @pane overlayPane: HTMLElement = 400
		// Pane for vectors (`Path`s, like `Polyline`s and `Polygon`s), `ImageOverlay`s and `VideoOverlay`s
		this.createPane('shadowPane');
		// @pane shadowPane: HTMLElement = 500
		// Pane for overlay shadows (e.g. `Marker` shadows)
		this.createPane('overlayPane');
		// @pane markerPane: HTMLElement = 600
		// Pane for `Icon`s of `Marker`s
		this.createPane('markerPane');
		// @pane tooltipPane: HTMLElement = 650
		// Pane for `Tooltip`s.
		this.createPane('tooltipPane');
		// @pane popupPane: HTMLElement = 700
		// Pane for `Popup`s.
		this.createPane('popupPane');

		if (!this.options.markerZoomAnimation) {
			addClass(panes.markerPane, 'leaflet-zoom-hide');
			addClass(panes.shadowPane, 'leaflet-zoom-hide');
		}
	},


	// private methods that modify map state

	// @section Map state change events
	_resetView: function (center, zoom) {
		setPosition(this._mapPane, new Point(0, 0));

		var loading = !this._loaded;
		this._loaded = true;
		zoom = this._limitZoom(zoom);

		this.fire('viewprereset');

		var zoomChanged = this._zoom !== zoom;
		this
			._moveStart(zoomChanged, false)
			._move(center, zoom)
			._moveEnd(zoomChanged);

		// @event viewreset: Event
		// Fired when the map needs to redraw its content (this usually happens
		// on map zoom or load). Very useful for creating custom overlays.
		this.fire('viewreset');

		// @event load: Event
		// Fired when the map is initialized (when its center and zoom are set
		// for the first time).
		if (loading) {
			this.fire('load');
		}
	},

	_moveStart: function (zoomChanged, noMoveStart) {
		// @event zoomstart: Event
		// Fired when the map zoom is about to change (e.g. before zoom animation).
		// @event movestart: Event
		// Fired when the view of the map starts changing (e.g. user starts dragging the map).
		if (zoomChanged) {
			this.fire('zoomstart');
		}
		if (!noMoveStart) {
			this.fire('movestart');
		}
		return this;
	},

	_move: function (center, zoom, data) {
		if (zoom === undefined) {
			zoom = this._zoom;
		}
		var zoomChanged = this._zoom !== zoom;

		this._zoom = zoom;
		this._lastCenter = center;
		this._pixelOrigin = this._getNewPixelOrigin(center);

		// @event zoom: Event
		// Fired repeatedly during any change in zoom level, including zoom
		// and fly animations.
		if (zoomChanged || (data && data.pinch)) {	// Always fire 'zoom' if pinching because #3530
			this.fire('zoom', data);
		}

		// @event move: Event
		// Fired repeatedly during any movement of the map, including pan and
		// fly animations.
		return this.fire('move', data);
	},

	_moveEnd: function (zoomChanged) {
		// @event zoomend: Event
		// Fired when the map has changed, after any animations.
		if (zoomChanged) {
			this.fire('zoomend');
		}

		// @event moveend: Event
		// Fired when the center of the map stops changing (e.g. user stopped
		// dragging the map).
		return this.fire('moveend');
	},

	_stop: function () {
		cancelAnimFrame(this._flyToFrame);
		if (this._panAnim) {
			this._panAnim.stop();
		}
		return this;
	},

	_rawPanBy: function (offset) {
		setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
	},

	_getZoomSpan: function () {
		return this.getMaxZoom() - this.getMinZoom();
	},

	_panInsideMaxBounds: function () {
		if (!this._enforcingBounds) {
			this.panInsideBounds(this.options.maxBounds);
		}
	},

	_checkIfLoaded: function () {
		if (!this._loaded) {
			throw new Error('Set map center and zoom first.');
		}
	},

	// DOM event handling

	// @section Interaction events
	_initEvents: function (remove$$1) {
		this._targets = {};
		this._targets[stamp(this._container)] = this;

		var onOff = remove$$1 ? off : on;

		// @event click: MouseEvent
		// Fired when the user clicks (or taps) the map.
		// @event dblclick: MouseEvent
		// Fired when the user double-clicks (or double-taps) the map.
		// @event mousedown: MouseEvent
		// Fired when the user pushes the mouse button on the map.
		// @event mouseup: MouseEvent
		// Fired when the user releases the mouse button on the map.
		// @event mouseover: MouseEvent
		// Fired when the mouse enters the map.
		// @event mouseout: MouseEvent
		// Fired when the mouse leaves the map.
		// @event mousemove: MouseEvent
		// Fired while the mouse moves over the map.
		// @event contextmenu: MouseEvent
		// Fired when the user pushes the right mouse button on the map, prevents
		// default browser context menu from showing if there are listeners on
		// this event. Also fired on mobile when the user holds a single touch
		// for a second (also called long press).
		// @event keypress: KeyboardEvent
		// Fired when the user presses a key from the keyboard that produces a character value while the map is focused.
		// @event keydown: KeyboardEvent
		// Fired when the user presses a key from the keyboard while the map is focused. Unlike the `keypress` event,
		// the `keydown` event is fired for keys that produce a character value and for keys
		// that do not produce a character value.
		// @event keyup: KeyboardEvent
		// Fired when the user releases a key from the keyboard while the map is focused.
		onOff(this._container, 'click dblclick mousedown mouseup ' +
			'mouseover mouseout mousemove contextmenu keypress keydown keyup', this._handleDOMEvent, this);

		if (this.options.trackResize) {
			onOff(window, 'resize', this._onResize, this);
		}

		if (any3d && this.options.transform3DLimit) {
			(remove$$1 ? this.off : this.on).call(this, 'moveend', this._onMoveEnd);
		}
	},

	_onResize: function () {
		cancelAnimFrame(this._resizeRequest);
		this._resizeRequest = requestAnimFrame(
		        function () { this.invalidateSize({debounceMoveend: true}); }, this);
	},

	_onScroll: function () {
		this._container.scrollTop  = 0;
		this._container.scrollLeft = 0;
	},

	_onMoveEnd: function () {
		var pos = this._getMapPanePos();
		if (Math.max(Math.abs(pos.x), Math.abs(pos.y)) >= this.options.transform3DLimit) {
			// https://bugzilla.mozilla.org/show_bug.cgi?id=1203873 but Webkit also have
			// a pixel offset on very high values, see: http://jsfiddle.net/dg6r5hhb/
			this._resetView(this.getCenter(), this.getZoom());
		}
	},

	_findEventTargets: function (e, type) {
		var targets = [],
		    target,
		    isHover = type === 'mouseout' || type === 'mouseover',
		    src = e.target || e.srcElement,
		    dragging = false;

		while (src) {
			target = this._targets[stamp(src)];
			if (target && (type === 'click' || type === 'preclick') && !e._simulated && this._draggableMoved(target)) {
				// Prevent firing click after you just dragged an object.
				dragging = true;
				break;
			}
			if (target && target.listens(type, true)) {
				if (isHover && !isExternalTarget(src, e)) { break; }
				targets.push(target);
				if (isHover) { break; }
			}
			if (src === this._container) { break; }
			src = src.parentNode;
		}
		if (!targets.length && !dragging && !isHover && isExternalTarget(src, e)) {
			targets = [this];
		}
		return targets;
	},

	_handleDOMEvent: function (e) {
		if (!this._loaded || skipped(e)) { return; }

		var type = e.type;

		if (type === 'mousedown' || type === 'keypress' || type === 'keyup' || type === 'keydown') {
			// prevents outline when clicking on keyboard-focusable element
			preventOutline(e.target || e.srcElement);
		}

		this._fireDOMEvent(e, type);
	},

	_mouseEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'],

	_fireDOMEvent: function (e, type, targets) {

		if (e.type === 'click') {
			// Fire a synthetic 'preclick' event which propagates up (mainly for closing popups).
			// @event preclick: MouseEvent
			// Fired before mouse click on the map (sometimes useful when you
			// want something to happen on click before any existing click
			// handlers start running).
			var synth = extend({}, e);
			synth.type = 'preclick';
			this._fireDOMEvent(synth, synth.type, targets);
		}

		if (e._stopped) { return; }

		// Find the layer the event is propagating from and its parents.
		targets = (targets || []).concat(this._findEventTargets(e, type));

		if (!targets.length) { return; }

		var target = targets[0];
		if (type === 'contextmenu' && target.listens(type, true)) {
			preventDefault(e);
		}

		var data = {
			originalEvent: e
		};

		if (e.type !== 'keypress' && e.type !== 'keydown' && e.type !== 'keyup') {
			var isMarker = target.getLatLng && (!target._radius || target._radius <= 10);
			data.containerPoint = isMarker ?
				this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e);
			data.layerPoint = this.containerPointToLayerPoint(data.containerPoint);
			data.latlng = isMarker ? target.getLatLng() : this.layerPointToLatLng(data.layerPoint);
		}

		for (var i = 0; i < targets.length; i++) {
			targets[i].fire(type, data, true);
			if (data.originalEvent._stopped ||
				(targets[i].options.bubblingMouseEvents === false && indexOf(this._mouseEvents, type) !== -1)) { return; }
		}
	},

	_draggableMoved: function (obj) {
		obj = obj.dragging && obj.dragging.enabled() ? obj : this;
		return (obj.dragging && obj.dragging.moved()) || (this.boxZoom && this.boxZoom.moved());
	},

	_clearHandlers: function () {
		for (var i = 0, len = this._handlers.length; i < len; i++) {
			this._handlers[i].disable();
		}
	},

	// @section Other Methods

	// @method whenReady(fn: Function, context?: Object): this
	// Runs the given function `fn` when the map gets initialized with
	// a view (center and zoom) and at least one layer, or immediately
	// if it's already initialized, optionally passing a function context.
	whenReady: function (callback, context) {
		if (this._loaded) {
			callback.call(context || this, {target: this});
		} else {
			this.on('load', callback, context);
		}
		return this;
	},


	// private methods for getting map state

	_getMapPanePos: function () {
		return getPosition(this._mapPane) || new Point(0, 0);
	},

	_moved: function () {
		var pos = this._getMapPanePos();
		return pos && !pos.equals([0, 0]);
	},

	_getTopLeftPoint: function (center, zoom) {
		var pixelOrigin = center && zoom !== undefined ?
			this._getNewPixelOrigin(center, zoom) :
			this.getPixelOrigin();
		return pixelOrigin.subtract(this._getMapPanePos());
	},

	_getNewPixelOrigin: function (center, zoom) {
		var viewHalf = this.getSize()._divideBy(2);
		return this.project(center, zoom)._subtract(viewHalf)._add(this._getMapPanePos())._round();
	},

	_latLngToNewLayerPoint: function (latlng, zoom, center) {
		var topLeft = this._getNewPixelOrigin(center, zoom);
		return this.project(latlng, zoom)._subtract(topLeft);
	},

	_latLngBoundsToNewLayerBounds: function (latLngBounds, zoom, center) {
		var topLeft = this._getNewPixelOrigin(center, zoom);
		return toBounds([
			this.project(latLngBounds.getSouthWest(), zoom)._subtract(topLeft),
			this.project(latLngBounds.getNorthWest(), zoom)._subtract(topLeft),
			this.project(latLngBounds.getSouthEast(), zoom)._subtract(topLeft),
			this.project(latLngBounds.getNorthEast(), zoom)._subtract(topLeft)
		]);
	},

	// layer point of the current center
	_getCenterLayerPoint: function () {
		return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
	},

	// offset of the specified place to the current center in pixels
	_getCenterOffset: function (latlng) {
		return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
	},

	// adjust center for view to get inside bounds
	_limitCenter: function (center, zoom, bounds) {

		if (!bounds) { return center; }

		var centerPoint = this.project(center, zoom),
		    viewHalf = this.getSize().divideBy(2),
		    viewBounds = new Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
		    offset = this._getBoundsOffset(viewBounds, bounds, zoom);

		// If offset is less than a pixel, ignore.
		// This prevents unstable projections from getting into
		// an infinite loop of tiny offsets.
		if (offset.round().equals([0, 0])) {
			return center;
		}

		return this.unproject(centerPoint.add(offset), zoom);
	},

	// adjust offset for view to get inside bounds
	_limitOffset: function (offset, bounds) {
		if (!bounds) { return offset; }

		var viewBounds = this.getPixelBounds(),
		    newBounds = new Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));

		return offset.add(this._getBoundsOffset(newBounds, bounds));
	},

	// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
	_getBoundsOffset: function (pxBounds, maxBounds, zoom) {
		var projectedMaxBounds = toBounds(
		        this.project(maxBounds.getNorthEast(), zoom),
		        this.project(maxBounds.getSouthWest(), zoom)
		    ),
		    minOffset = projectedMaxBounds.min.subtract(pxBounds.min),
		    maxOffset = projectedMaxBounds.max.subtract(pxBounds.max),

		    dx = this._rebound(minOffset.x, -maxOffset.x),
		    dy = this._rebound(minOffset.y, -maxOffset.y);

		return new Point(dx, dy);
	},

	_rebound: function (left, right) {
		return left + right > 0 ?
			Math.round(left - right) / 2 :
			Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
	},

	_limitZoom: function (zoom) {
		var min = this.getMinZoom(),
		    max = this.getMaxZoom(),
		    snap = any3d ? this.options.zoomSnap : 1;
		if (snap) {
			zoom = Math.round(zoom / snap) * snap;
		}
		return Math.max(min, Math.min(max, zoom));
	},

	_onPanTransitionStep: function () {
		this.fire('move');
	},

	_onPanTransitionEnd: function () {
		removeClass(this._mapPane, 'leaflet-pan-anim');
		this.fire('moveend');
	},

	_tryAnimatedPan: function (center, options) {
		// difference between the new and current centers in pixels
		var offset = this._getCenterOffset(center)._trunc();

		// don't animate too far unless animate: true specified in options
		if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }

		this.panBy(offset, options);

		return true;
	},

	_createAnimProxy: function () {

		var proxy = this._proxy = create$1('div', 'leaflet-proxy leaflet-zoom-animated');
		this._panes.mapPane.appendChild(proxy);

		this.on('zoomanim', function (e) {
			var prop = TRANSFORM,
			    transform = this._proxy.style[prop];

			setTransform(this._proxy, this.project(e.center, e.zoom), this.getZoomScale(e.zoom, 1));

			// workaround for case when transform is the same and so transitionend event is not fired
			if (transform === this._proxy.style[prop] && this._animatingZoom) {
				this._onZoomTransitionEnd();
			}
		}, this);

		this.on('load moveend', function () {
			var c = this.getCenter(),
			    z = this.getZoom();
			setTransform(this._proxy, this.project(c, z), this.getZoomScale(z, 1));
		}, this);

		this._on('unload', this._destroyAnimProxy, this);
	},

	_destroyAnimProxy: function () {
		remove(this._proxy);
		delete this._proxy;
	},

	_catchTransitionEnd: function (e) {
		if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
			this._onZoomTransitionEnd();
		}
	},

	_nothingToAnimate: function () {
		return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
	},

	_tryAnimatedZoom: function (center, zoom, options) {

		if (this._animatingZoom) { return true; }

		options = options || {};

		// don't animate if disabled, not supported or zoom difference is too large
		if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
		        Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

		// offset is the pixel coords of the zoom origin relative to the current center
		var scale = this.getZoomScale(zoom),
		    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale);

		// don't animate if the zoom origin isn't within one screen from the current center, unless forced
		if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

		requestAnimFrame(function () {
			this
			    ._moveStart(true, false)
			    ._animateZoom(center, zoom, true);
		}, this);

		return true;
	},

	_animateZoom: function (center, zoom, startAnim, noUpdate) {
		if (!this._mapPane) { return; }

		if (startAnim) {
			this._animatingZoom = true;

			// remember what center/zoom to set after animation
			this._animateToCenter = center;
			this._animateToZoom = zoom;

			addClass(this._mapPane, 'leaflet-zoom-anim');
		}

		// @event zoomanim: ZoomAnimEvent
		// Fired at least once per zoom animation. For continuous zoom, like pinch zooming, fired once per frame during zoom.
		this.fire('zoomanim', {
			center: center,
			zoom: zoom,
			noUpdate: noUpdate
		});

		// Work around webkit not firing 'transitionend', see https://github.com/Leaflet/Leaflet/issues/3689, 2693
		setTimeout(bind(this._onZoomTransitionEnd, this), 250);
	},

	_onZoomTransitionEnd: function () {
		if (!this._animatingZoom) { return; }

		if (this._mapPane) {
			removeClass(this._mapPane, 'leaflet-zoom-anim');
		}

		this._animatingZoom = false;

		this._move(this._animateToCenter, this._animateToZoom);

		// This anim frame should prevent an obscure iOS webkit tile loading race condition.
		requestAnimFrame(function () {
			this._moveEnd(true);
		}, this);
	}
});

// @section

// @factory L.map(id: String, options?: Map options)
// Instantiates a map object given the DOM ID of a `<div>` element
// and optionally an object literal with `Map options`.
//
// @alternative
// @factory L.map(el: HTMLElement, options?: Map options)
// Instantiates a map object given an instance of a `<div>` HTML element
// and optionally an object literal with `Map options`.
function createMap(id, options) {
	return new Map(id, options);
}

/*
 * @class Control
 * @aka L.Control
 * @inherits Class
 *
 * L.Control is a base class for implementing map controls. Handles positioning.
 * All other controls extend from this class.
 */

var Control = Class.extend({
	// @section
	// @aka Control options
	options: {
		// @option position: String = 'topright'
		// The position of the control (one of the map corners). Possible values are `'topleft'`,
		// `'topright'`, `'bottomleft'` or `'bottomright'`
		position: 'topright'
	},

	initialize: function (options) {
		setOptions(this, options);
	},

	/* @section
	 * Classes extending L.Control will inherit the following methods:
	 *
	 * @method getPosition: string
	 * Returns the position of the control.
	 */
	getPosition: function () {
		return this.options.position;
	},

	// @method setPosition(position: string): this
	// Sets the position of the control.
	setPosition: function (position) {
		var map = this._map;

		if (map) {
			map.removeControl(this);
		}

		this.options.position = position;

		if (map) {
			map.addControl(this);
		}

		return this;
	},

	// @method getContainer: HTMLElement
	// Returns the HTMLElement that contains the control.
	getContainer: function () {
		return this._container;
	},

	// @method addTo(map: Map): this
	// Adds the control to the given map.
	addTo: function (map) {
		this.remove();
		this._map = map;

		var container = this._container = this.onAdd(map),
		    pos = this.getPosition(),
		    corner = map._controlCorners[pos];

		addClass(container, 'leaflet-control');

		if (pos.indexOf('bottom') !== -1) {
			corner.insertBefore(container, corner.firstChild);
		} else {
			corner.appendChild(container);
		}

		this._map.on('unload', this.remove, this);

		return this;
	},

	// @method remove: this
	// Removes the control from the map it is currently active on.
	remove: function () {
		if (!this._map) {
			return this;
		}

		remove(this._container);

		if (this.onRemove) {
			this.onRemove(this._map);
		}

		this._map.off('unload', this.remove, this);
		this._map = null;

		return this;
	},

	_refocusOnMap: function (e) {
		// if map exists and event is not a keyboard event
		if (this._map && e && e.screenX > 0 && e.screenY > 0) {
			this._map.getContainer().focus();
		}
	}
});

var control = function (options) {
	return new Control(options);
};

/* @section Extension methods
 * @uninheritable
 *
 * Every control should extend from `L.Control` and (re-)implement the following methods.
 *
 * @method onAdd(map: Map): HTMLElement
 * Should return the container DOM element for the control and add listeners on relevant map events. Called on [`control.addTo(map)`](#control-addTo).
 *
 * @method onRemove(map: Map)
 * Optional method. Should contain all clean up code that removes the listeners previously added in [`onAdd`](#control-onadd). Called on [`control.remove()`](#control-remove).
 */

/* @namespace Map
 * @section Methods for Layers and Controls
 */
Map.include({
	// @method addControl(control: Control): this
	// Adds the given control to the map
	addControl: function (control) {
		control.addTo(this);
		return this;
	},

	// @method removeControl(control: Control): this
	// Removes the given control from the map
	removeControl: function (control) {
		control.remove();
		return this;
	},

	_initControlPos: function () {
		var corners = this._controlCorners = {},
		    l = 'leaflet-',
		    container = this._controlContainer =
		            create$1('div', l + 'control-container', this._container);

		function createCorner(vSide, hSide) {
			var className = l + vSide + ' ' + l + hSide;

			corners[vSide + hSide] = create$1('div', className, container);
		}

		createCorner('top', 'left');
		createCorner('top', 'right');
		createCorner('bottom', 'left');
		createCorner('bottom', 'right');
	},

	_clearControlPos: function () {
		for (var i in this._controlCorners) {
			remove(this._controlCorners[i]);
		}
		remove(this._controlContainer);
		delete this._controlCorners;
		delete this._controlContainer;
	}
});

/*
 * @class Control.Layers
 * @aka L.Control.Layers
 * @inherits Control
 *
 * The layers control gives users the ability to switch between different base layers and switch overlays on/off (check out the [detailed example](http://leafletjs.com/examples/layers-control/)). Extends `Control`.
 *
 * @example
 *
 * ```js
 * var baseLayers = {
 * 	"Mapbox": mapbox,
 * 	"OpenStreetMap": osm
 * };
 *
 * var overlays = {
 * 	"Marker": marker,
 * 	"Roads": roadsLayer
 * };
 *
 * L.control.layers(baseLayers, overlays).addTo(map);
 * ```
 *
 * The `baseLayers` and `overlays` parameters are object literals with layer names as keys and `Layer` objects as values:
 *
 * ```js
 * {
 *     "<someName1>": layer1,
 *     "<someName2>": layer2
 * }
 * ```
 *
 * The layer names can contain HTML, which allows you to add additional styling to the items:
 *
 * ```js
 * {"<img src='my-layer-icon' /> <span class='my-layer-item'>My Layer</span>": myLayer}
 * ```
 */

var Layers = Control.extend({
	// @section
	// @aka Control.Layers options
	options: {
		// @option collapsed: Boolean = true
		// If `true`, the control will be collapsed into an icon and expanded on mouse hover or touch.
		collapsed: true,
		position: 'topright',

		// @option autoZIndex: Boolean = true
		// If `true`, the control will assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off.
		autoZIndex: true,

		// @option hideSingleBase: Boolean = false
		// If `true`, the base layers in the control will be hidden when there is only one.
		hideSingleBase: false,

		// @option sortLayers: Boolean = false
		// Whether to sort the layers. When `false`, layers will keep the order
		// in which they were added to the control.
		sortLayers: false,

		// @option sortFunction: Function = *
		// A [compare function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
		// that will be used for sorting the layers, when `sortLayers` is `true`.
		// The function receives both the `L.Layer` instances and their names, as in
		// `sortFunction(layerA, layerB, nameA, nameB)`.
		// By default, it sorts layers alphabetically by their name.
		sortFunction: function (layerA, layerB, nameA, nameB) {
			return nameA < nameB ? -1 : (nameB < nameA ? 1 : 0);
		}
	},

	initialize: function (baseLayers, overlays, options) {
		setOptions(this, options);

		this._layerControlInputs = [];
		this._layers = [];
		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in baseLayers) {
			this._addLayer(baseLayers[i], i);
		}

		for (i in overlays) {
			this._addLayer(overlays[i], i, true);
		}
	},

	onAdd: function (map) {
		this._initLayout();
		this._update();

		this._map = map;
		map.on('zoomend', this._checkDisabledLayers, this);

		for (var i = 0; i < this._layers.length; i++) {
			this._layers[i].layer.on('add remove', this._onLayerChange, this);
		}

		return this._container;
	},

	addTo: function (map) {
		Control.prototype.addTo.call(this, map);
		// Trigger expand after Layers Control has been inserted into DOM so that is now has an actual height.
		return this._expandIfNotCollapsed();
	},

	onRemove: function () {
		this._map.off('zoomend', this._checkDisabledLayers, this);

		for (var i = 0; i < this._layers.length; i++) {
			this._layers[i].layer.off('add remove', this._onLayerChange, this);
		}
	},

	// @method addBaseLayer(layer: Layer, name: String): this
	// Adds a base layer (radio button entry) with the given name to the control.
	addBaseLayer: function (layer, name) {
		this._addLayer(layer, name);
		return (this._map) ? this._update() : this;
	},

	// @method addOverlay(layer: Layer, name: String): this
	// Adds an overlay (checkbox entry) with the given name to the control.
	addOverlay: function (layer, name) {
		this._addLayer(layer, name, true);
		return (this._map) ? this._update() : this;
	},

	// @method removeLayer(layer: Layer): this
	// Remove the given layer from the control.
	removeLayer: function (layer) {
		layer.off('add remove', this._onLayerChange, this);

		var obj = this._getLayer(stamp(layer));
		if (obj) {
			this._layers.splice(this._layers.indexOf(obj), 1);
		}
		return (this._map) ? this._update() : this;
	},

	// @method expand(): this
	// Expand the control container if collapsed.
	expand: function () {
		addClass(this._container, 'leaflet-control-layers-expanded');
		this._section.style.height = null;
		var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
		if (acceptableHeight < this._section.clientHeight) {
			addClass(this._section, 'leaflet-control-layers-scrollbar');
			this._section.style.height = acceptableHeight + 'px';
		} else {
			removeClass(this._section, 'leaflet-control-layers-scrollbar');
		}
		this._checkDisabledLayers();
		return this;
	},

	// @method collapse(): this
	// Collapse the control container if expanded.
	collapse: function () {
		removeClass(this._container, 'leaflet-control-layers-expanded');
		return this;
	},

	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = create$1('div', className),
		    collapsed = this.options.collapsed;

		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		disableClickPropagation(container);
		disableScrollPropagation(container);

		var section = this._section = create$1('section', className + '-list');

		if (collapsed) {
			this._map.on('click', this.collapse, this);

			if (!android) {
				on(container, {
					mouseenter: this.expand,
					mouseleave: this.collapse
				}, this);
			}
		}

		var link = this._layersLink = create$1('a', className + '-toggle', container);
		link.href = '#';
		link.title = 'Layers';

		if (touch) {
			on(link, 'click', stop);
			on(link, 'click', this.expand, this);
		} else {
			on(link, 'focus', this.expand, this);
		}

		if (!collapsed) {
			this.expand();
		}

		this._baseLayersList = create$1('div', className + '-base', section);
		this._separator = create$1('div', className + '-separator', section);
		this._overlaysList = create$1('div', className + '-overlays', section);

		container.appendChild(section);
	},

	_getLayer: function (id) {
		for (var i = 0; i < this._layers.length; i++) {

			if (this._layers[i] && stamp(this._layers[i].layer) === id) {
				return this._layers[i];
			}
		}
	},

	_addLayer: function (layer, name, overlay) {
		if (this._map) {
			layer.on('add remove', this._onLayerChange, this);
		}

		this._layers.push({
			layer: layer,
			name: name,
			overlay: overlay
		});

		if (this.options.sortLayers) {
			this._layers.sort(bind(function (a, b) {
				return this.options.sortFunction(a.layer, b.layer, a.name, b.name);
			}, this));
		}

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}

		this._expandIfNotCollapsed();
	},

	_update: function () {
		if (!this._container) { return this; }

		empty(this._baseLayersList);
		empty(this._overlaysList);

		this._layerControlInputs = [];
		var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;

		for (i = 0; i < this._layers.length; i++) {
			obj = this._layers[i];
			this._addItem(obj);
			overlaysPresent = overlaysPresent || obj.overlay;
			baseLayersPresent = baseLayersPresent || !obj.overlay;
			baseLayersCount += !obj.overlay ? 1 : 0;
		}

		// Hide base layers section if there's only one layer.
		if (this.options.hideSingleBase) {
			baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
			this._baseLayersList.style.display = baseLayersPresent ? '' : 'none';
		}

		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';

		return this;
	},

	_onLayerChange: function (e) {
		if (!this._handlingClick) {
			this._update();
		}

		var obj = this._getLayer(stamp(e.target));

		// @namespace Map
		// @section Layer events
		// @event baselayerchange: LayersControlEvent
		// Fired when the base layer is changed through the [layer control](#control-layers).
		// @event overlayadd: LayersControlEvent
		// Fired when an overlay is selected through the [layer control](#control-layers).
		// @event overlayremove: LayersControlEvent
		// Fired when an overlay is deselected through the [layer control](#control-layers).
		// @namespace Control.Layers
		var type = obj.overlay ?
			(e.type === 'add' ? 'overlayadd' : 'overlayremove') :
			(e.type === 'add' ? 'baselayerchange' : null);

		if (type) {
			this._map.fire(type, obj);
		}
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement: function (name, checked) {

		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' +
				name + '"' + (checked ? ' checked="checked"' : '') + '/>';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_addItem: function (obj) {
		var label = document.createElement('label'),
		    checked = this._map.hasLayer(obj.layer),
		    input;

		if (obj.overlay) {
			input = document.createElement('input');
			input.type = 'checkbox';
			input.className = 'leaflet-control-layers-selector';
			input.defaultChecked = checked;
		} else {
			input = this._createRadioElement('leaflet-base-layers_' + stamp(this), checked);
		}

		this._layerControlInputs.push(input);
		input.layerId = stamp(obj.layer);

		on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;

		// Helps from preventing layer control flicker when checkboxes are disabled
		// https://github.com/Leaflet/Leaflet/issues/2771
		var holder = document.createElement('div');

		label.appendChild(holder);
		holder.appendChild(input);
		holder.appendChild(name);

		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
		container.appendChild(label);

		this._checkDisabledLayers();
		return label;
	},

	_onInputClick: function () {
		var inputs = this._layerControlInputs,
		    input, layer;
		var addedLayers = [],
		    removedLayers = [];

		this._handlingClick = true;

		for (var i = inputs.length - 1; i >= 0; i--) {
			input = inputs[i];
			layer = this._getLayer(input.layerId).layer;

			if (input.checked) {
				addedLayers.push(layer);
			} else if (!input.checked) {
				removedLayers.push(layer);
			}
		}

		// Bugfix issue 2318: Should remove all old layers before readding new ones
		for (i = 0; i < removedLayers.length; i++) {
			if (this._map.hasLayer(removedLayers[i])) {
				this._map.removeLayer(removedLayers[i]);
			}
		}
		for (i = 0; i < addedLayers.length; i++) {
			if (!this._map.hasLayer(addedLayers[i])) {
				this._map.addLayer(addedLayers[i]);
			}
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},

	_checkDisabledLayers: function () {
		var inputs = this._layerControlInputs,
		    input,
		    layer,
		    zoom = this._map.getZoom();

		for (var i = inputs.length - 1; i >= 0; i--) {
			input = inputs[i];
			layer = this._getLayer(input.layerId).layer;
			input.disabled = (layer.options.minZoom !== undefined && zoom < layer.options.minZoom) ||
			                 (layer.options.maxZoom !== undefined && zoom > layer.options.maxZoom);

		}
	},

	_expandIfNotCollapsed: function () {
		if (this._map && !this.options.collapsed) {
			this.expand();
		}
		return this;
	},

	_expand: function () {
		// Backward compatibility, remove me in 1.1.
		return this.expand();
	},

	_collapse: function () {
		// Backward compatibility, remove me in 1.1.
		return this.collapse();
	}

});


// @factory L.control.layers(baselayers?: Object, overlays?: Object, options?: Control.Layers options)
// Creates an attribution control with the given layers. Base layers will be switched with radio buttons, while overlays will be switched with checkboxes. Note that all base layers should be passed in the base layers object, but only one should be added to the map during map instantiation.
var layers = function (baseLayers, overlays, options) {
	return new Layers(baseLayers, overlays, options);
};

/*
 * @class Control.Zoom
 * @aka L.Control.Zoom
 * @inherits Control
 *
 * A basic zoom control with two buttons (zoom in and zoom out). It is put on the map by default unless you set its [`zoomControl` option](#map-zoomcontrol) to `false`. Extends `Control`.
 */

var Zoom = Control.extend({
	// @section
	// @aka Control.Zoom options
	options: {
		position: 'topleft',

		// @option zoomInText: String = '+'
		// The text set on the 'zoom in' button.
		zoomInText: '+',

		// @option zoomInTitle: String = 'Zoom in'
		// The title set on the 'zoom in' button.
		zoomInTitle: 'Zoom in',

		// @option zoomOutText: String = '&#x2212;'
		// The text set on the 'zoom out' button.
		zoomOutText: '&#x2212;',

		// @option zoomOutTitle: String = 'Zoom out'
		// The title set on the 'zoom out' button.
		zoomOutTitle: 'Zoom out'
	},

	onAdd: function (map) {
		var zoomName = 'leaflet-control-zoom',
		    container = create$1('div', zoomName + ' leaflet-bar'),
		    options = this.options;

		this._zoomInButton  = this._createButton(options.zoomInText, options.zoomInTitle,
		        zoomName + '-in',  container, this._zoomIn);
		this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
		        zoomName + '-out', container, this._zoomOut);

		this._updateDisabled();
		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

		return container;
	},

	onRemove: function (map) {
		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
	},

	disable: function () {
		this._disabled = true;
		this._updateDisabled();
		return this;
	},

	enable: function () {
		this._disabled = false;
		this._updateDisabled();
		return this;
	},

	_zoomIn: function (e) {
		if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
			this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
		}
	},

	_zoomOut: function (e) {
		if (!this._disabled && this._map._zoom > this._map.getMinZoom()) {
			this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
		}
	},

	_createButton: function (html, title, className, container, fn) {
		var link = create$1('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		/*
		 * Will force screen readers like VoiceOver to read this as "Zoom in - button"
		 */
		link.setAttribute('role', 'button');
		link.setAttribute('aria-label', title);

		disableClickPropagation(link);
		on(link, 'click', stop);
		on(link, 'click', fn, this);
		on(link, 'click', this._refocusOnMap, this);

		return link;
	},

	_updateDisabled: function () {
		var map = this._map,
		    className = 'leaflet-disabled';

		removeClass(this._zoomInButton, className);
		removeClass(this._zoomOutButton, className);

		if (this._disabled || map._zoom === map.getMinZoom()) {
			addClass(this._zoomOutButton, className);
		}
		if (this._disabled || map._zoom === map.getMaxZoom()) {
			addClass(this._zoomInButton, className);
		}
	}
});

// @namespace Map
// @section Control options
// @option zoomControl: Boolean = true
// Whether a [zoom control](#control-zoom) is added to the map by default.
Map.mergeOptions({
	zoomControl: true
});

Map.addInitHook(function () {
	if (this.options.zoomControl) {
		// @section Controls
		// @property zoomControl: Control.Zoom
		// The default zoom control (only available if the
		// [`zoomControl` option](#map-zoomcontrol) was `true` when creating the map).
		this.zoomControl = new Zoom();
		this.addControl(this.zoomControl);
	}
});

// @namespace Control.Zoom
// @factory L.control.zoom(options: Control.Zoom options)
// Creates a zoom control
var zoom = function (options) {
	return new Zoom(options);
};

/*
 * @class Control.Scale
 * @aka L.Control.Scale
 * @inherits Control
 *
 * A simple scale control that shows the scale of the current center of screen in metric (m/km) and imperial (mi/ft) systems. Extends `Control`.
 *
 * @example
 *
 * ```js
 * L.control.scale().addTo(map);
 * ```
 */

var Scale = Control.extend({
	// @section
	// @aka Control.Scale options
	options: {
		position: 'bottomleft',

		// @option maxWidth: Number = 100
		// Maximum width of the control in pixels. The width is set dynamically to show round values (e.g. 100, 200, 500).
		maxWidth: 100,

		// @option metric: Boolean = True
		// Whether to show the metric scale line (m/km).
		metric: true,

		// @option imperial: Boolean = True
		// Whether to show the imperial scale line (mi/ft).
		imperial: true

		// @option updateWhenIdle: Boolean = false
		// If `true`, the control is updated on [`moveend`](#map-moveend), otherwise it's always up-to-date (updated on [`move`](#map-move)).
	},

	onAdd: function (map) {
		var className = 'leaflet-control-scale',
		    container = create$1('div', className),
		    options = this.options;

		this._addScales(options, className + '-line', container);

		map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
		map.whenReady(this._update, this);

		return container;
	},

	onRemove: function (map) {
		map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
	},

	_addScales: function (options, className, container) {
		if (options.metric) {
			this._mScale = create$1('div', className, container);
		}
		if (options.imperial) {
			this._iScale = create$1('div', className, container);
		}
	},

	_update: function () {
		var map = this._map,
		    y = map.getSize().y / 2;

		var maxMeters = map.distance(
			map.containerPointToLatLng([0, y]),
			map.containerPointToLatLng([this.options.maxWidth, y]));

		this._updateScales(maxMeters);
	},

	_updateScales: function (maxMeters) {
		if (this.options.metric && maxMeters) {
			this._updateMetric(maxMeters);
		}
		if (this.options.imperial && maxMeters) {
			this._updateImperial(maxMeters);
		}
	},

	_updateMetric: function (maxMeters) {
		var meters = this._getRoundNum(maxMeters),
		    label = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';

		this._updateScale(this._mScale, label, meters / maxMeters);
	},

	_updateImperial: function (maxMeters) {
		var maxFeet = maxMeters * 3.2808399,
		    maxMiles, miles, feet;

		if (maxFeet > 5280) {
			maxMiles = maxFeet / 5280;
			miles = this._getRoundNum(maxMiles);
			this._updateScale(this._iScale, miles + ' mi', miles / maxMiles);

		} else {
			feet = this._getRoundNum(maxFeet);
			this._updateScale(this._iScale, feet + ' ft', feet / maxFeet);
		}
	},

	_updateScale: function (scale, text, ratio) {
		scale.style.width = Math.round(this.options.maxWidth * ratio) + 'px';
		scale.innerHTML = text;
	},

	_getRoundNum: function (num) {
		var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
		    d = num / pow10;

		d = d >= 10 ? 10 :
		    d >= 5 ? 5 :
		    d >= 3 ? 3 :
		    d >= 2 ? 2 : 1;

		return pow10 * d;
	}
});


// @factory L.control.scale(options?: Control.Scale options)
// Creates an scale control with the given options.
var scale = function (options) {
	return new Scale(options);
};

/*
 * @class Control.Attribution
 * @aka L.Control.Attribution
 * @inherits Control
 *
 * The attribution control allows you to display attribution data in a small text box on a map. It is put on the map by default unless you set its [`attributionControl` option](#map-attributioncontrol) to `false`, and it fetches attribution texts from layers with the [`getAttribution` method](#layer-getattribution) automatically. Extends Control.
 */

var Attribution = Control.extend({
	// @section
	// @aka Control.Attribution options
	options: {
		position: 'bottomright',

		// @option prefix: String = 'Leaflet'
		// The HTML text shown before the attributions. Pass `false` to disable.
		prefix: '<a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
	},

	initialize: function (options) {
		setOptions(this, options);

		this._attributions = {};
	},

	onAdd: function (map) {
		map.attributionControl = this;
		this._container = create$1('div', 'leaflet-control-attribution');
		disableClickPropagation(this._container);

		// TODO ugly, refactor
		for (var i in map._layers) {
			if (map._layers[i].getAttribution) {
				this.addAttribution(map._layers[i].getAttribution());
			}
		}

		this._update();

		return this._container;
	},

	// @method setPrefix(prefix: String): this
	// Sets the text before the attributions.
	setPrefix: function (prefix) {
		this.options.prefix = prefix;
		this._update();
		return this;
	},

	// @method addAttribution(text: String): this
	// Adds an attribution text (e.g. `'Vector data &copy; Mapbox'`).
	addAttribution: function (text) {
		if (!text) { return this; }

		if (!this._attributions[text]) {
			this._attributions[text] = 0;
		}
		this._attributions[text]++;

		this._update();

		return this;
	},

	// @method removeAttribution(text: String): this
	// Removes an attribution text.
	removeAttribution: function (text) {
		if (!text) { return this; }

		if (this._attributions[text]) {
			this._attributions[text]--;
			this._update();
		}

		return this;
	},

	_update: function () {
		if (!this._map) { return; }

		var attribs = [];

		for (var i in this._attributions) {
			if (this._attributions[i]) {
				attribs.push(i);
			}
		}

		var prefixAndAttribs = [];

		if (this.options.prefix) {
			prefixAndAttribs.push(this.options.prefix);
		}
		if (attribs.length) {
			prefixAndAttribs.push(attribs.join(', '));
		}

		this._container.innerHTML = prefixAndAttribs.join(' | ');
	}
});

// @namespace Map
// @section Control options
// @option attributionControl: Boolean = true
// Whether a [attribution control](#control-attribution) is added to the map by default.
Map.mergeOptions({
	attributionControl: true
});

Map.addInitHook(function () {
	if (this.options.attributionControl) {
		new Attribution().addTo(this);
	}
});

// @namespace Control.Attribution
// @factory L.control.attribution(options: Control.Attribution options)
// Creates an attribution control.
var attribution = function (options) {
	return new Attribution(options);
};

Control.Layers = Layers;
Control.Zoom = Zoom;
Control.Scale = Scale;
Control.Attribution = Attribution;

control.layers = layers;
control.zoom = zoom;
control.scale = scale;
control.attribution = attribution;

/*
	L.Handler is a base class for handler classes that are used internally to inject
	interaction features like dragging to classes like Map and Marker.
*/

// @class Handler
// @aka L.Handler
// Abstract class for map interaction handlers

var Handler = Class.extend({
	initialize: function (map) {
		this._map = map;
	},

	// @method enable(): this
	// Enables the handler
	enable: function () {
		if (this._enabled) { return this; }

		this._enabled = true;
		this.addHooks();
		return this;
	},

	// @method disable(): this
	// Disables the handler
	disable: function () {
		if (!this._enabled) { return this; }

		this._enabled = false;
		this.removeHooks();
		return this;
	},

	// @method enabled(): Boolean
	// Returns `true` if the handler is enabled
	enabled: function () {
		return !!this._enabled;
	}

	// @section Extension methods
	// Classes inheriting from `Handler` must implement the two following methods:
	// @method addHooks()
	// Called when the handler is enabled, should add event hooks.
	// @method removeHooks()
	// Called when the handler is disabled, should remove the event hooks added previously.
});

// @section There is static function which can be called without instantiating L.Handler:
// @function addTo(map: Map, name: String): this
// Adds a new Handler to the given map with the given name.
Handler.addTo = function (map, name) {
	map.addHandler(name, this);
	return this;
};

var Mixin = {Events: Events};

/*
 * @class Draggable
 * @aka L.Draggable
 * @inherits Evented
 *
 * A class for making DOM elements draggable (including touch support).
 * Used internally for map and marker dragging. Only works for elements
 * that were positioned with [`L.DomUtil.setPosition`](#domutil-setposition).
 *
 * @example
 * ```js
 * var draggable = new L.Draggable(elementToDrag);
 * draggable.enable();
 * ```
 */

var START = touch ? 'touchstart mousedown' : 'mousedown';
var END = {
	mousedown: 'mouseup',
	touchstart: 'touchend',
	pointerdown: 'touchend',
	MSPointerDown: 'touchend'
};
var MOVE = {
	mousedown: 'mousemove',
	touchstart: 'touchmove',
	pointerdown: 'touchmove',
	MSPointerDown: 'touchmove'
};


var Draggable = Evented.extend({

	options: {
		// @section
		// @aka Draggable options
		// @option clickTolerance: Number = 3
		// The max number of pixels a user can shift the mouse pointer during a click
		// for it to be considered a valid click (as opposed to a mouse drag).
		clickTolerance: 3
	},

	// @constructor L.Draggable(el: HTMLElement, dragHandle?: HTMLElement, preventOutline?: Boolean, options?: Draggable options)
	// Creates a `Draggable` object for moving `el` when you start dragging the `dragHandle` element (equals `el` itself by default).
	initialize: function (element, dragStartTarget, preventOutline$$1, options) {
		setOptions(this, options);

		this._element = element;
		this._dragStartTarget = dragStartTarget || element;
		this._preventOutline = preventOutline$$1;
	},

	// @method enable()
	// Enables the dragging ability
	enable: function () {
		if (this._enabled) { return; }

		on(this._dragStartTarget, START, this._onDown, this);

		this._enabled = true;
	},

	// @method disable()
	// Disables the dragging ability
	disable: function () {
		if (!this._enabled) { return; }

		// If we're currently dragging this draggable,
		// disabling it counts as first ending the drag.
		if (Draggable._dragging === this) {
			this.finishDrag();
		}

		off(this._dragStartTarget, START, this._onDown, this);

		this._enabled = false;
		this._moved = false;
	},

	_onDown: function (e) {
		// Ignore simulated events, since we handle both touch and
		// mouse explicitly; otherwise we risk getting duplicates of
		// touch events, see #4315.
		// Also ignore the event if disabled; this happens in IE11
		// under some circumstances, see #3666.
		if (e._simulated || !this._enabled) { return; }

		this._moved = false;

		if (hasClass(this._element, 'leaflet-zoom-anim')) { return; }

		if (Draggable._dragging || e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }
		Draggable._dragging = this;  // Prevent dragging multiple objects at once.

		if (this._preventOutline) {
			preventOutline(this._element);
		}

		disableImageDrag();
		disableTextSelection();

		if (this._moving) { return; }

		// @event down: Event
		// Fired when a drag is about to start.
		this.fire('down');

		var first = e.touches ? e.touches[0] : e,
		    sizedParent = getSizedParentNode(this._element);

		this._startPoint = new Point(first.clientX, first.clientY);

		// Cache the scale, so that we can continuously compensate for it during drag (_onMove).
		this._parentScale = getScale(sizedParent);

		on(document, MOVE[e.type], this._onMove, this);
		on(document, END[e.type], this._onUp, this);
	},

	_onMove: function (e) {
		// Ignore simulated events, since we handle both touch and
		// mouse explicitly; otherwise we risk getting duplicates of
		// touch events, see #4315.
		// Also ignore the event if disabled; this happens in IE11
		// under some circumstances, see #3666.
		if (e._simulated || !this._enabled) { return; }

		if (e.touches && e.touches.length > 1) {
			this._moved = true;
			return;
		}

		var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
		    offset = new Point(first.clientX, first.clientY)._subtract(this._startPoint);

		if (!offset.x && !offset.y) { return; }
		if (Math.abs(offset.x) + Math.abs(offset.y) < this.options.clickTolerance) { return; }

		// We assume that the parent container's position, border and scale do not change for the duration of the drag.
		// Therefore there is no need to account for the position and border (they are eliminated by the subtraction)
		// and we can use the cached value for the scale.
		offset.x /= this._parentScale.x;
		offset.y /= this._parentScale.y;

		preventDefault(e);

		if (!this._moved) {
			// @event dragstart: Event
			// Fired when a drag starts
			this.fire('dragstart');

			this._moved = true;
			this._startPos = getPosition(this._element).subtract(offset);

			addClass(document.body, 'leaflet-dragging');

			this._lastTarget = e.target || e.srcElement;
			// IE and Edge do not give the <use> element, so fetch it
			// if necessary
			if ((window.SVGElementInstance) && (this._lastTarget instanceof SVGElementInstance)) {
				this._lastTarget = this._lastTarget.correspondingUseElement;
			}
			addClass(this._lastTarget, 'leaflet-drag-target');
		}

		this._newPos = this._startPos.add(offset);
		this._moving = true;

		cancelAnimFrame(this._animRequest);
		this._lastEvent = e;
		this._animRequest = requestAnimFrame(this._updatePosition, this, true);
	},

	_updatePosition: function () {
		var e = {originalEvent: this._lastEvent};

		// @event predrag: Event
		// Fired continuously during dragging *before* each corresponding
		// update of the element's position.
		this.fire('predrag', e);
		setPosition(this._element, this._newPos);

		// @event drag: Event
		// Fired continuously during dragging.
		this.fire('drag', e);
	},

	_onUp: function (e) {
		// Ignore simulated events, since we handle both touch and
		// mouse explicitly; otherwise we risk getting duplicates of
		// touch events, see #4315.
		// Also ignore the event if disabled; this happens in IE11
		// under some circumstances, see #3666.
		if (e._simulated || !this._enabled) { return; }
		this.finishDrag();
	},

	finishDrag: function () {
		removeClass(document.body, 'leaflet-dragging');

		if (this._lastTarget) {
			removeClass(this._lastTarget, 'leaflet-drag-target');
			this._lastTarget = null;
		}

		for (var i in MOVE) {
			off(document, MOVE[i], this._onMove, this);
			off(document, END[i], this._onUp, this);
		}

		enableImageDrag();
		enableTextSelection();

		if (this._moved && this._moving) {
			// ensure drag is not fired after dragend
			cancelAnimFrame(this._animRequest);

			// @event dragend: DragEndEvent
			// Fired when the drag ends.
			this.fire('dragend', {
				distance: this._newPos.distanceTo(this._startPos)
			});
		}

		this._moving = false;
		Draggable._dragging = false;
	}

});

/*
 * @namespace LineUtil
 *
 * Various utility functions for polyline points processing, used by Leaflet internally to make polylines lightning-fast.
 */

// Simplify polyline with vertex reduction and Douglas-Peucker simplification.
// Improves rendering performance dramatically by lessening the number of points to draw.

// @function simplify(points: Point[], tolerance: Number): Point[]
// Dramatically reduces the number of points in a polyline while retaining
// its shape and returns a new array of simplified points, using the
// [Douglas-Peucker algorithm](http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm).
// Used for a huge performance boost when processing/displaying Leaflet polylines for
// each zoom level and also reducing visual noise. tolerance affects the amount of
// simplification (lesser value means higher quality but slower and with more points).
// Also released as a separated micro-library [Simplify.js](http://mourner.github.com/simplify-js/).
function simplify(points, tolerance) {
	if (!tolerance || !points.length) {
		return points.slice();
	}

	var sqTolerance = tolerance * tolerance;

	    // stage 1: vertex reduction
	    points = _reducePoints(points, sqTolerance);

	    // stage 2: Douglas-Peucker simplification
	    points = _simplifyDP(points, sqTolerance);

	return points;
}

// @function pointToSegmentDistance(p: Point, p1: Point, p2: Point): Number
// Returns the distance between point `p` and segment `p1` to `p2`.
function pointToSegmentDistance(p, p1, p2) {
	return Math.sqrt(_sqClosestPointOnSegment(p, p1, p2, true));
}

// @function closestPointOnSegment(p: Point, p1: Point, p2: Point): Number
// Returns the closest point from a point `p` on a segment `p1` to `p2`.
function closestPointOnSegment(p, p1, p2) {
	return _sqClosestPointOnSegment(p, p1, p2);
}

// Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
function _simplifyDP(points, sqTolerance) {

	var len = points.length,
	    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
	    markers = new ArrayConstructor(len);

	    markers[0] = markers[len - 1] = 1;

	_simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

	var i,
	    newPoints = [];

	for (i = 0; i < len; i++) {
		if (markers[i]) {
			newPoints.push(points[i]);
		}
	}

	return newPoints;
}

function _simplifyDPStep(points, markers, sqTolerance, first, last) {

	var maxSqDist = 0,
	index, i, sqDist;

	for (i = first + 1; i <= last - 1; i++) {
		sqDist = _sqClosestPointOnSegment(points[i], points[first], points[last], true);

		if (sqDist > maxSqDist) {
			index = i;
			maxSqDist = sqDist;
		}
	}

	if (maxSqDist > sqTolerance) {
		markers[index] = 1;

		_simplifyDPStep(points, markers, sqTolerance, first, index);
		_simplifyDPStep(points, markers, sqTolerance, index, last);
	}
}

// reduce points that are too close to each other to a single point
function _reducePoints(points, sqTolerance) {
	var reducedPoints = [points[0]];

	for (var i = 1, prev = 0, len = points.length; i < len; i++) {
		if (_sqDist(points[i], points[prev]) > sqTolerance) {
			reducedPoints.push(points[i]);
			prev = i;
		}
	}
	if (prev < len - 1) {
		reducedPoints.push(points[len - 1]);
	}
	return reducedPoints;
}

var _lastCode;

// @function clipSegment(a: Point, b: Point, bounds: Bounds, useLastCode?: Boolean, round?: Boolean): Point[]|Boolean
// Clips the segment a to b by rectangular bounds with the
// [Cohen-Sutherland algorithm](https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm)
// (modifying the segment points directly!). Used by Leaflet to only show polyline
// points that are on the screen or near, increasing performance.
function clipSegment(a, b, bounds, useLastCode, round) {
	var codeA = useLastCode ? _lastCode : _getBitCode(a, bounds),
	    codeB = _getBitCode(b, bounds),

	    codeOut, p, newCode;

	    // save 2nd code to avoid calculating it on the next segment
	    _lastCode = codeB;

	while (true) {
		// if a,b is inside the clip window (trivial accept)
		if (!(codeA | codeB)) {
			return [a, b];
		}

		// if a,b is outside the clip window (trivial reject)
		if (codeA & codeB) {
			return false;
		}

		// other cases
		codeOut = codeA || codeB;
		p = _getEdgeIntersection(a, b, codeOut, bounds, round);
		newCode = _getBitCode(p, bounds);

		if (codeOut === codeA) {
			a = p;
			codeA = newCode;
		} else {
			b = p;
			codeB = newCode;
		}
	}
}

function _getEdgeIntersection(a, b, code, bounds, round) {
	var dx = b.x - a.x,
	    dy = b.y - a.y,
	    min = bounds.min,
	    max = bounds.max,
	    x, y;

	if (code & 8) { // top
		x = a.x + dx * (max.y - a.y) / dy;
		y = max.y;

	} else if (code & 4) { // bottom
		x = a.x + dx * (min.y - a.y) / dy;
		y = min.y;

	} else if (code & 2) { // right
		x = max.x;
		y = a.y + dy * (max.x - a.x) / dx;

	} else if (code & 1) { // left
		x = min.x;
		y = a.y + dy * (min.x - a.x) / dx;
	}

	return new Point(x, y, round);
}

function _getBitCode(p, bounds) {
	var code = 0;

	if (p.x < bounds.min.x) { // left
		code |= 1;
	} else if (p.x > bounds.max.x) { // right
		code |= 2;
	}

	if (p.y < bounds.min.y) { // bottom
		code |= 4;
	} else if (p.y > bounds.max.y) { // top
		code |= 8;
	}

	return code;
}

// square distance (to avoid unnecessary Math.sqrt calls)
function _sqDist(p1, p2) {
	var dx = p2.x - p1.x,
	    dy = p2.y - p1.y;
	return dx * dx + dy * dy;
}

// return closest point on segment or distance to that point
function _sqClosestPointOnSegment(p, p1, p2, sqDist) {
	var x = p1.x,
	    y = p1.y,
	    dx = p2.x - x,
	    dy = p2.y - y,
	    dot = dx * dx + dy * dy,
	    t;

	if (dot > 0) {
		t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

		if (t > 1) {
			x = p2.x;
			y = p2.y;
		} else if (t > 0) {
			x += dx * t;
			y += dy * t;
		}
	}

	dx = p.x - x;
	dy = p.y - y;

	return sqDist ? dx * dx + dy * dy : new Point(x, y);
}


// @function isFlat(latlngs: LatLng[]): Boolean
// Returns true if `latlngs` is a flat array, false is nested.
function isFlat(latlngs) {
	return !isArray(latlngs[0]) || (typeof latlngs[0][0] !== 'object' && typeof latlngs[0][0] !== 'undefined');
}

function _flat(latlngs) {
	console.warn('Deprecated use of _flat, please use L.LineUtil.isFlat instead.');
	return isFlat(latlngs);
}


var LineUtil = (Object.freeze || Object)({
	simplify: simplify,
	pointToSegmentDistance: pointToSegmentDistance,
	closestPointOnSegment: closestPointOnSegment,
	clipSegment: clipSegment,
	_getEdgeIntersection: _getEdgeIntersection,
	_getBitCode: _getBitCode,
	_sqClosestPointOnSegment: _sqClosestPointOnSegment,
	isFlat: isFlat,
	_flat: _flat
});

/*
 * @namespace PolyUtil
 * Various utility functions for polygon geometries.
 */

/* @function clipPolygon(points: Point[], bounds: Bounds, round?: Boolean): Point[]
 * Clips the polygon geometry defined by the given `points` by the given bounds (using the [Sutherland-Hodgman algorithm](https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm)).
 * Used by Leaflet to only show polygon points that are on the screen or near, increasing
 * performance. Note that polygon points needs different algorithm for clipping
 * than polyline, so there's a separate method for it.
 */
function clipPolygon(points, bounds, round) {
	var clippedPoints,
	    edges = [1, 4, 2, 8],
	    i, j, k,
	    a, b,
	    len, edge, p;

	for (i = 0, len = points.length; i < len; i++) {
		points[i]._code = _getBitCode(points[i], bounds);
	}

	// for each edge (left, bottom, right, top)
	for (k = 0; k < 4; k++) {
		edge = edges[k];
		clippedPoints = [];

		for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
			a = points[i];
			b = points[j];

			// if a is inside the clip window
			if (!(a._code & edge)) {
				// if b is outside the clip window (a->b goes out of screen)
				if (b._code & edge) {
					p = _getEdgeIntersection(b, a, edge, bounds, round);
					p._code = _getBitCode(p, bounds);
					clippedPoints.push(p);
				}
				clippedPoints.push(a);

			// else if b is inside the clip window (a->b enters the screen)
			} else if (!(b._code & edge)) {
				p = _getEdgeIntersection(b, a, edge, bounds, round);
				p._code = _getBitCode(p, bounds);
				clippedPoints.push(p);
			}
		}
		points = clippedPoints;
	}

	return points;
}


var PolyUtil = (Object.freeze || Object)({
	clipPolygon: clipPolygon
});

/*
 * @namespace Projection
 * @section
 * Leaflet comes with a set of already defined Projections out of the box:
 *
 * @projection L.Projection.LonLat
 *
 * Equirectangular, or Plate Carree projection — the most simple projection,
 * mostly used by GIS enthusiasts. Directly maps `x` as longitude, and `y` as
 * latitude. Also suitable for flat worlds, e.g. game maps. Used by the
 * `EPSG:4326` and `Simple` CRS.
 */

var LonLat = {
	project: function (latlng) {
		return new Point(latlng.lng, latlng.lat);
	},

	unproject: function (point) {
		return new LatLng(point.y, point.x);
	},

	bounds: new Bounds([-180, -90], [180, 90])
};

/*
 * @namespace Projection
 * @projection L.Projection.Mercator
 *
 * Elliptical Mercator projection — more complex than Spherical Mercator. Assumes that Earth is an ellipsoid. Used by the EPSG:3395 CRS.
 */

var Mercator = {
	R: 6378137,
	R_MINOR: 6356752.314245179,

	bounds: new Bounds([-20037508.34279, -15496570.73972], [20037508.34279, 18764656.23138]),

	project: function (latlng) {
		var d = Math.PI / 180,
		    r = this.R,
		    y = latlng.lat * d,
		    tmp = this.R_MINOR / r,
		    e = Math.sqrt(1 - tmp * tmp),
		    con = e * Math.sin(y);

		var ts = Math.tan(Math.PI / 4 - y / 2) / Math.pow((1 - con) / (1 + con), e / 2);
		y = -r * Math.log(Math.max(ts, 1E-10));

		return new Point(latlng.lng * d * r, y);
	},

	unproject: function (point) {
		var d = 180 / Math.PI,
		    r = this.R,
		    tmp = this.R_MINOR / r,
		    e = Math.sqrt(1 - tmp * tmp),
		    ts = Math.exp(-point.y / r),
		    phi = Math.PI / 2 - 2 * Math.atan(ts);

		for (var i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
			con = e * Math.sin(phi);
			con = Math.pow((1 - con) / (1 + con), e / 2);
			dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
			phi += dphi;
		}

		return new LatLng(phi * d, point.x * d / r);
	}
};

/*
 * @class Projection

 * An object with methods for projecting geographical coordinates of the world onto
 * a flat surface (and back). See [Map projection](http://en.wikipedia.org/wiki/Map_projection).

 * @property bounds: Bounds
 * The bounds (specified in CRS units) where the projection is valid

 * @method project(latlng: LatLng): Point
 * Projects geographical coordinates into a 2D point.
 * Only accepts actual `L.LatLng` instances, not arrays.

 * @method unproject(point: Point): LatLng
 * The inverse of `project`. Projects a 2D point into a geographical location.
 * Only accepts actual `L.Point` instances, not arrays.

 * Note that the projection instances do not inherit from Leafet's `Class` object,
 * and can't be instantiated. Also, new classes can't inherit from them,
 * and methods can't be added to them with the `include` function.

 */




var index = (Object.freeze || Object)({
	LonLat: LonLat,
	Mercator: Mercator,
	SphericalMercator: SphericalMercator
});

/*
 * @namespace CRS
 * @crs L.CRS.EPSG3395
 *
 * Rarely used by some commercial tile providers. Uses Elliptical Mercator projection.
 */
var EPSG3395 = extend({}, Earth, {
	code: 'EPSG:3395',
	projection: Mercator,

	transformation: (function () {
		var scale = 0.5 / (Math.PI * Mercator.R);
		return toTransformation(scale, 0.5, -scale, 0.5);
	}())
});

/*
 * @namespace CRS
 * @crs L.CRS.EPSG4326
 *
 * A common CRS among GIS enthusiasts. Uses simple Equirectangular projection.
 *
 * Leaflet 1.0.x complies with the [TMS coordinate scheme for EPSG:4326](https://wiki.osgeo.org/wiki/Tile_Map_Service_Specification#global-geodetic),
 * which is a breaking change from 0.7.x behaviour.  If you are using a `TileLayer`
 * with this CRS, ensure that there are two 256x256 pixel tiles covering the
 * whole earth at zoom level zero, and that the tile coordinate origin is (-180,+90),
 * or (-180,-90) for `TileLayer`s with [the `tms` option](#tilelayer-tms) set.
 */

var EPSG4326 = extend({}, Earth, {
	code: 'EPSG:4326',
	projection: LonLat,
	transformation: toTransformation(1 / 180, 1, -1 / 180, 0.5)
});

/*
 * @namespace CRS
 * @crs L.CRS.Simple
 *
 * A simple CRS that maps longitude and latitude into `x` and `y` directly.
 * May be used for maps of flat surfaces (e.g. game maps). Note that the `y`
 * axis should still be inverted (going from bottom to top). `distance()` returns
 * simple euclidean distance.
 */

var Simple = extend({}, CRS, {
	projection: LonLat,
	transformation: toTransformation(1, 0, -1, 0),

	scale: function (zoom) {
		return Math.pow(2, zoom);
	},

	zoom: function (scale) {
		return Math.log(scale) / Math.LN2;
	},

	distance: function (latlng1, latlng2) {
		var dx = latlng2.lng - latlng1.lng,
		    dy = latlng2.lat - latlng1.lat;

		return Math.sqrt(dx * dx + dy * dy);
	},

	infinite: true
});

CRS.Earth = Earth;
CRS.EPSG3395 = EPSG3395;
CRS.EPSG3857 = EPSG3857;
CRS.EPSG900913 = EPSG900913;
CRS.EPSG4326 = EPSG4326;
CRS.Simple = Simple;

/*
 * @class Layer
 * @inherits Evented
 * @aka L.Layer
 * @aka ILayer
 *
 * A set of methods from the Layer base class that all Leaflet layers use.
 * Inherits all methods, options and events from `L.Evented`.
 *
 * @example
 *
 * ```js
 * var layer = L.marker(latlng).addTo(map);
 * layer.addTo(map);
 * layer.remove();
 * ```
 *
 * @event add: Event
 * Fired after the layer is added to a map
 *
 * @event remove: Event
 * Fired after the layer is removed from a map
 */


var Layer = Evented.extend({

	// Classes extending `L.Layer` will inherit the following options:
	options: {
		// @option pane: String = 'overlayPane'
		// By default the layer will be added to the map's [overlay pane](#map-overlaypane). Overriding this option will cause the layer to be placed on another pane by default.
		pane: 'overlayPane',

		// @option attribution: String = null
		// String to be shown in the attribution control, e.g. "© OpenStreetMap contributors". It describes the layer data and is often a legal obligation towards copyright holders and tile providers.
		attribution: null,

		bubblingMouseEvents: true
	},

	/* @section
	 * Classes extending `L.Layer` will inherit the following methods:
	 *
	 * @method addTo(map: Map|LayerGroup): this
	 * Adds the layer to the given map or layer group.
	 */
	addTo: function (map) {
		map.addLayer(this);
		return this;
	},

	// @method remove: this
	// Removes the layer from the map it is currently active on.
	remove: function () {
		return this.removeFrom(this._map || this._mapToAdd);
	},

	// @method removeFrom(map: Map): this
	// Removes the layer from the given map
	removeFrom: function (obj) {
		if (obj) {
			obj.removeLayer(this);
		}
		return this;
	},

	// @method getPane(name? : String): HTMLElement
	// Returns the `HTMLElement` representing the named pane on the map. If `name` is omitted, returns the pane for this layer.
	getPane: function (name) {
		return this._map.getPane(name ? (this.options[name] || name) : this.options.pane);
	},

	addInteractiveTarget: function (targetEl) {
		this._map._targets[stamp(targetEl)] = this;
		return this;
	},

	removeInteractiveTarget: function (targetEl) {
		delete this._map._targets[stamp(targetEl)];
		return this;
	},

	// @method getAttribution: String
	// Used by the `attribution control`, returns the [attribution option](#gridlayer-attribution).
	getAttribution: function () {
		return this.options.attribution;
	},

	_layerAdd: function (e) {
		var map = e.target;

		// check in case layer gets added and then removed before the map is ready
		if (!map.hasLayer(this)) { return; }

		this._map = map;
		this._zoomAnimated = map._zoomAnimated;

		if (this.getEvents) {
			var events = this.getEvents();
			map.on(events, this);
			this.once('remove', function () {
				map.off(events, this);
			}, this);
		}

		this.onAdd(map);

		if (this.getAttribution && map.attributionControl) {
			map.attributionControl.addAttribution(this.getAttribution());
		}

		this.fire('add');
		map.fire('layeradd', {layer: this});
	}
});

/* @section Extension methods
 * @uninheritable
 *
 * Every layer should extend from `L.Layer` and (re-)implement the following methods.
 *
 * @method onAdd(map: Map): this
 * Should contain code that creates DOM elements for the layer, adds them to `map panes` where they should belong and puts listeners on relevant map events. Called on [`map.addLayer(layer)`](#map-addlayer).
 *
 * @method onRemove(map: Map): this
 * Should contain all clean up code that removes the layer's elements from the DOM and removes listeners previously added in [`onAdd`](#layer-onadd). Called on [`map.removeLayer(layer)`](#map-removelayer).
 *
 * @method getEvents(): Object
 * This optional method should return an object like `{ viewreset: this._reset }` for [`addEventListener`](#evented-addeventlistener). The event handlers in this object will be automatically added and removed from the map with your layer.
 *
 * @method getAttribution(): String
 * This optional method should return a string containing HTML to be shown on the `Attribution control` whenever the layer is visible.
 *
 * @method beforeAdd(map: Map): this
 * Optional method. Called on [`map.addLayer(layer)`](#map-addlayer), before the layer is added to the map, before events are initialized, without waiting until the map is in a usable state. Use for early initialization only.
 */


/* @namespace Map
 * @section Layer events
 *
 * @event layeradd: LayerEvent
 * Fired when a new layer is added to the map.
 *
 * @event layerremove: LayerEvent
 * Fired when some layer is removed from the map
 *
 * @section Methods for Layers and Controls
 */
Map.include({
	// @method addLayer(layer: Layer): this
	// Adds the given layer to the map
	addLayer: function (layer) {
		if (!layer._layerAdd) {
			throw new Error('The provided object is not a Layer.');
		}

		var id = stamp(layer);
		if (this._layers[id]) { return this; }
		this._layers[id] = layer;

		layer._mapToAdd = this;

		if (layer.beforeAdd) {
			layer.beforeAdd(this);
		}

		this.whenReady(layer._layerAdd, layer);

		return this;
	},

	// @method removeLayer(layer: Layer): this
	// Removes the given layer from the map.
	removeLayer: function (layer) {
		var id = stamp(layer);

		if (!this._layers[id]) { return this; }

		if (this._loaded) {
			layer.onRemove(this);
		}

		if (layer.getAttribution && this.attributionControl) {
			this.attributionControl.removeAttribution(layer.getAttribution());
		}

		delete this._layers[id];

		if (this._loaded) {
			this.fire('layerremove', {layer: layer});
			layer.fire('remove');
		}

		layer._map = layer._mapToAdd = null;

		return this;
	},

	// @method hasLayer(layer: Layer): Boolean
	// Returns `true` if the given layer is currently added to the map
	hasLayer: function (layer) {
		return !!layer && (stamp(layer) in this._layers);
	},

	/* @method eachLayer(fn: Function, context?: Object): this
	 * Iterates over the layers of the map, optionally specifying context of the iterator function.
	 * ```
	 * map.eachLayer(function(layer){
	 *     layer.bindPopup('Hello');
	 * });
	 * ```
	 */
	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	_addLayers: function (layers) {
		layers = layers ? (isArray(layers) ? layers : [layers]) : [];

		for (var i = 0, len = layers.length; i < len; i++) {
			this.addLayer(layers[i]);
		}
	},

	_addZoomLimit: function (layer) {
		if (isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom)) {
			this._zoomBoundLayers[stamp(layer)] = layer;
			this._updateZoomLevels();
		}
	},

	_removeZoomLimit: function (layer) {
		var id = stamp(layer);

		if (this._zoomBoundLayers[id]) {
			delete this._zoomBoundLayers[id];
			this._updateZoomLevels();
		}
	},

	_updateZoomLevels: function () {
		var minZoom = Infinity,
		    maxZoom = -Infinity,
		    oldZoomSpan = this._getZoomSpan();

		for (var i in this._zoomBoundLayers) {
			var options = this._zoomBoundLayers[i].options;

			minZoom = options.minZoom === undefined ? minZoom : Math.min(minZoom, options.minZoom);
			maxZoom = options.maxZoom === undefined ? maxZoom : Math.max(maxZoom, options.maxZoom);
		}

		this._layersMaxZoom = maxZoom === -Infinity ? undefined : maxZoom;
		this._layersMinZoom = minZoom === Infinity ? undefined : minZoom;

		// @section Map state change events
		// @event zoomlevelschange: Event
		// Fired when the number of zoomlevels on the map is changed due
		// to adding or removing a layer.
		if (oldZoomSpan !== this._getZoomSpan()) {
			this.fire('zoomlevelschange');
		}

		if (this.options.maxZoom === undefined && this._layersMaxZoom && this.getZoom() > this._layersMaxZoom) {
			this.setZoom(this._layersMaxZoom);
		}
		if (this.options.minZoom === undefined && this._layersMinZoom && this.getZoom() < this._layersMinZoom) {
			this.setZoom(this._layersMinZoom);
		}
	}
});

/*
 * @class LayerGroup
 * @aka L.LayerGroup
 * @inherits Layer
 *
 * Used to group several layers and handle them as one. If you add it to the map,
 * any layers added or removed from the group will be added/removed on the map as
 * well. Extends `Layer`.
 *
 * @example
 *
 * ```js
 * L.layerGroup([marker1, marker2])
 * 	.addLayer(polyline)
 * 	.addTo(map);
 * ```
 */

var LayerGroup = Layer.extend({

	initialize: function (layers, options) {
		setOptions(this, options);

		this._layers = {};

		var i, len;

		if (layers) {
			for (i = 0, len = layers.length; i < len; i++) {
				this.addLayer(layers[i]);
			}
		}
	},

	// @method addLayer(layer: Layer): this
	// Adds the given layer to the group.
	addLayer: function (layer) {
		var id = this.getLayerId(layer);

		this._layers[id] = layer;

		if (this._map) {
			this._map.addLayer(layer);
		}

		return this;
	},

	// @method removeLayer(layer: Layer): this
	// Removes the given layer from the group.
	// @alternative
	// @method removeLayer(id: Number): this
	// Removes the layer with the given internal ID from the group.
	removeLayer: function (layer) {
		var id = layer in this._layers ? layer : this.getLayerId(layer);

		if (this._map && this._layers[id]) {
			this._map.removeLayer(this._layers[id]);
		}

		delete this._layers[id];

		return this;
	},

	// @method hasLayer(layer: Layer): Boolean
	// Returns `true` if the given layer is currently added to the group.
	// @alternative
	// @method hasLayer(id: Number): Boolean
	// Returns `true` if the given internal ID is currently added to the group.
	hasLayer: function (layer) {
		return !!layer && (layer in this._layers || this.getLayerId(layer) in this._layers);
	},

	// @method clearLayers(): this
	// Removes all the layers from the group.
	clearLayers: function () {
		return this.eachLayer(this.removeLayer, this);
	},

	// @method invoke(methodName: String, …): this
	// Calls `methodName` on every layer contained in this group, passing any
	// additional parameters. Has no effect if the layers contained do not
	// implement `methodName`.
	invoke: function (methodName) {
		var args = Array.prototype.slice.call(arguments, 1),
		    i, layer;

		for (i in this._layers) {
			layer = this._layers[i];

			if (layer[methodName]) {
				layer[methodName].apply(layer, args);
			}
		}

		return this;
	},

	onAdd: function (map) {
		this.eachLayer(map.addLayer, map);
	},

	onRemove: function (map) {
		this.eachLayer(map.removeLayer, map);
	},

	// @method eachLayer(fn: Function, context?: Object): this
	// Iterates over the layers of the group, optionally specifying context of the iterator function.
	// ```js
	// group.eachLayer(function (layer) {
	// 	layer.bindPopup('Hello');
	// });
	// ```
	eachLayer: function (method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i]);
		}
		return this;
	},

	// @method getLayer(id: Number): Layer
	// Returns the layer with the given internal ID.
	getLayer: function (id) {
		return this._layers[id];
	},

	// @method getLayers(): Layer[]
	// Returns an array of all the layers added to the group.
	getLayers: function () {
		var layers = [];
		this.eachLayer(layers.push, layers);
		return layers;
	},

	// @method setZIndex(zIndex: Number): this
	// Calls `setZIndex` on every layer contained in this group, passing the z-index.
	setZIndex: function (zIndex) {
		return this.invoke('setZIndex', zIndex);
	},

	// @method getLayerId(layer: Layer): Number
	// Returns the internal ID for a layer
	getLayerId: function (layer) {
		return stamp(layer);
	}
});


// @factory L.layerGroup(layers?: Layer[], options?: Object)
// Create a layer group, optionally given an initial set of layers and an `options` object.
var layerGroup = function (layers, options) {
	return new LayerGroup(layers, options);
};

/*
 * @class FeatureGroup
 * @aka L.FeatureGroup
 * @inherits LayerGroup
 *
 * Extended `LayerGroup` that makes it easier to do the same thing to all its member layers:
 *  * [`bindPopup`](#layer-bindpopup) binds a popup to all of the layers at once (likewise with [`bindTooltip`](#layer-bindtooltip))
 *  * Events are propagated to the `FeatureGroup`, so if the group has an event
 * handler, it will handle events from any of the layers. This includes mouse events
 * and custom events.
 *  * Has `layeradd` and `layerremove` events
 *
 * @example
 *
 * ```js
 * L.featureGroup([marker1, marker2, polyline])
 * 	.bindPopup('Hello world!')
 * 	.on('click', function() { alert('Clicked on a member of the group!'); })
 * 	.addTo(map);
 * ```
 */

var FeatureGroup = LayerGroup.extend({

	addLayer: function (layer) {
		if (this.hasLayer(layer)) {
			return this;
		}

		layer.addEventParent(this);

		LayerGroup.prototype.addLayer.call(this, layer);

		// @event layeradd: LayerEvent
		// Fired when a layer is added to this `FeatureGroup`
		return this.fire('layeradd', {layer: layer});
	},

	removeLayer: function (layer) {
		if (!this.hasLayer(layer)) {
			return this;
		}
		if (layer in this._layers) {
			layer = this._layers[layer];
		}

		layer.removeEventParent(this);

		LayerGroup.prototype.removeLayer.call(this, layer);

		// @event layerremove: LayerEvent
		// Fired when a layer is removed from this `FeatureGroup`
		return this.fire('layerremove', {layer: layer});
	},

	// @method setStyle(style: Path options): this
	// Sets the given path options to each layer of the group that has a `setStyle` method.
	setStyle: function (style) {
		return this.invoke('setStyle', style);
	},

	// @method bringToFront(): this
	// Brings the layer group to the top of all other layers
	bringToFront: function () {
		return this.invoke('bringToFront');
	},

	// @method bringToBack(): this
	// Brings the layer group to the back of all other layers
	bringToBack: function () {
		return this.invoke('bringToBack');
	},

	// @method getBounds(): LatLngBounds
	// Returns the LatLngBounds of the Feature Group (created from bounds and coordinates of its children).
	getBounds: function () {
		var bounds = new LatLngBounds();

		for (var id in this._layers) {
			var layer = this._layers[id];
			bounds.extend(layer.getBounds ? layer.getBounds() : layer.getLatLng());
		}
		return bounds;
	}
});

// @factory L.featureGroup(layers: Layer[])
// Create a feature group, optionally given an initial set of layers.
var featureGroup = function (layers) {
	return new FeatureGroup(layers);
};

/*
 * @class Icon
 * @aka L.Icon
 *
 * Represents an icon to provide when creating a marker.
 *
 * @example
 *
 * ```js
 * var myIcon = L.icon({
 *     iconUrl: 'my-icon.png',
 *     iconRetinaUrl: 'my-icon@2x.png',
 *     iconSize: [38, 95],
 *     iconAnchor: [22, 94],
 *     popupAnchor: [-3, -76],
 *     shadowUrl: 'my-icon-shadow.png',
 *     shadowRetinaUrl: 'my-icon-shadow@2x.png',
 *     shadowSize: [68, 95],
 *     shadowAnchor: [22, 94]
 * });
 *
 * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
 * ```
 *
 * `L.Icon.Default` extends `L.Icon` and is the blue icon Leaflet uses for markers by default.
 *
 */

var Icon = Class.extend({

	/* @section
	 * @aka Icon options
	 *
	 * @option iconUrl: String = null
	 * **(required)** The URL to the icon image (absolute or relative to your script path).
	 *
	 * @option iconRetinaUrl: String = null
	 * The URL to a retina sized version of the icon image (absolute or relative to your
	 * script path). Used for Retina screen devices.
	 *
	 * @option iconSize: Point = null
	 * Size of the icon image in pixels.
	 *
	 * @option iconAnchor: Point = null
	 * The coordinates of the "tip" of the icon (relative to its top left corner). The icon
	 * will be aligned so that this point is at the marker's geographical location. Centered
	 * by default if size is specified, also can be set in CSS with negative margins.
	 *
	 * @option popupAnchor: Point = [0, 0]
	 * The coordinates of the point from which popups will "open", relative to the icon anchor.
	 *
	 * @option tooltipAnchor: Point = [0, 0]
	 * The coordinates of the point from which tooltips will "open", relative to the icon anchor.
	 *
	 * @option shadowUrl: String = null
	 * The URL to the icon shadow image. If not specified, no shadow image will be created.
	 *
	 * @option shadowRetinaUrl: String = null
	 *
	 * @option shadowSize: Point = null
	 * Size of the shadow image in pixels.
	 *
	 * @option shadowAnchor: Point = null
	 * The coordinates of the "tip" of the shadow (relative to its top left corner) (the same
	 * as iconAnchor if not specified).
	 *
	 * @option className: String = ''
	 * A custom class name to assign to both icon and shadow images. Empty by default.
	 */

	options: {
		popupAnchor: [0, 0],
		tooltipAnchor: [0, 0]
	},

	initialize: function (options) {
		setOptions(this, options);
	},

	// @method createIcon(oldIcon?: HTMLElement): HTMLElement
	// Called internally when the icon has to be shown, returns a `<img>` HTML element
	// styled according to the options.
	createIcon: function (oldIcon) {
		return this._createIcon('icon', oldIcon);
	},

	// @method createShadow(oldIcon?: HTMLElement): HTMLElement
	// As `createIcon`, but for the shadow beneath it.
	createShadow: function (oldIcon) {
		return this._createIcon('shadow', oldIcon);
	},

	_createIcon: function (name, oldIcon) {
		var src = this._getIconUrl(name);

		if (!src) {
			if (name === 'icon') {
				throw new Error('iconUrl not set in Icon options (see the docs).');
			}
			return null;
		}

		var img = this._createImg(src, oldIcon && oldIcon.tagName === 'IMG' ? oldIcon : null);
		this._setIconStyles(img, name);

		return img;
	},

	_setIconStyles: function (img, name) {
		var options = this.options;
		var sizeOption = options[name + 'Size'];

		if (typeof sizeOption === 'number') {
			sizeOption = [sizeOption, sizeOption];
		}

		var size = toPoint(sizeOption),
		    anchor = toPoint(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
		            size && size.divideBy(2, true));

		img.className = 'leaflet-marker-' + name + ' ' + (options.className || '');

		if (anchor) {
			img.style.marginLeft = (-anchor.x) + 'px';
			img.style.marginTop  = (-anchor.y) + 'px';
		}

		if (size) {
			img.style.width  = size.x + 'px';
			img.style.height = size.y + 'px';
		}
	},

	_createImg: function (src, el) {
		el = el || document.createElement('img');
		el.src = src;
		return el;
	},

	_getIconUrl: function (name) {
		return retina && this.options[name + 'RetinaUrl'] || this.options[name + 'Url'];
	}
});


// @factory L.icon(options: Icon options)
// Creates an icon instance with the given options.
function icon(options) {
	return new Icon(options);
}

/*
 * @miniclass Icon.Default (Icon)
 * @aka L.Icon.Default
 * @section
 *
 * A trivial subclass of `Icon`, represents the icon to use in `Marker`s when
 * no icon is specified. Points to the blue marker image distributed with Leaflet
 * releases.
 *
 * In order to customize the default icon, just change the properties of `L.Icon.Default.prototype.options`
 * (which is a set of `Icon options`).
 *
 * If you want to _completely_ replace the default icon, override the
 * `L.Marker.prototype.options.icon` with your own icon instead.
 */

var IconDefault = Icon.extend({

	options: {
		iconUrl:       'marker-icon.png',
		iconRetinaUrl: 'marker-icon-2x.png',
		shadowUrl:     'marker-shadow.png',
		iconSize:    [25, 41],
		iconAnchor:  [12, 41],
		popupAnchor: [1, -34],
		tooltipAnchor: [16, -28],
		shadowSize:  [41, 41]
	},

	_getIconUrl: function (name) {
		if (!IconDefault.imagePath) {	// Deprecated, backwards-compatibility only
			IconDefault.imagePath = this._detectIconPath();
		}

		// @option imagePath: String
		// `Icon.Default` will try to auto-detect the location of the
		// blue icon images. If you are placing these images in a non-standard
		// way, set this option to point to the right path.
		return (this.options.imagePath || IconDefault.imagePath) + Icon.prototype._getIconUrl.call(this, name);
	},

	_detectIconPath: function () {
		var el = create$1('div',  'leaflet-default-icon-path', document.body);
		var path = getStyle(el, 'background-image') ||
		           getStyle(el, 'backgroundImage');	// IE8

		document.body.removeChild(el);

		if (path === null || path.indexOf('url') !== 0) {
			path = '';
		} else {
			path = path.replace(/^url\(["']?/, '').replace(/marker-icon\.png["']?\)$/, '');
		}

		return path;
	}
});

/*
 * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
 */


/* @namespace Marker
 * @section Interaction handlers
 *
 * Interaction handlers are properties of a marker instance that allow you to control interaction behavior in runtime, enabling or disabling certain features such as dragging (see `Handler` methods). Example:
 *
 * ```js
 * marker.dragging.disable();
 * ```
 *
 * @property dragging: Handler
 * Marker dragging handler (by both mouse and touch). Only valid when the marker is on the map (Otherwise set [`marker.options.draggable`](#marker-draggable)).
 */

var MarkerDrag = Handler.extend({
	initialize: function (marker) {
		this._marker = marker;
	},

	addHooks: function () {
		var icon = this._marker._icon;

		if (!this._draggable) {
			this._draggable = new Draggable(icon, icon, true);
		}

		this._draggable.on({
			dragstart: this._onDragStart,
			predrag: this._onPreDrag,
			drag: this._onDrag,
			dragend: this._onDragEnd
		}, this).enable();

		addClass(icon, 'leaflet-marker-draggable');
	},

	removeHooks: function () {
		this._draggable.off({
			dragstart: this._onDragStart,
			predrag: this._onPreDrag,
			drag: this._onDrag,
			dragend: this._onDragEnd
		}, this).disable();

		if (this._marker._icon) {
			removeClass(this._marker._icon, 'leaflet-marker-draggable');
		}
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	_adjustPan: function (e) {
		var marker = this._marker,
		    map = marker._map,
		    speed = this._marker.options.autoPanSpeed,
		    padding = this._marker.options.autoPanPadding,
		    iconPos = getPosition(marker._icon),
		    bounds = map.getPixelBounds(),
		    origin = map.getPixelOrigin();

		var panBounds = toBounds(
			bounds.min._subtract(origin).add(padding),
			bounds.max._subtract(origin).subtract(padding)
		);

		if (!panBounds.contains(iconPos)) {
			// Compute incremental movement
			var movement = toPoint(
				(Math.max(panBounds.max.x, iconPos.x) - panBounds.max.x) / (bounds.max.x - panBounds.max.x) -
				(Math.min(panBounds.min.x, iconPos.x) - panBounds.min.x) / (bounds.min.x - panBounds.min.x),

				(Math.max(panBounds.max.y, iconPos.y) - panBounds.max.y) / (bounds.max.y - panBounds.max.y) -
				(Math.min(panBounds.min.y, iconPos.y) - panBounds.min.y) / (bounds.min.y - panBounds.min.y)
			).multiplyBy(speed);

			map.panBy(movement, {animate: false});

			this._draggable._newPos._add(movement);
			this._draggable._startPos._add(movement);

			setPosition(marker._icon, this._draggable._newPos);
			this._onDrag(e);

			this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
		}
	},

	_onDragStart: function () {
		// @section Dragging events
		// @event dragstart: Event
		// Fired when the user starts dragging the marker.

		// @event movestart: Event
		// Fired when the marker starts moving (because of dragging).

		this._oldLatLng = this._marker.getLatLng();
		this._marker
		    .closePopup()
		    .fire('movestart')
		    .fire('dragstart');
	},

	_onPreDrag: function (e) {
		if (this._marker.options.autoPan) {
			cancelAnimFrame(this._panRequest);
			this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
		}
	},

	_onDrag: function (e) {
		var marker = this._marker,
		    shadow = marker._shadow,
		    iconPos = getPosition(marker._icon),
		    latlng = marker._map.layerPointToLatLng(iconPos);

		// update shadow position
		if (shadow) {
			setPosition(shadow, iconPos);
		}

		marker._latlng = latlng;
		e.latlng = latlng;
		e.oldLatLng = this._oldLatLng;

		// @event drag: Event
		// Fired repeatedly while the user drags the marker.
		marker
		    .fire('move', e)
		    .fire('drag', e);
	},

	_onDragEnd: function (e) {
		// @event dragend: DragEndEvent
		// Fired when the user stops dragging the marker.

		 cancelAnimFrame(this._panRequest);

		// @event moveend: Event
		// Fired when the marker stops moving (because of dragging).
		delete this._oldLatLng;
		this._marker
		    .fire('moveend')
		    .fire('dragend', e);
	}
});

/*
 * @class Marker
 * @inherits Interactive layer
 * @aka L.Marker
 * L.Marker is used to display clickable/draggable icons on the map. Extends `Layer`.
 *
 * @example
 *
 * ```js
 * L.marker([50.5, 30.5]).addTo(map);
 * ```
 */

var Marker = Layer.extend({

	// @section
	// @aka Marker options
	options: {
		// @option icon: Icon = *
		// Icon instance to use for rendering the marker.
		// See [Icon documentation](#L.Icon) for details on how to customize the marker icon.
		// If not specified, a common instance of `L.Icon.Default` is used.
		icon: new IconDefault(),

		// Option inherited from "Interactive layer" abstract class
		interactive: true,

		// @option keyboard: Boolean = true
		// Whether the marker can be tabbed to with a keyboard and clicked by pressing enter.
		keyboard: true,

		// @option title: String = ''
		// Text for the browser tooltip that appear on marker hover (no tooltip by default).
		title: '',

		// @option alt: String = ''
		// Text for the `alt` attribute of the icon image (useful for accessibility).
		alt: '',

		// @option zIndexOffset: Number = 0
		// By default, marker images zIndex is set automatically based on its latitude. Use this option if you want to put the marker on top of all others (or below), specifying a high value like `1000` (or high negative value, respectively).
		zIndexOffset: 0,

		// @option opacity: Number = 1.0
		// The opacity of the marker.
		opacity: 1,

		// @option riseOnHover: Boolean = false
		// If `true`, the marker will get on top of others when you hover the mouse over it.
		riseOnHover: false,

		// @option riseOffset: Number = 250
		// The z-index offset used for the `riseOnHover` feature.
		riseOffset: 250,

		// @option pane: String = 'markerPane'
		// `Map pane` where the markers icon will be added.
		pane: 'markerPane',

		// @option pane: String = 'shadowPane'
		// `Map pane` where the markers shadow will be added.
		shadowPane: 'shadowPane',

		// @option bubblingMouseEvents: Boolean = false
		// When `true`, a mouse event on this marker will trigger the same event on the map
		// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
		bubblingMouseEvents: false,

		// @section Draggable marker options
		// @option draggable: Boolean = false
		// Whether the marker is draggable with mouse/touch or not.
		draggable: false,

		// @option autoPan: Boolean = false
		// Whether to pan the map when dragging this marker near its edge or not.
		autoPan: false,

		// @option autoPanPadding: Point = Point(50, 50)
		// Distance (in pixels to the left/right and to the top/bottom) of the
		// map edge to start panning the map.
		autoPanPadding: [50, 50],

		// @option autoPanSpeed: Number = 10
		// Number of pixels the map should pan by.
		autoPanSpeed: 10
	},

	/* @section
	 *
	 * In addition to [shared layer methods](#Layer) like `addTo()` and `remove()` and [popup methods](#Popup) like bindPopup() you can also use the following methods:
	 */

	initialize: function (latlng, options) {
		setOptions(this, options);
		this._latlng = toLatLng(latlng);
	},

	onAdd: function (map) {
		this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;

		if (this._zoomAnimated) {
			map.on('zoomanim', this._animateZoom, this);
		}

		this._initIcon();
		this.update();
	},

	onRemove: function (map) {
		if (this.dragging && this.dragging.enabled()) {
			this.options.draggable = true;
			this.dragging.removeHooks();
		}
		delete this.dragging;

		if (this._zoomAnimated) {
			map.off('zoomanim', this._animateZoom, this);
		}

		this._removeIcon();
		this._removeShadow();
	},

	getEvents: function () {
		return {
			zoom: this.update,
			viewreset: this.update
		};
	},

	// @method getLatLng: LatLng
	// Returns the current geographical position of the marker.
	getLatLng: function () {
		return this._latlng;
	},

	// @method setLatLng(latlng: LatLng): this
	// Changes the marker position to the given point.
	setLatLng: function (latlng) {
		var oldLatLng = this._latlng;
		this._latlng = toLatLng(latlng);
		this.update();

		// @event move: Event
		// Fired when the marker is moved via [`setLatLng`](#marker-setlatlng) or by [dragging](#marker-dragging). Old and new coordinates are included in event arguments as `oldLatLng`, `latlng`.
		return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
	},

	// @method setZIndexOffset(offset: Number): this
	// Changes the [zIndex offset](#marker-zindexoffset) of the marker.
	setZIndexOffset: function (offset) {
		this.options.zIndexOffset = offset;
		return this.update();
	},

	// @method getIcon: Icon
	// Returns the current icon used by the marker
	getIcon: function () {
		return this.options.icon;
	},

	// @method setIcon(icon: Icon): this
	// Changes the marker icon.
	setIcon: function (icon) {

		this.options.icon = icon;

		if (this._map) {
			this._initIcon();
			this.update();
		}

		if (this._popup) {
			this.bindPopup(this._popup, this._popup.options);
		}

		return this;
	},

	getElement: function () {
		return this._icon;
	},

	update: function () {

		if (this._icon && this._map) {
			var pos = this._map.latLngToLayerPoint(this._latlng).round();
			this._setPos(pos);
		}

		return this;
	},

	_initIcon: function () {
		var options = this.options,
		    classToAdd = 'leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

		var icon = options.icon.createIcon(this._icon),
		    addIcon = false;

		// if we're not reusing the icon, remove the old one and init new one
		if (icon !== this._icon) {
			if (this._icon) {
				this._removeIcon();
			}
			addIcon = true;

			if (options.title) {
				icon.title = options.title;
			}

			if (icon.tagName === 'IMG') {
				icon.alt = options.alt || '';
			}
		}

		addClass(icon, classToAdd);

		if (options.keyboard) {
			icon.tabIndex = '0';
		}

		this._icon = icon;

		if (options.riseOnHover) {
			this.on({
				mouseover: this._bringToFront,
				mouseout: this._resetZIndex
			});
		}

		var newShadow = options.icon.createShadow(this._shadow),
		    addShadow = false;

		if (newShadow !== this._shadow) {
			this._removeShadow();
			addShadow = true;
		}

		if (newShadow) {
			addClass(newShadow, classToAdd);
			newShadow.alt = '';
		}
		this._shadow = newShadow;


		if (options.opacity < 1) {
			this._updateOpacity();
		}


		if (addIcon) {
			this.getPane().appendChild(this._icon);
		}
		this._initInteraction();
		if (newShadow && addShadow) {
			this.getPane(options.shadowPane).appendChild(this._shadow);
		}
	},

	_removeIcon: function () {
		if (this.options.riseOnHover) {
			this.off({
				mouseover: this._bringToFront,
				mouseout: this._resetZIndex
			});
		}

		remove(this._icon);
		this.removeInteractiveTarget(this._icon);

		this._icon = null;
	},

	_removeShadow: function () {
		if (this._shadow) {
			remove(this._shadow);
		}
		this._shadow = null;
	},

	_setPos: function (pos) {
		setPosition(this._icon, pos);

		if (this._shadow) {
			setPosition(this._shadow, pos);
		}

		this._zIndex = pos.y + this.options.zIndexOffset;

		this._resetZIndex();
	},

	_updateZIndex: function (offset) {
		this._icon.style.zIndex = this._zIndex + offset;
	},

	_animateZoom: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	_initInteraction: function () {

		if (!this.options.interactive) { return; }

		addClass(this._icon, 'leaflet-interactive');

		this.addInteractiveTarget(this._icon);

		if (MarkerDrag) {
			var draggable = this.options.draggable;
			if (this.dragging) {
				draggable = this.dragging.enabled();
				this.dragging.disable();
			}

			this.dragging = new MarkerDrag(this);

			if (draggable) {
				this.dragging.enable();
			}
		}
	},

	// @method setOpacity(opacity: Number): this
	// Changes the opacity of the marker.
	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		if (this._map) {
			this._updateOpacity();
		}

		return this;
	},

	_updateOpacity: function () {
		var opacity = this.options.opacity;

		if (this._icon) {
			setOpacity(this._icon, opacity);
		}

		if (this._shadow) {
			setOpacity(this._shadow, opacity);
		}
	},

	_bringToFront: function () {
		this._updateZIndex(this.options.riseOffset);
	},

	_resetZIndex: function () {
		this._updateZIndex(0);
	},

	_getPopupAnchor: function () {
		return this.options.icon.options.popupAnchor;
	},

	_getTooltipAnchor: function () {
		return this.options.icon.options.tooltipAnchor;
	}
});


// factory L.marker(latlng: LatLng, options? : Marker options)

// @factory L.marker(latlng: LatLng, options? : Marker options)
// Instantiates a Marker object given a geographical point and optionally an options object.
function marker(latlng, options) {
	return new Marker(latlng, options);
}

/*
 * @class Path
 * @aka L.Path
 * @inherits Interactive layer
 *
 * An abstract class that contains options and constants shared between vector
 * overlays (Polygon, Polyline, Circle). Do not use it directly. Extends `Layer`.
 */

var Path = Layer.extend({

	// @section
	// @aka Path options
	options: {
		// @option stroke: Boolean = true
		// Whether to draw stroke along the path. Set it to `false` to disable borders on polygons or circles.
		stroke: true,

		// @option color: String = '#3388ff'
		// Stroke color
		color: '#3388ff',

		// @option weight: Number = 3
		// Stroke width in pixels
		weight: 3,

		// @option opacity: Number = 1.0
		// Stroke opacity
		opacity: 1,

		// @option lineCap: String= 'round'
		// A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
		lineCap: 'round',

		// @option lineJoin: String = 'round'
		// A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
		lineJoin: 'round',

		// @option dashArray: String = null
		// A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
		dashArray: null,

		// @option dashOffset: String = null
		// A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
		dashOffset: null,

		// @option fill: Boolean = depends
		// Whether to fill the path with color. Set it to `false` to disable filling on polygons or circles.
		fill: false,

		// @option fillColor: String = *
		// Fill color. Defaults to the value of the [`color`](#path-color) option
		fillColor: null,

		// @option fillOpacity: Number = 0.2
		// Fill opacity.
		fillOpacity: 0.2,

		// @option fillRule: String = 'evenodd'
		// A string that defines [how the inside of a shape](https://developer.mozilla.org/docs/Web/SVG/Attribute/fill-rule) is determined.
		fillRule: 'evenodd',

		// className: '',

		// Option inherited from "Interactive layer" abstract class
		interactive: true,

		// @option bubblingMouseEvents: Boolean = true
		// When `true`, a mouse event on this path will trigger the same event on the map
		// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
		bubblingMouseEvents: true
	},

	beforeAdd: function (map) {
		// Renderer is set here because we need to call renderer.getEvents
		// before this.getEvents.
		this._renderer = map.getRenderer(this);
	},

	onAdd: function () {
		this._renderer._initPath(this);
		this._reset();
		this._renderer._addPath(this);
	},

	onRemove: function () {
		this._renderer._removePath(this);
	},

	// @method redraw(): this
	// Redraws the layer. Sometimes useful after you changed the coordinates that the path uses.
	redraw: function () {
		if (this._map) {
			this._renderer._updatePath(this);
		}
		return this;
	},

	// @method setStyle(style: Path options): this
	// Changes the appearance of a Path based on the options in the `Path options` object.
	setStyle: function (style) {
		setOptions(this, style);
		if (this._renderer) {
			this._renderer._updateStyle(this);
			if (this.options.stroke && style.hasOwnProperty('weight')) {
				this._updateBounds();
			}
		}
		return this;
	},

	// @method bringToFront(): this
	// Brings the layer to the top of all path layers.
	bringToFront: function () {
		if (this._renderer) {
			this._renderer._bringToFront(this);
		}
		return this;
	},

	// @method bringToBack(): this
	// Brings the layer to the bottom of all path layers.
	bringToBack: function () {
		if (this._renderer) {
			this._renderer._bringToBack(this);
		}
		return this;
	},

	getElement: function () {
		return this._path;
	},

	_reset: function () {
		// defined in child classes
		this._project();
		this._update();
	},

	_clickTolerance: function () {
		// used when doing hit detection for Canvas layers
		return (this.options.stroke ? this.options.weight / 2 : 0) + this._renderer.options.tolerance;
	}
});

/*
 * @class CircleMarker
 * @aka L.CircleMarker
 * @inherits Path
 *
 * A circle of a fixed size with radius specified in pixels. Extends `Path`.
 */

var CircleMarker = Path.extend({

	// @section
	// @aka CircleMarker options
	options: {
		fill: true,

		// @option radius: Number = 10
		// Radius of the circle marker, in pixels
		radius: 10
	},

	initialize: function (latlng, options) {
		setOptions(this, options);
		this._latlng = toLatLng(latlng);
		this._radius = this.options.radius;
	},

	// @method setLatLng(latLng: LatLng): this
	// Sets the position of a circle marker to a new location.
	setLatLng: function (latlng) {
		this._latlng = toLatLng(latlng);
		this.redraw();
		return this.fire('move', {latlng: this._latlng});
	},

	// @method getLatLng(): LatLng
	// Returns the current geographical position of the circle marker
	getLatLng: function () {
		return this._latlng;
	},

	// @method setRadius(radius: Number): this
	// Sets the radius of a circle marker. Units are in pixels.
	setRadius: function (radius) {
		this.options.radius = this._radius = radius;
		return this.redraw();
	},

	// @method getRadius(): Number
	// Returns the current radius of the circle
	getRadius: function () {
		return this._radius;
	},

	setStyle : function (options) {
		var radius = options && options.radius || this._radius;
		Path.prototype.setStyle.call(this, options);
		this.setRadius(radius);
		return this;
	},

	_project: function () {
		this._point = this._map.latLngToLayerPoint(this._latlng);
		this._updateBounds();
	},

	_updateBounds: function () {
		var r = this._radius,
		    r2 = this._radiusY || r,
		    w = this._clickTolerance(),
		    p = [r + w, r2 + w];
		this._pxBounds = new Bounds(this._point.subtract(p), this._point.add(p));
	},

	_update: function () {
		if (this._map) {
			this._updatePath();
		}
	},

	_updatePath: function () {
		this._renderer._updateCircle(this);
	},

	_empty: function () {
		return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
	},

	// Needed by the `Canvas` renderer for interactivity
	_containsPoint: function (p) {
		return p.distanceTo(this._point) <= this._radius + this._clickTolerance();
	}
});


// @factory L.circleMarker(latlng: LatLng, options?: CircleMarker options)
// Instantiates a circle marker object given a geographical point, and an optional options object.
function circleMarker(latlng, options) {
	return new CircleMarker(latlng, options);
}

/*
 * @class Circle
 * @aka L.Circle
 * @inherits CircleMarker
 *
 * A class for drawing circle overlays on a map. Extends `CircleMarker`.
 *
 * It's an approximation and starts to diverge from a real circle closer to poles (due to projection distortion).
 *
 * @example
 *
 * ```js
 * L.circle([50.5, 30.5], {radius: 200}).addTo(map);
 * ```
 */

var Circle = CircleMarker.extend({

	initialize: function (latlng, options, legacyOptions) {
		if (typeof options === 'number') {
			// Backwards compatibility with 0.7.x factory (latlng, radius, options?)
			options = extend({}, legacyOptions, {radius: options});
		}
		setOptions(this, options);
		this._latlng = toLatLng(latlng);

		if (isNaN(this.options.radius)) { throw new Error('Circle radius cannot be NaN'); }

		// @section
		// @aka Circle options
		// @option radius: Number; Radius of the circle, in meters.
		this._mRadius = this.options.radius;
	},

	// @method setRadius(radius: Number): this
	// Sets the radius of a circle. Units are in meters.
	setRadius: function (radius) {
		this._mRadius = radius;
		return this.redraw();
	},

	// @method getRadius(): Number
	// Returns the current radius of a circle. Units are in meters.
	getRadius: function () {
		return this._mRadius;
	},

	// @method getBounds(): LatLngBounds
	// Returns the `LatLngBounds` of the path.
	getBounds: function () {
		var half = [this._radius, this._radiusY || this._radius];

		return new LatLngBounds(
			this._map.layerPointToLatLng(this._point.subtract(half)),
			this._map.layerPointToLatLng(this._point.add(half)));
	},

	setStyle: Path.prototype.setStyle,

	_project: function () {

		var lng = this._latlng.lng,
		    lat = this._latlng.lat,
		    map = this._map,
		    crs = map.options.crs;

		if (crs.distance === Earth.distance) {
			var d = Math.PI / 180,
			    latR = (this._mRadius / Earth.R) / d,
			    top = map.project([lat + latR, lng]),
			    bottom = map.project([lat - latR, lng]),
			    p = top.add(bottom).divideBy(2),
			    lat2 = map.unproject(p).lat,
			    lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
			            (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;

			if (isNaN(lngR) || lngR === 0) {
				lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
			}

			this._point = p.subtract(map.getPixelOrigin());
			this._radius = isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x;
			this._radiusY = p.y - top.y;

		} else {
			var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));

			this._point = map.latLngToLayerPoint(this._latlng);
			this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
		}

		this._updateBounds();
	}
});

// @factory L.circle(latlng: LatLng, options?: Circle options)
// Instantiates a circle object given a geographical point, and an options object
// which contains the circle radius.
// @alternative
// @factory L.circle(latlng: LatLng, radius: Number, options?: Circle options)
// Obsolete way of instantiating a circle, for compatibility with 0.7.x code.
// Do not use in new applications or plugins.
function circle(latlng, options, legacyOptions) {
	return new Circle(latlng, options, legacyOptions);
}

/*
 * @class Polyline
 * @aka L.Polyline
 * @inherits Path
 *
 * A class for drawing polyline overlays on a map. Extends `Path`.
 *
 * @example
 *
 * ```js
 * // create a red polyline from an array of LatLng points
 * var latlngs = [
 * 	[45.51, -122.68],
 * 	[37.77, -122.43],
 * 	[34.04, -118.2]
 * ];
 *
 * var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
 *
 * // zoom the map to the polyline
 * map.fitBounds(polyline.getBounds());
 * ```
 *
 * You can also pass a multi-dimensional array to represent a `MultiPolyline` shape:
 *
 * ```js
 * // create a red polyline from an array of arrays of LatLng points
 * var latlngs = [
 * 	[[45.51, -122.68],
 * 	 [37.77, -122.43],
 * 	 [34.04, -118.2]],
 * 	[[40.78, -73.91],
 * 	 [41.83, -87.62],
 * 	 [32.76, -96.72]]
 * ];
 * ```
 */


var Polyline = Path.extend({

	// @section
	// @aka Polyline options
	options: {
		// @option smoothFactor: Number = 1.0
		// How much to simplify the polyline on each zoom level. More means
		// better performance and smoother look, and less means more accurate representation.
		smoothFactor: 1.0,

		// @option noClip: Boolean = false
		// Disable polyline clipping.
		noClip: false
	},

	initialize: function (latlngs, options) {
		setOptions(this, options);
		this._setLatLngs(latlngs);
	},

	// @method getLatLngs(): LatLng[]
	// Returns an array of the points in the path, or nested arrays of points in case of multi-polyline.
	getLatLngs: function () {
		return this._latlngs;
	},

	// @method setLatLngs(latlngs: LatLng[]): this
	// Replaces all the points in the polyline with the given array of geographical points.
	setLatLngs: function (latlngs) {
		this._setLatLngs(latlngs);
		return this.redraw();
	},

	// @method isEmpty(): Boolean
	// Returns `true` if the Polyline has no LatLngs.
	isEmpty: function () {
		return !this._latlngs.length;
	},

	// @method closestLayerPoint(p: Point): Point
	// Returns the point closest to `p` on the Polyline.
	closestLayerPoint: function (p) {
		var minDistance = Infinity,
		    minPoint = null,
		    closest = _sqClosestPointOnSegment,
		    p1, p2;

		for (var j = 0, jLen = this._parts.length; j < jLen; j++) {
			var points = this._parts[j];

			for (var i = 1, len = points.length; i < len; i++) {
				p1 = points[i - 1];
				p2 = points[i];

				var sqDist = closest(p, p1, p2, true);

				if (sqDist < minDistance) {
					minDistance = sqDist;
					minPoint = closest(p, p1, p2);
				}
			}
		}
		if (minPoint) {
			minPoint.distance = Math.sqrt(minDistance);
		}
		return minPoint;
	},

	// @method getCenter(): LatLng
	// Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the polyline.
	getCenter: function () {
		// throws error when not yet added to map as this center calculation requires projected coordinates
		if (!this._map) {
			throw new Error('Must add layer to map before using getCenter()');
		}

		var i, halfDist, segDist, dist, p1, p2, ratio,
		    points = this._rings[0],
		    len = points.length;

		if (!len) { return null; }

		// polyline centroid algorithm; only uses the first ring if there are multiple

		for (i = 0, halfDist = 0; i < len - 1; i++) {
			halfDist += points[i].distanceTo(points[i + 1]) / 2;
		}

		// The line is so small in the current view that all points are on the same pixel.
		if (halfDist === 0) {
			return this._map.layerPointToLatLng(points[0]);
		}

		for (i = 0, dist = 0; i < len - 1; i++) {
			p1 = points[i];
			p2 = points[i + 1];
			segDist = p1.distanceTo(p2);
			dist += segDist;

			if (dist > halfDist) {
				ratio = (dist - halfDist) / segDist;
				return this._map.layerPointToLatLng([
					p2.x - ratio * (p2.x - p1.x),
					p2.y - ratio * (p2.y - p1.y)
				]);
			}
		}
	},

	// @method getBounds(): LatLngBounds
	// Returns the `LatLngBounds` of the path.
	getBounds: function () {
		return this._bounds;
	},

	// @method addLatLng(latlng: LatLng, latlngs? LatLng[]): this
	// Adds a given point to the polyline. By default, adds to the first ring of
	// the polyline in case of a multi-polyline, but can be overridden by passing
	// a specific ring as a LatLng array (that you can earlier access with [`getLatLngs`](#polyline-getlatlngs)).
	addLatLng: function (latlng, latlngs) {
		latlngs = latlngs || this._defaultShape();
		latlng = toLatLng(latlng);
		latlngs.push(latlng);
		this._bounds.extend(latlng);
		return this.redraw();
	},

	_setLatLngs: function (latlngs) {
		this._bounds = new LatLngBounds();
		this._latlngs = this._convertLatLngs(latlngs);
	},

	_defaultShape: function () {
		return isFlat(this._latlngs) ? this._latlngs : this._latlngs[0];
	},

	// recursively convert latlngs input into actual LatLng instances; calculate bounds along the way
	_convertLatLngs: function (latlngs) {
		var result = [],
		    flat = isFlat(latlngs);

		for (var i = 0, len = latlngs.length; i < len; i++) {
			if (flat) {
				result[i] = toLatLng(latlngs[i]);
				this._bounds.extend(result[i]);
			} else {
				result[i] = this._convertLatLngs(latlngs[i]);
			}
		}

		return result;
	},

	_project: function () {
		var pxBounds = new Bounds();
		this._rings = [];
		this._projectLatlngs(this._latlngs, this._rings, pxBounds);

		if (this._bounds.isValid() && pxBounds.isValid()) {
			this._rawPxBounds = pxBounds;
			this._updateBounds();
		}
	},

	_updateBounds: function () {
		var w = this._clickTolerance(),
		    p = new Point(w, w);
		this._pxBounds = new Bounds([
			this._rawPxBounds.min.subtract(p),
			this._rawPxBounds.max.add(p)
		]);
	},

	// recursively turns latlngs into a set of rings with projected coordinates
	_projectLatlngs: function (latlngs, result, projectedBounds) {
		var flat = latlngs[0] instanceof LatLng,
		    len = latlngs.length,
		    i, ring;

		if (flat) {
			ring = [];
			for (i = 0; i < len; i++) {
				ring[i] = this._map.latLngToLayerPoint(latlngs[i]);
				projectedBounds.extend(ring[i]);
			}
			result.push(ring);
		} else {
			for (i = 0; i < len; i++) {
				this._projectLatlngs(latlngs[i], result, projectedBounds);
			}
		}
	},

	// clip polyline by renderer bounds so that we have less to render for performance
	_clipPoints: function () {
		var bounds = this._renderer._bounds;

		this._parts = [];
		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
			return;
		}

		if (this.options.noClip) {
			this._parts = this._rings;
			return;
		}

		var parts = this._parts,
		    i, j, k, len, len2, segment, points;

		for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
			points = this._rings[i];

			for (j = 0, len2 = points.length; j < len2 - 1; j++) {
				segment = clipSegment(points[j], points[j + 1], bounds, j, true);

				if (!segment) { continue; }

				parts[k] = parts[k] || [];
				parts[k].push(segment[0]);

				// if segment goes out of screen, or it's the last one, it's the end of the line part
				if ((segment[1] !== points[j + 1]) || (j === len2 - 2)) {
					parts[k].push(segment[1]);
					k++;
				}
			}
		}
	},

	// simplify each clipped part of the polyline for performance
	_simplifyPoints: function () {
		var parts = this._parts,
		    tolerance = this.options.smoothFactor;

		for (var i = 0, len = parts.length; i < len; i++) {
			parts[i] = simplify(parts[i], tolerance);
		}
	},

	_update: function () {
		if (!this._map) { return; }

		this._clipPoints();
		this._simplifyPoints();
		this._updatePath();
	},

	_updatePath: function () {
		this._renderer._updatePoly(this);
	},

	// Needed by the `Canvas` renderer for interactivity
	_containsPoint: function (p, closed) {
		var i, j, k, len, len2, part,
		    w = this._clickTolerance();

		if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

		// hit detection for polylines
		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];

			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				if (!closed && (j === 0)) { continue; }

				if (pointToSegmentDistance(p, part[k], part[j]) <= w) {
					return true;
				}
			}
		}
		return false;
	}
});

// @factory L.polyline(latlngs: LatLng[], options?: Polyline options)
// Instantiates a polyline object given an array of geographical points and
// optionally an options object. You can create a `Polyline` object with
// multiple separate lines (`MultiPolyline`) by passing an array of arrays
// of geographic points.
function polyline(latlngs, options) {
	return new Polyline(latlngs, options);
}

// Retrocompat. Allow plugins to support Leaflet versions before and after 1.1.
Polyline._flat = _flat;

/*
 * @class Polygon
 * @aka L.Polygon
 * @inherits Polyline
 *
 * A class for drawing polygon overlays on a map. Extends `Polyline`.
 *
 * Note that points you pass when creating a polygon shouldn't have an additional last point equal to the first one — it's better to filter out such points.
 *
 *
 * @example
 *
 * ```js
 * // create a red polygon from an array of LatLng points
 * var latlngs = [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]];
 *
 * var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);
 *
 * // zoom the map to the polygon
 * map.fitBounds(polygon.getBounds());
 * ```
 *
 * You can also pass an array of arrays of latlngs, with the first array representing the outer shape and the other arrays representing holes in the outer shape:
 *
 * ```js
 * var latlngs = [
 *   [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
 *   [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
 * ];
 * ```
 *
 * Additionally, you can pass a multi-dimensional array to represent a MultiPolygon shape.
 *
 * ```js
 * var latlngs = [
 *   [ // first polygon
 *     [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
 *     [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
 *   ],
 *   [ // second polygon
 *     [[41, -111.03],[45, -111.04],[45, -104.05],[41, -104.05]]
 *   ]
 * ];
 * ```
 */

var Polygon = Polyline.extend({

	options: {
		fill: true
	},

	isEmpty: function () {
		return !this._latlngs.length || !this._latlngs[0].length;
	},

	getCenter: function () {
		// throws error when not yet added to map as this center calculation requires projected coordinates
		if (!this._map) {
			throw new Error('Must add layer to map before using getCenter()');
		}

		var i, j, p1, p2, f, area, x, y, center,
		    points = this._rings[0],
		    len = points.length;

		if (!len) { return null; }

		// polygon centroid algorithm; only uses the first ring if there are multiple

		area = x = y = 0;

		for (i = 0, j = len - 1; i < len; j = i++) {
			p1 = points[i];
			p2 = points[j];

			f = p1.y * p2.x - p2.y * p1.x;
			x += (p1.x + p2.x) * f;
			y += (p1.y + p2.y) * f;
			area += f * 3;
		}

		if (area === 0) {
			// Polygon is so small that all points are on same pixel.
			center = points[0];
		} else {
			center = [x / area, y / area];
		}
		return this._map.layerPointToLatLng(center);
	},

	_convertLatLngs: function (latlngs) {
		var result = Polyline.prototype._convertLatLngs.call(this, latlngs),
		    len = result.length;

		// remove last point if it equals first one
		if (len >= 2 && result[0] instanceof LatLng && result[0].equals(result[len - 1])) {
			result.pop();
		}
		return result;
	},

	_setLatLngs: function (latlngs) {
		Polyline.prototype._setLatLngs.call(this, latlngs);
		if (isFlat(this._latlngs)) {
			this._latlngs = [this._latlngs];
		}
	},

	_defaultShape: function () {
		return isFlat(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
	},

	_clipPoints: function () {
		// polygons need a different clipping algorithm so we redefine that

		var bounds = this._renderer._bounds,
		    w = this.options.weight,
		    p = new Point(w, w);

		// increase clip padding by stroke width to avoid stroke on clip edges
		bounds = new Bounds(bounds.min.subtract(p), bounds.max.add(p));

		this._parts = [];
		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
			return;
		}

		if (this.options.noClip) {
			this._parts = this._rings;
			return;
		}

		for (var i = 0, len = this._rings.length, clipped; i < len; i++) {
			clipped = clipPolygon(this._rings[i], bounds, true);
			if (clipped.length) {
				this._parts.push(clipped);
			}
		}
	},

	_updatePath: function () {
		this._renderer._updatePoly(this, true);
	},

	// Needed by the `Canvas` renderer for interactivity
	_containsPoint: function (p) {
		var inside = false,
		    part, p1, p2, i, j, k, len, len2;

		if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

		// ray casting algorithm for detecting if point is in polygon
		for (i = 0, len = this._parts.length; i < len; i++) {
			part = this._parts[i];

			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
				p1 = part[j];
				p2 = part[k];

				if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
					inside = !inside;
				}
			}
		}

		// also check if it's on polygon stroke
		return inside || Polyline.prototype._containsPoint.call(this, p, true);
	}

});


// @factory L.polygon(latlngs: LatLng[], options?: Polyline options)
function polygon(latlngs, options) {
	return new Polygon(latlngs, options);
}

/*
 * @class GeoJSON
 * @aka L.GeoJSON
 * @inherits FeatureGroup
 *
 * Represents a GeoJSON object or an array of GeoJSON objects. Allows you to parse
 * GeoJSON data and display it on the map. Extends `FeatureGroup`.
 *
 * @example
 *
 * ```js
 * L.geoJSON(data, {
 * 	style: function (feature) {
 * 		return {color: feature.properties.color};
 * 	}
 * }).bindPopup(function (layer) {
 * 	return layer.feature.properties.description;
 * }).addTo(map);
 * ```
 */

var GeoJSON = FeatureGroup.extend({

	/* @section
	 * @aka GeoJSON options
	 *
	 * @option pointToLayer: Function = *
	 * A `Function` defining how GeoJSON points spawn Leaflet layers. It is internally
	 * called when data is added, passing the GeoJSON point feature and its `LatLng`.
	 * The default is to spawn a default `Marker`:
	 * ```js
	 * function(geoJsonPoint, latlng) {
	 * 	return L.marker(latlng);
	 * }
	 * ```
	 *
	 * @option style: Function = *
	 * A `Function` defining the `Path options` for styling GeoJSON lines and polygons,
	 * called internally when data is added.
	 * The default value is to not override any defaults:
	 * ```js
	 * function (geoJsonFeature) {
	 * 	return {}
	 * }
	 * ```
	 *
	 * @option onEachFeature: Function = *
	 * A `Function` that will be called once for each created `Feature`, after it has
	 * been created and styled. Useful for attaching events and popups to features.
	 * The default is to do nothing with the newly created layers:
	 * ```js
	 * function (feature, layer) {}
	 * ```
	 *
	 * @option filter: Function = *
	 * A `Function` that will be used to decide whether to include a feature or not.
	 * The default is to include all features:
	 * ```js
	 * function (geoJsonFeature) {
	 * 	return true;
	 * }
	 * ```
	 * Note: dynamically changing the `filter` option will have effect only on newly
	 * added data. It will _not_ re-evaluate already included features.
	 *
	 * @option coordsToLatLng: Function = *
	 * A `Function` that will be used for converting GeoJSON coordinates to `LatLng`s.
	 * The default is the `coordsToLatLng` static method.
	 */

	initialize: function (geojson, options) {
		setOptions(this, options);

		this._layers = {};

		if (geojson) {
			this.addData(geojson);
		}
	},

	// @method addData( <GeoJSON> data ): this
	// Adds a GeoJSON object to the layer.
	addData: function (geojson) {
		var features = isArray(geojson) ? geojson : geojson.features,
		    i, len, feature;

		if (features) {
			for (i = 0, len = features.length; i < len; i++) {
				// only add this if geometry or geometries are set and not null
				feature = features[i];
				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
					this.addData(feature);
				}
			}
			return this;
		}

		var options = this.options;

		if (options.filter && !options.filter(geojson)) { return this; }

		var layer = geometryToLayer(geojson, options);
		if (!layer) {
			return this;
		}
		layer.feature = asFeature(geojson);

		layer.defaultOptions = layer.options;
		this.resetStyle(layer);

		if (options.onEachFeature) {
			options.onEachFeature(geojson, layer);
		}

		return this.addLayer(layer);
	},

	// @method resetStyle( <Path> layer ): this
	// Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
	resetStyle: function (layer) {
		// reset any custom styles
		layer.options = extend({}, layer.defaultOptions);
		this._setLayerStyle(layer, this.options.style);
		return this;
	},

	// @method setStyle( <Function> style ): this
	// Changes styles of GeoJSON vector layers with the given style function.
	setStyle: function (style) {
		return this.eachLayer(function (layer) {
			this._setLayerStyle(layer, style);
		}, this);
	},

	_setLayerStyle: function (layer, style) {
		if (layer.setStyle) {
			if (typeof style === 'function') {
				style = style(layer.feature);
			}
			layer.setStyle(style);
		}
	}
});

// @section
// There are several static functions which can be called without instantiating L.GeoJSON:

// @function geometryToLayer(featureData: Object, options?: GeoJSON options): Layer
// Creates a `Layer` from a given GeoJSON feature. Can use a custom
// [`pointToLayer`](#geojson-pointtolayer) and/or [`coordsToLatLng`](#geojson-coordstolatlng)
// functions if provided as options.
function geometryToLayer(geojson, options) {

	var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
	    coords = geometry ? geometry.coordinates : null,
	    layers = [],
	    pointToLayer = options && options.pointToLayer,
	    _coordsToLatLng = options && options.coordsToLatLng || coordsToLatLng,
	    latlng, latlngs, i, len;

	if (!coords && !geometry) {
		return null;
	}

	switch (geometry.type) {
	case 'Point':
		latlng = _coordsToLatLng(coords);
		return pointToLayer ? pointToLayer(geojson, latlng) : new Marker(latlng);

	case 'MultiPoint':
		for (i = 0, len = coords.length; i < len; i++) {
			latlng = _coordsToLatLng(coords[i]);
			layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new Marker(latlng));
		}
		return new FeatureGroup(layers);

	case 'LineString':
	case 'MultiLineString':
		latlngs = coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, _coordsToLatLng);
		return new Polyline(latlngs, options);

	case 'Polygon':
	case 'MultiPolygon':
		latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, _coordsToLatLng);
		return new Polygon(latlngs, options);

	case 'GeometryCollection':
		for (i = 0, len = geometry.geometries.length; i < len; i++) {
			var layer = geometryToLayer({
				geometry: geometry.geometries[i],
				type: 'Feature',
				properties: geojson.properties
			}, options);

			if (layer) {
				layers.push(layer);
			}
		}
		return new FeatureGroup(layers);

	default:
		throw new Error('Invalid GeoJSON object.');
	}
}

// @function coordsToLatLng(coords: Array): LatLng
// Creates a `LatLng` object from an array of 2 numbers (longitude, latitude)
// or 3 numbers (longitude, latitude, altitude) used in GeoJSON for points.
function coordsToLatLng(coords) {
	return new LatLng(coords[1], coords[0], coords[2]);
}

// @function coordsToLatLngs(coords: Array, levelsDeep?: Number, coordsToLatLng?: Function): Array
// Creates a multidimensional array of `LatLng`s from a GeoJSON coordinates array.
// `levelsDeep` specifies the nesting level (0 is for an array of points, 1 for an array of arrays of points, etc., 0 by default).
// Can use a custom [`coordsToLatLng`](#geojson-coordstolatlng) function.
function coordsToLatLngs(coords, levelsDeep, _coordsToLatLng) {
	var latlngs = [];

	for (var i = 0, len = coords.length, latlng; i < len; i++) {
		latlng = levelsDeep ?
			coordsToLatLngs(coords[i], levelsDeep - 1, _coordsToLatLng) :
			(_coordsToLatLng || coordsToLatLng)(coords[i]);

		latlngs.push(latlng);
	}

	return latlngs;
}

// @function latLngToCoords(latlng: LatLng, precision?: Number): Array
// Reverse of [`coordsToLatLng`](#geojson-coordstolatlng)
function latLngToCoords(latlng, precision) {
	precision = typeof precision === 'number' ? precision : 6;
	return latlng.alt !== undefined ?
		[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision), formatNum(latlng.alt, precision)] :
		[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision)];
}

// @function latLngsToCoords(latlngs: Array, levelsDeep?: Number, closed?: Boolean): Array
// Reverse of [`coordsToLatLngs`](#geojson-coordstolatlngs)
// `closed` determines whether the first point should be appended to the end of the array to close the feature, only used when `levelsDeep` is 0. False by default.
function latLngsToCoords(latlngs, levelsDeep, closed, precision) {
	var coords = [];

	for (var i = 0, len = latlngs.length; i < len; i++) {
		coords.push(levelsDeep ?
			latLngsToCoords(latlngs[i], levelsDeep - 1, closed, precision) :
			latLngToCoords(latlngs[i], precision));
	}

	if (!levelsDeep && closed) {
		coords.push(coords[0]);
	}

	return coords;
}

function getFeature(layer, newGeometry) {
	return layer.feature ?
		extend({}, layer.feature, {geometry: newGeometry}) :
		asFeature(newGeometry);
}

// @function asFeature(geojson: Object): Object
// Normalize GeoJSON geometries/features into GeoJSON features.
function asFeature(geojson) {
	if (geojson.type === 'Feature' || geojson.type === 'FeatureCollection') {
		return geojson;
	}

	return {
		type: 'Feature',
		properties: {},
		geometry: geojson
	};
}

var PointToGeoJSON = {
	toGeoJSON: function (precision) {
		return getFeature(this, {
			type: 'Point',
			coordinates: latLngToCoords(this.getLatLng(), precision)
		});
	}
};

// @namespace Marker
// @method toGeoJSON(precision?: Number): Object
// `precision` is the number of decimal places for coordinates.
// The default value is 6 places.
// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the marker (as a GeoJSON `Point` Feature).
Marker.include(PointToGeoJSON);

// @namespace CircleMarker
// @method toGeoJSON(precision?: Number): Object
// `precision` is the number of decimal places for coordinates.
// The default value is 6 places.
// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the circle marker (as a GeoJSON `Point` Feature).
Circle.include(PointToGeoJSON);
CircleMarker.include(PointToGeoJSON);


// @namespace Polyline
// @method toGeoJSON(precision?: Number): Object
// `precision` is the number of decimal places for coordinates.
// The default value is 6 places.
// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polyline (as a GeoJSON `LineString` or `MultiLineString` Feature).
Polyline.include({
	toGeoJSON: function (precision) {
		var multi = !isFlat(this._latlngs);

		var coords = latLngsToCoords(this._latlngs, multi ? 1 : 0, false, precision);

		return getFeature(this, {
			type: (multi ? 'Multi' : '') + 'LineString',
			coordinates: coords
		});
	}
});

// @namespace Polygon
// @method toGeoJSON(precision?: Number): Object
// `precision` is the number of decimal places for coordinates.
// The default value is 6 places.
// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polygon (as a GeoJSON `Polygon` or `MultiPolygon` Feature).
Polygon.include({
	toGeoJSON: function (precision) {
		var holes = !isFlat(this._latlngs),
		    multi = holes && !isFlat(this._latlngs[0]);

		var coords = latLngsToCoords(this._latlngs, multi ? 2 : holes ? 1 : 0, true, precision);

		if (!holes) {
			coords = [coords];
		}

		return getFeature(this, {
			type: (multi ? 'Multi' : '') + 'Polygon',
			coordinates: coords
		});
	}
});


// @namespace LayerGroup
LayerGroup.include({
	toMultiPoint: function (precision) {
		var coords = [];

		this.eachLayer(function (layer) {
			coords.push(layer.toGeoJSON(precision).geometry.coordinates);
		});

		return getFeature(this, {
			type: 'MultiPoint',
			coordinates: coords
		});
	},

	// @method toGeoJSON(precision?: Number): Object
	// `precision` is the number of decimal places for coordinates.
	// The default value is 6 places.
	// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the layer group (as a GeoJSON `FeatureCollection`, `GeometryCollection`, or `MultiPoint`).
	toGeoJSON: function (precision) {

		var type = this.feature && this.feature.geometry && this.feature.geometry.type;

		if (type === 'MultiPoint') {
			return this.toMultiPoint(precision);
		}

		var isGeometryCollection = type === 'GeometryCollection',
		    jsons = [];

		this.eachLayer(function (layer) {
			if (layer.toGeoJSON) {
				var json = layer.toGeoJSON(precision);
				if (isGeometryCollection) {
					jsons.push(json.geometry);
				} else {
					var feature = asFeature(json);
					// Squash nested feature collections
					if (feature.type === 'FeatureCollection') {
						jsons.push.apply(jsons, feature.features);
					} else {
						jsons.push(feature);
					}
				}
			}
		});

		if (isGeometryCollection) {
			return getFeature(this, {
				geometries: jsons,
				type: 'GeometryCollection'
			});
		}

		return {
			type: 'FeatureCollection',
			features: jsons
		};
	}
});

// @namespace GeoJSON
// @factory L.geoJSON(geojson?: Object, options?: GeoJSON options)
// Creates a GeoJSON layer. Optionally accepts an object in
// [GeoJSON format](https://tools.ietf.org/html/rfc7946) to display on the map
// (you can alternatively add it later with `addData` method) and an `options` object.
function geoJSON(geojson, options) {
	return new GeoJSON(geojson, options);
}

// Backward compatibility.
var geoJson = geoJSON;

/*
 * @class ImageOverlay
 * @aka L.ImageOverlay
 * @inherits Interactive layer
 *
 * Used to load and display a single image over specific bounds of the map. Extends `Layer`.
 *
 * @example
 *
 * ```js
 * var imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
 * 	imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
 * L.imageOverlay(imageUrl, imageBounds).addTo(map);
 * ```
 */

var ImageOverlay = Layer.extend({

	// @section
	// @aka ImageOverlay options
	options: {
		// @option opacity: Number = 1.0
		// The opacity of the image overlay.
		opacity: 1,

		// @option alt: String = ''
		// Text for the `alt` attribute of the image (useful for accessibility).
		alt: '',

		// @option interactive: Boolean = false
		// If `true`, the image overlay will emit [mouse events](#interactive-layer) when clicked or hovered.
		interactive: false,

		// @option crossOrigin: Boolean|String = false
		// Whether the crossOrigin attribute will be added to the image.
		// If a String is provided, the image will have its crossOrigin attribute set to the String provided. This is needed if you want to access image pixel data.
		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
		crossOrigin: false,

		// @option errorOverlayUrl: String = ''
		// URL to the overlay image to show in place of the overlay that failed to load.
		errorOverlayUrl: '',

		// @option zIndex: Number = 1
		// The explicit [zIndex](https://developer.mozilla.org/docs/Web/CSS/CSS_Positioning/Understanding_z_index) of the overlay layer.
		zIndex: 1,

		// @option className: String = ''
		// A custom class name to assign to the image. Empty by default.
		className: ''
	},

	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
		this._url = url;
		this._bounds = toLatLngBounds(bounds);

		setOptions(this, options);
	},

	onAdd: function () {
		if (!this._image) {
			this._initImage();

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}

		if (this.options.interactive) {
			addClass(this._image, 'leaflet-interactive');
			this.addInteractiveTarget(this._image);
		}

		this.getPane().appendChild(this._image);
		this._reset();
	},

	onRemove: function () {
		remove(this._image);
		if (this.options.interactive) {
			this.removeInteractiveTarget(this._image);
		}
	},

	// @method setOpacity(opacity: Number): this
	// Sets the opacity of the overlay.
	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._image) {
			this._updateOpacity();
		}
		return this;
	},

	setStyle: function (styleOpts) {
		if (styleOpts.opacity) {
			this.setOpacity(styleOpts.opacity);
		}
		return this;
	},

	// @method bringToFront(): this
	// Brings the layer to the top of all overlays.
	bringToFront: function () {
		if (this._map) {
			toFront(this._image);
		}
		return this;
	},

	// @method bringToBack(): this
	// Brings the layer to the bottom of all overlays.
	bringToBack: function () {
		if (this._map) {
			toBack(this._image);
		}
		return this;
	},

	// @method setUrl(url: String): this
	// Changes the URL of the image.
	setUrl: function (url) {
		this._url = url;

		if (this._image) {
			this._image.src = url;
		}
		return this;
	},

	// @method setBounds(bounds: LatLngBounds): this
	// Update the bounds that this ImageOverlay covers
	setBounds: function (bounds) {
		this._bounds = toLatLngBounds(bounds);

		if (this._map) {
			this._reset();
		}
		return this;
	},

	getEvents: function () {
		var events = {
			zoom: this._reset,
			viewreset: this._reset
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},

	// @method setZIndex(value: Number): this
	// Changes the [zIndex](#imageoverlay-zindex) of the image overlay.
	setZIndex: function (value) {
		this.options.zIndex = value;
		this._updateZIndex();
		return this;
	},

	// @method getBounds(): LatLngBounds
	// Get the bounds that this ImageOverlay covers
	getBounds: function () {
		return this._bounds;
	},

	// @method getElement(): HTMLElement
	// Returns the instance of [`HTMLImageElement`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)
	// used by this overlay.
	getElement: function () {
		return this._image;
	},

	_initImage: function () {
		var wasElementSupplied = this._url.tagName === 'IMG';
		var img = this._image = wasElementSupplied ? this._url : create$1('img');

		addClass(img, 'leaflet-image-layer');
		if (this._zoomAnimated) { addClass(img, 'leaflet-zoom-animated'); }
		if (this.options.className) { addClass(img, this.options.className); }

		img.onselectstart = falseFn;
		img.onmousemove = falseFn;

		// @event load: Event
		// Fired when the ImageOverlay layer has loaded its image
		img.onload = bind(this.fire, this, 'load');
		img.onerror = bind(this._overlayOnError, this, 'error');

		if (this.options.crossOrigin || this.options.crossOrigin === '') {
			img.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
		}

		if (this.options.zIndex) {
			this._updateZIndex();
		}

		if (wasElementSupplied) {
			this._url = img.src;
			return;
		}

		img.src = this._url;
		img.alt = this.options.alt;
	},

	_animateZoom: function (e) {
		var scale = this._map.getZoomScale(e.zoom),
		    offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;

		setTransform(this._image, offset, scale);
	},

	_reset: function () {
		var image = this._image,
		    bounds = new Bounds(
		        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
		        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
		    size = bounds.getSize();

		setPosition(image, bounds.min);

		image.style.width  = size.x + 'px';
		image.style.height = size.y + 'px';
	},

	_updateOpacity: function () {
		setOpacity(this._image, this.options.opacity);
	},

	_updateZIndex: function () {
		if (this._image && this.options.zIndex !== undefined && this.options.zIndex !== null) {
			this._image.style.zIndex = this.options.zIndex;
		}
	},

	_overlayOnError: function () {
		// @event error: Event
		// Fired when the ImageOverlay layer fails to load its image
		this.fire('error');

		var errorUrl = this.options.errorOverlayUrl;
		if (errorUrl && this._url !== errorUrl) {
			this._url = errorUrl;
			this._image.src = errorUrl;
		}
	}
});

// @factory L.imageOverlay(imageUrl: String, bounds: LatLngBounds, options?: ImageOverlay options)
// Instantiates an image overlay object given the URL of the image and the
// geographical bounds it is tied to.
var imageOverlay = function (url, bounds, options) {
	return new ImageOverlay(url, bounds, options);
};

/*
 * @class VideoOverlay
 * @aka L.VideoOverlay
 * @inherits ImageOverlay
 *
 * Used to load and display a video player over specific bounds of the map. Extends `ImageOverlay`.
 *
 * A video overlay uses the [`<video>`](https://developer.mozilla.org/docs/Web/HTML/Element/video)
 * HTML5 element.
 *
 * @example
 *
 * ```js
 * var videoUrl = 'https://www.mapbox.com/bites/00188/patricia_nasa.webm',
 * 	videoBounds = [[ 32, -130], [ 13, -100]];
 * L.videoOverlay(videoUrl, videoBounds ).addTo(map);
 * ```
 */

var VideoOverlay = ImageOverlay.extend({

	// @section
	// @aka VideoOverlay options
	options: {
		// @option autoplay: Boolean = true
		// Whether the video starts playing automatically when loaded.
		autoplay: true,

		// @option loop: Boolean = true
		// Whether the video will loop back to the beginning when played.
		loop: true,

		// @option keepAspectRatio: Boolean = true
		// Whether the video will save aspect ratio after the projection.
		// Relevant for supported browsers. Browser compatibility- https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
		keepAspectRatio: true
	},

	_initImage: function () {
		var wasElementSupplied = this._url.tagName === 'VIDEO';
		var vid = this._image = wasElementSupplied ? this._url : create$1('video');

		addClass(vid, 'leaflet-image-layer');
		if (this._zoomAnimated) { addClass(vid, 'leaflet-zoom-animated'); }

		vid.onselectstart = falseFn;
		vid.onmousemove = falseFn;

		// @event load: Event
		// Fired when the video has finished loading the first frame
		vid.onloadeddata = bind(this.fire, this, 'load');

		if (wasElementSupplied) {
			var sourceElements = vid.getElementsByTagName('source');
			var sources = [];
			for (var j = 0; j < sourceElements.length; j++) {
				sources.push(sourceElements[j].src);
			}

			this._url = (sourceElements.length > 0) ? sources : [vid.src];
			return;
		}

		if (!isArray(this._url)) { this._url = [this._url]; }

		if (!this.options.keepAspectRatio && vid.style.hasOwnProperty('objectFit')) { vid.style['objectFit'] = 'fill'; }
		vid.autoplay = !!this.options.autoplay;
		vid.loop = !!this.options.loop;
		for (var i = 0; i < this._url.length; i++) {
			var source = create$1('source');
			source.src = this._url[i];
			vid.appendChild(source);
		}
	}

	// @method getElement(): HTMLVideoElement
	// Returns the instance of [`HTMLVideoElement`](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement)
	// used by this overlay.
});


// @factory L.videoOverlay(video: String|Array|HTMLVideoElement, bounds: LatLngBounds, options?: VideoOverlay options)
// Instantiates an image overlay object given the URL of the video (or array of URLs, or even a video element) and the
// geographical bounds it is tied to.

function videoOverlay(video, bounds, options) {
	return new VideoOverlay(video, bounds, options);
}

/*
 * @class SVGOverlay
 * @aka L.SVGOverlay
 * @inherits ImageOverlay
 *
 * Used to load, display and provide DOM access to an SVG file over specific bounds of the map. Extends `ImageOverlay`.
 *
 * An SVG overlay uses the [`<svg>`](https://developer.mozilla.org/docs/Web/SVG/Element/svg) element.
 *
 * @example
 *
 * ```js
 * var element = '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image xlink:href="https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png" height="200" width="200"/></svg>',
 * 		 elementBounds = [ [ 32, -130 ], [ 13, -100 ] ];
 * L.svgOverlay(element, elementBounds).addTo(map);
 * ```
 */

var SVGOverlay = ImageOverlay.extend({
	_initImage: function () {
		var el = this._image = this._url;

		addClass(el, 'leaflet-image-layer');
		if (this._zoomAnimated) { addClass(el, 'leaflet-zoom-animated'); }

		el.onselectstart = falseFn;
		el.onmousemove = falseFn;
	}

	// @method getElement(): SVGElement
	// Returns the instance of [`SVGElement`](https://developer.mozilla.org/docs/Web/API/SVGElement)
	// used by this overlay.
});


// @factory L.svgOverlay(svg: String|SVGElement, bounds: LatLngBounds, options?: SVGOverlay options)
// Instantiates an image overlay object given an SVG element and the geographical bounds it is tied to.
// A viewBox attribute is required on the SVG element to zoom in and out properly.

function svgOverlay(el, bounds, options) {
	return new SVGOverlay(el, bounds, options);
}

/*
 * @class DivOverlay
 * @inherits Layer
 * @aka L.DivOverlay
 * Base model for L.Popup and L.Tooltip. Inherit from it for custom popup like plugins.
 */

// @namespace DivOverlay
var DivOverlay = Layer.extend({

	// @section
	// @aka DivOverlay options
	options: {
		// @option offset: Point = Point(0, 7)
		// The offset of the popup position. Useful to control the anchor
		// of the popup when opening it on some overlays.
		offset: [0, 7],

		// @option className: String = ''
		// A custom CSS class name to assign to the popup.
		className: '',

		// @option pane: String = 'popupPane'
		// `Map pane` where the popup will be added.
		pane: 'popupPane'
	},

	initialize: function (options, source) {
		setOptions(this, options);

		this._source = source;
	},

	onAdd: function (map) {
		this._zoomAnimated = map._zoomAnimated;

		if (!this._container) {
			this._initLayout();
		}

		if (map._fadeAnimated) {
			setOpacity(this._container, 0);
		}

		clearTimeout(this._removeTimeout);
		this.getPane().appendChild(this._container);
		this.update();

		if (map._fadeAnimated) {
			setOpacity(this._container, 1);
		}

		this.bringToFront();
	},

	onRemove: function (map) {
		if (map._fadeAnimated) {
			setOpacity(this._container, 0);
			this._removeTimeout = setTimeout(bind(remove, undefined, this._container), 200);
		} else {
			remove(this._container);
		}
	},

	// @namespace Popup
	// @method getLatLng: LatLng
	// Returns the geographical point of popup.
	getLatLng: function () {
		return this._latlng;
	},

	// @method setLatLng(latlng: LatLng): this
	// Sets the geographical point where the popup will open.
	setLatLng: function (latlng) {
		this._latlng = toLatLng(latlng);
		if (this._map) {
			this._updatePosition();
			this._adjustPan();
		}
		return this;
	},

	// @method getContent: String|HTMLElement
	// Returns the content of the popup.
	getContent: function () {
		return this._content;
	},

	// @method setContent(htmlContent: String|HTMLElement|Function): this
	// Sets the HTML content of the popup. If a function is passed the source layer will be passed to the function. The function should return a `String` or `HTMLElement` to be used in the popup.
	setContent: function (content) {
		this._content = content;
		this.update();
		return this;
	},

	// @method getElement: String|HTMLElement
	// Alias for [getContent()](#popup-getcontent)
	getElement: function () {
		return this._container;
	},

	// @method update: null
	// Updates the popup content, layout and position. Useful for updating the popup after something inside changed, e.g. image loaded.
	update: function () {
		if (!this._map) { return; }

		this._container.style.visibility = 'hidden';

		this._updateContent();
		this._updateLayout();
		this._updatePosition();

		this._container.style.visibility = '';

		this._adjustPan();
	},

	getEvents: function () {
		var events = {
			zoom: this._updatePosition,
			viewreset: this._updatePosition
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}
		return events;
	},

	// @method isOpen: Boolean
	// Returns `true` when the popup is visible on the map.
	isOpen: function () {
		return !!this._map && this._map.hasLayer(this);
	},

	// @method bringToFront: this
	// Brings this popup in front of other popups (in the same map pane).
	bringToFront: function () {
		if (this._map) {
			toFront(this._container);
		}
		return this;
	},

	// @method bringToBack: this
	// Brings this popup to the back of other popups (in the same map pane).
	bringToBack: function () {
		if (this._map) {
			toBack(this._container);
		}
		return this;
	},

	_prepareOpen: function (parent, layer, latlng) {
		if (!(layer instanceof Layer)) {
			latlng = layer;
			layer = parent;
		}

		if (layer instanceof FeatureGroup) {
			for (var id in parent._layers) {
				layer = parent._layers[id];
				break;
			}
		}

		if (!latlng) {
			if (layer.getCenter) {
				latlng = layer.getCenter();
			} else if (layer.getLatLng) {
				latlng = layer.getLatLng();
			} else {
				throw new Error('Unable to get source layer LatLng.');
			}
		}

		// set overlay source to this layer
		this._source = layer;

		// update the overlay (content, layout, ect...)
		this.update();

		return latlng;
	},

	_updateContent: function () {
		if (!this._content) { return; }

		var node = this._contentNode;
		var content = (typeof this._content === 'function') ? this._content(this._source || this) : this._content;

		if (typeof content === 'string') {
			node.innerHTML = content;
		} else {
			while (node.hasChildNodes()) {
				node.removeChild(node.firstChild);
			}
			node.appendChild(content);
		}
		this.fire('contentupdate');
	},

	_updatePosition: function () {
		if (!this._map) { return; }

		var pos = this._map.latLngToLayerPoint(this._latlng),
		    offset = toPoint(this.options.offset),
		    anchor = this._getAnchor();

		if (this._zoomAnimated) {
			setPosition(this._container, pos.add(anchor));
		} else {
			offset = offset.add(pos).add(anchor);
		}

		var bottom = this._containerBottom = -offset.y,
		    left = this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x;

		// bottom position the popup in case the height of the popup changes (images loading etc)
		this._container.style.bottom = bottom + 'px';
		this._container.style.left = left + 'px';
	},

	_getAnchor: function () {
		return [0, 0];
	}

});

/*
 * @class Popup
 * @inherits DivOverlay
 * @aka L.Popup
 * Used to open popups in certain places of the map. Use [Map.openPopup](#map-openpopup) to
 * open popups while making sure that only one popup is open at one time
 * (recommended for usability), or use [Map.addLayer](#map-addlayer) to open as many as you want.
 *
 * @example
 *
 * If you want to just bind a popup to marker click and then open it, it's really easy:
 *
 * ```js
 * marker.bindPopup(popupContent).openPopup();
 * ```
 * Path overlays like polylines also have a `bindPopup` method.
 * Here's a more complicated way to open a popup on a map:
 *
 * ```js
 * var popup = L.popup()
 * 	.setLatLng(latlng)
 * 	.setContent('<p>Hello world!<br />This is a nice popup.</p>')
 * 	.openOn(map);
 * ```
 */


// @namespace Popup
var Popup = DivOverlay.extend({

	// @section
	// @aka Popup options
	options: {
		// @option maxWidth: Number = 300
		// Max width of the popup, in pixels.
		maxWidth: 300,

		// @option minWidth: Number = 50
		// Min width of the popup, in pixels.
		minWidth: 50,

		// @option maxHeight: Number = null
		// If set, creates a scrollable container of the given height
		// inside a popup if its content exceeds it.
		maxHeight: null,

		// @option autoPan: Boolean = true
		// Set it to `false` if you don't want the map to do panning animation
		// to fit the opened popup.
		autoPan: true,

		// @option autoPanPaddingTopLeft: Point = null
		// The margin between the popup and the top left corner of the map
		// view after autopanning was performed.
		autoPanPaddingTopLeft: null,

		// @option autoPanPaddingBottomRight: Point = null
		// The margin between the popup and the bottom right corner of the map
		// view after autopanning was performed.
		autoPanPaddingBottomRight: null,

		// @option autoPanPadding: Point = Point(5, 5)
		// Equivalent of setting both top left and bottom right autopan padding to the same value.
		autoPanPadding: [5, 5],

		// @option keepInView: Boolean = false
		// Set it to `true` if you want to prevent users from panning the popup
		// off of the screen while it is open.
		keepInView: false,

		// @option closeButton: Boolean = true
		// Controls the presence of a close button in the popup.
		closeButton: true,

		// @option autoClose: Boolean = true
		// Set it to `false` if you want to override the default behavior of
		// the popup closing when another popup is opened.
		autoClose: true,

		// @option closeOnEscapeKey: Boolean = true
		// Set it to `false` if you want to override the default behavior of
		// the ESC key for closing of the popup.
		closeOnEscapeKey: true,

		// @option closeOnClick: Boolean = *
		// Set it if you want to override the default behavior of the popup closing when user clicks
		// on the map. Defaults to the map's [`closePopupOnClick`](#map-closepopuponclick) option.

		// @option className: String = ''
		// A custom CSS class name to assign to the popup.
		className: ''
	},

	// @namespace Popup
	// @method openOn(map: Map): this
	// Adds the popup to the map and closes the previous one. The same as `map.openPopup(popup)`.
	openOn: function (map) {
		map.openPopup(this);
		return this;
	},

	onAdd: function (map) {
		DivOverlay.prototype.onAdd.call(this, map);

		// @namespace Map
		// @section Popup events
		// @event popupopen: PopupEvent
		// Fired when a popup is opened in the map
		map.fire('popupopen', {popup: this});

		if (this._source) {
			// @namespace Layer
			// @section Popup events
			// @event popupopen: PopupEvent
			// Fired when a popup bound to this layer is opened
			this._source.fire('popupopen', {popup: this}, true);
			// For non-path layers, we toggle the popup when clicking
			// again the layer, so prevent the map to reopen it.
			if (!(this._source instanceof Path)) {
				this._source.on('preclick', stopPropagation);
			}
		}
	},

	onRemove: function (map) {
		DivOverlay.prototype.onRemove.call(this, map);

		// @namespace Map
		// @section Popup events
		// @event popupclose: PopupEvent
		// Fired when a popup in the map is closed
		map.fire('popupclose', {popup: this});

		if (this._source) {
			// @namespace Layer
			// @section Popup events
			// @event popupclose: PopupEvent
			// Fired when a popup bound to this layer is closed
			this._source.fire('popupclose', {popup: this}, true);
			if (!(this._source instanceof Path)) {
				this._source.off('preclick', stopPropagation);
			}
		}
	},

	getEvents: function () {
		var events = DivOverlay.prototype.getEvents.call(this);

		if (this.options.closeOnClick !== undefined ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
			events.preclick = this._close;
		}

		if (this.options.keepInView) {
			events.moveend = this._adjustPan;
		}

		return events;
	},

	_close: function () {
		if (this._map) {
			this._map.closePopup(this);
		}
	},

	_initLayout: function () {
		var prefix = 'leaflet-popup',
		    container = this._container = create$1('div',
			prefix + ' ' + (this.options.className || '') +
			' leaflet-zoom-animated');

		var wrapper = this._wrapper = create$1('div', prefix + '-content-wrapper', container);
		this._contentNode = create$1('div', prefix + '-content', wrapper);

		disableClickPropagation(wrapper);
		disableScrollPropagation(this._contentNode);
		on(wrapper, 'contextmenu', stopPropagation);

		this._tipContainer = create$1('div', prefix + '-tip-container', container);
		this._tip = create$1('div', prefix + '-tip', this._tipContainer);

		if (this.options.closeButton) {
			var closeButton = this._closeButton = create$1('a', prefix + '-close-button', container);
			closeButton.href = '#close';
			closeButton.innerHTML = '&#215;';

			on(closeButton, 'click', this._onCloseButtonClick, this);
		}
	},

	_updateLayout: function () {
		var container = this._contentNode,
		    style = container.style;

		style.width = '';
		style.whiteSpace = 'nowrap';

		var width = container.offsetWidth;
		width = Math.min(width, this.options.maxWidth);
		width = Math.max(width, this.options.minWidth);

		style.width = (width + 1) + 'px';
		style.whiteSpace = '';

		style.height = '';

		var height = container.offsetHeight,
		    maxHeight = this.options.maxHeight,
		    scrolledClass = 'leaflet-popup-scrolled';

		if (maxHeight && height > maxHeight) {
			style.height = maxHeight + 'px';
			addClass(container, scrolledClass);
		} else {
			removeClass(container, scrolledClass);
		}

		this._containerWidth = this._container.offsetWidth;
	},

	_animateZoom: function (e) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center),
		    anchor = this._getAnchor();
		setPosition(this._container, pos.add(anchor));
	},

	_adjustPan: function () {
		if (!this.options.autoPan) { return; }
		if (this._map._panAnim) { this._map._panAnim.stop(); }

		var map = this._map,
		    marginBottom = parseInt(getStyle(this._container, 'marginBottom'), 10) || 0,
		    containerHeight = this._container.offsetHeight + marginBottom,
		    containerWidth = this._containerWidth,
		    layerPos = new Point(this._containerLeft, -containerHeight - this._containerBottom);

		layerPos._add(getPosition(this._container));

		var containerPos = map.layerPointToContainerPoint(layerPos),
		    padding = toPoint(this.options.autoPanPadding),
		    paddingTL = toPoint(this.options.autoPanPaddingTopLeft || padding),
		    paddingBR = toPoint(this.options.autoPanPaddingBottomRight || padding),
		    size = map.getSize(),
		    dx = 0,
		    dy = 0;

		if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
			dx = containerPos.x + containerWidth - size.x + paddingBR.x;
		}
		if (containerPos.x - dx - paddingTL.x < 0) { // left
			dx = containerPos.x - paddingTL.x;
		}
		if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
			dy = containerPos.y + containerHeight - size.y + paddingBR.y;
		}
		if (containerPos.y - dy - paddingTL.y < 0) { // top
			dy = containerPos.y - paddingTL.y;
		}

		// @namespace Map
		// @section Popup events
		// @event autopanstart: Event
		// Fired when the map starts autopanning when opening a popup.
		if (dx || dy) {
			map
			    .fire('autopanstart')
			    .panBy([dx, dy]);
		}
	},

	_onCloseButtonClick: function (e) {
		this._close();
		stop(e);
	},

	_getAnchor: function () {
		// Where should we anchor the popup on the source layer?
		return toPoint(this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]);
	}

});

// @namespace Popup
// @factory L.popup(options?: Popup options, source?: Layer)
// Instantiates a `Popup` object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the popup with a reference to the Layer to which it refers.
var popup = function (options, source) {
	return new Popup(options, source);
};


/* @namespace Map
 * @section Interaction Options
 * @option closePopupOnClick: Boolean = true
 * Set it to `false` if you don't want popups to close when user clicks the map.
 */
Map.mergeOptions({
	closePopupOnClick: true
});


// @namespace Map
// @section Methods for Layers and Controls
Map.include({
	// @method openPopup(popup: Popup): this
	// Opens the specified popup while closing the previously opened (to make sure only one is opened at one time for usability).
	// @alternative
	// @method openPopup(content: String|HTMLElement, latlng: LatLng, options?: Popup options): this
	// Creates a popup with the specified content and options and opens it in the given point on a map.
	openPopup: function (popup, latlng, options) {
		if (!(popup instanceof Popup)) {
			popup = new Popup(options).setContent(popup);
		}

		if (latlng) {
			popup.setLatLng(latlng);
		}

		if (this.hasLayer(popup)) {
			return this;
		}

		if (this._popup && this._popup.options.autoClose) {
			this.closePopup();
		}

		this._popup = popup;
		return this.addLayer(popup);
	},

	// @method closePopup(popup?: Popup): this
	// Closes the popup previously opened with [openPopup](#map-openpopup) (or the given one).
	closePopup: function (popup) {
		if (!popup || popup === this._popup) {
			popup = this._popup;
			this._popup = null;
		}
		if (popup) {
			this.removeLayer(popup);
		}
		return this;
	}
});

/*
 * @namespace Layer
 * @section Popup methods example
 *
 * All layers share a set of methods convenient for binding popups to it.
 *
 * ```js
 * var layer = L.Polygon(latlngs).bindPopup('Hi There!').addTo(map);
 * layer.openPopup();
 * layer.closePopup();
 * ```
 *
 * Popups will also be automatically opened when the layer is clicked on and closed when the layer is removed from the map or another popup is opened.
 */

// @section Popup methods
Layer.include({

	// @method bindPopup(content: String|HTMLElement|Function|Popup, options?: Popup options): this
	// Binds a popup to the layer with the passed `content` and sets up the
	// necessary event listeners. If a `Function` is passed it will receive
	// the layer as the first argument and should return a `String` or `HTMLElement`.
	bindPopup: function (content, options) {

		if (content instanceof Popup) {
			setOptions(content, options);
			this._popup = content;
			content._source = this;
		} else {
			if (!this._popup || options) {
				this._popup = new Popup(options, this);
			}
			this._popup.setContent(content);
		}

		if (!this._popupHandlersAdded) {
			this.on({
				click: this._openPopup,
				keypress: this._onKeyPress,
				remove: this.closePopup,
				move: this._movePopup
			});
			this._popupHandlersAdded = true;
		}

		return this;
	},

	// @method unbindPopup(): this
	// Removes the popup previously bound with `bindPopup`.
	unbindPopup: function () {
		if (this._popup) {
			this.off({
				click: this._openPopup,
				keypress: this._onKeyPress,
				remove: this.closePopup,
				move: this._movePopup
			});
			this._popupHandlersAdded = false;
			this._popup = null;
		}
		return this;
	},

	// @method openPopup(latlng?: LatLng): this
	// Opens the bound popup at the specified `latlng` or at the default popup anchor if no `latlng` is passed.
	openPopup: function (layer, latlng) {
		if (this._popup && this._map) {
			latlng = this._popup._prepareOpen(this, layer, latlng);

			// open the popup on the map
			this._map.openPopup(this._popup, latlng);
		}

		return this;
	},

	// @method closePopup(): this
	// Closes the popup bound to this layer if it is open.
	closePopup: function () {
		if (this._popup) {
			this._popup._close();
		}
		return this;
	},

	// @method togglePopup(): this
	// Opens or closes the popup bound to this layer depending on its current state.
	togglePopup: function (target) {
		if (this._popup) {
			if (this._popup._map) {
				this.closePopup();
			} else {
				this.openPopup(target);
			}
		}
		return this;
	},

	// @method isPopupOpen(): boolean
	// Returns `true` if the popup bound to this layer is currently open.
	isPopupOpen: function () {
		return (this._popup ? this._popup.isOpen() : false);
	},

	// @method setPopupContent(content: String|HTMLElement|Popup): this
	// Sets the content of the popup bound to this layer.
	setPopupContent: function (content) {
		if (this._popup) {
			this._popup.setContent(content);
		}
		return this;
	},

	// @method getPopup(): Popup
	// Returns the popup bound to this layer.
	getPopup: function () {
		return this._popup;
	},

	_openPopup: function (e) {
		var layer = e.layer || e.target;

		if (!this._popup) {
			return;
		}

		if (!this._map) {
			return;
		}

		// prevent map click
		stop(e);

		// if this inherits from Path its a vector and we can just
		// open the popup at the new location
		if (layer instanceof Path) {
			this.openPopup(e.layer || e.target, e.latlng);
			return;
		}

		// otherwise treat it like a marker and figure out
		// if we should toggle it open/closed
		if (this._map.hasLayer(this._popup) && this._popup._source === layer) {
			this.closePopup();
		} else {
			this.openPopup(layer, e.latlng);
		}
	},

	_movePopup: function (e) {
		this._popup.setLatLng(e.latlng);
	},

	_onKeyPress: function (e) {
		if (e.originalEvent.keyCode === 13) {
			this._openPopup(e);
		}
	}
});

/*
 * @class Tooltip
 * @inherits DivOverlay
 * @aka L.Tooltip
 * Used to display small texts on top of map layers.
 *
 * @example
 *
 * ```js
 * marker.bindTooltip("my tooltip text").openTooltip();
 * ```
 * Note about tooltip offset. Leaflet takes two options in consideration
 * for computing tooltip offsetting:
 * - the `offset` Tooltip option: it defaults to [0, 0], and it's specific to one tooltip.
 *   Add a positive x offset to move the tooltip to the right, and a positive y offset to
 *   move it to the bottom. Negatives will move to the left and top.
 * - the `tooltipAnchor` Icon option: this will only be considered for Marker. You
 *   should adapt this value if you use a custom icon.
 */


// @namespace Tooltip
var Tooltip = DivOverlay.extend({

	// @section
	// @aka Tooltip options
	options: {
		// @option pane: String = 'tooltipPane'
		// `Map pane` where the tooltip will be added.
		pane: 'tooltipPane',

		// @option offset: Point = Point(0, 0)
		// Optional offset of the tooltip position.
		offset: [0, 0],

		// @option direction: String = 'auto'
		// Direction where to open the tooltip. Possible values are: `right`, `left`,
		// `top`, `bottom`, `center`, `auto`.
		// `auto` will dynamically switch between `right` and `left` according to the tooltip
		// position on the map.
		direction: 'auto',

		// @option permanent: Boolean = false
		// Whether to open the tooltip permanently or only on mouseover.
		permanent: false,

		// @option sticky: Boolean = false
		// If true, the tooltip will follow the mouse instead of being fixed at the feature center.
		sticky: false,

		// @option interactive: Boolean = false
		// If true, the tooltip will listen to the feature events.
		interactive: false,

		// @option opacity: Number = 0.9
		// Tooltip container opacity.
		opacity: 0.9
	},

	onAdd: function (map) {
		DivOverlay.prototype.onAdd.call(this, map);
		this.setOpacity(this.options.opacity);

		// @namespace Map
		// @section Tooltip events
		// @event tooltipopen: TooltipEvent
		// Fired when a tooltip is opened in the map.
		map.fire('tooltipopen', {tooltip: this});

		if (this._source) {
			// @namespace Layer
			// @section Tooltip events
			// @event tooltipopen: TooltipEvent
			// Fired when a tooltip bound to this layer is opened.
			this._source.fire('tooltipopen', {tooltip: this}, true);
		}
	},

	onRemove: function (map) {
		DivOverlay.prototype.onRemove.call(this, map);

		// @namespace Map
		// @section Tooltip events
		// @event tooltipclose: TooltipEvent
		// Fired when a tooltip in the map is closed.
		map.fire('tooltipclose', {tooltip: this});

		if (this._source) {
			// @namespace Layer
			// @section Tooltip events
			// @event tooltipclose: TooltipEvent
			// Fired when a tooltip bound to this layer is closed.
			this._source.fire('tooltipclose', {tooltip: this}, true);
		}
	},

	getEvents: function () {
		var events = DivOverlay.prototype.getEvents.call(this);

		if (touch && !this.options.permanent) {
			events.preclick = this._close;
		}

		return events;
	},

	_close: function () {
		if (this._map) {
			this._map.closeTooltip(this);
		}
	},

	_initLayout: function () {
		var prefix = 'leaflet-tooltip',
		    className = prefix + ' ' + (this.options.className || '') + ' leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

		this._contentNode = this._container = create$1('div', className);
	},

	_updateLayout: function () {},

	_adjustPan: function () {},

	_setPosition: function (pos) {
		var map = this._map,
		    container = this._container,
		    centerPoint = map.latLngToContainerPoint(map.getCenter()),
		    tooltipPoint = map.layerPointToContainerPoint(pos),
		    direction = this.options.direction,
		    tooltipWidth = container.offsetWidth,
		    tooltipHeight = container.offsetHeight,
		    offset = toPoint(this.options.offset),
		    anchor = this._getAnchor();

		if (direction === 'top') {
			pos = pos.add(toPoint(-tooltipWidth / 2 + offset.x, -tooltipHeight + offset.y + anchor.y, true));
		} else if (direction === 'bottom') {
			pos = pos.subtract(toPoint(tooltipWidth / 2 - offset.x, -offset.y, true));
		} else if (direction === 'center') {
			pos = pos.subtract(toPoint(tooltipWidth / 2 + offset.x, tooltipHeight / 2 - anchor.y + offset.y, true));
		} else if (direction === 'right' || direction === 'auto' && tooltipPoint.x < centerPoint.x) {
			direction = 'right';
			pos = pos.add(toPoint(offset.x + anchor.x, anchor.y - tooltipHeight / 2 + offset.y, true));
		} else {
			direction = 'left';
			pos = pos.subtract(toPoint(tooltipWidth + anchor.x - offset.x, tooltipHeight / 2 - anchor.y - offset.y, true));
		}

		removeClass(container, 'leaflet-tooltip-right');
		removeClass(container, 'leaflet-tooltip-left');
		removeClass(container, 'leaflet-tooltip-top');
		removeClass(container, 'leaflet-tooltip-bottom');
		addClass(container, 'leaflet-tooltip-' + direction);
		setPosition(container, pos);
	},

	_updatePosition: function () {
		var pos = this._map.latLngToLayerPoint(this._latlng);
		this._setPosition(pos);
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._container) {
			setOpacity(this._container, opacity);
		}
	},

	_animateZoom: function (e) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);
		this._setPosition(pos);
	},

	_getAnchor: function () {
		// Where should we anchor the tooltip on the source layer?
		return toPoint(this._source && this._source._getTooltipAnchor && !this.options.sticky ? this._source._getTooltipAnchor() : [0, 0]);
	}

});

// @namespace Tooltip
// @factory L.tooltip(options?: Tooltip options, source?: Layer)
// Instantiates a Tooltip object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the tooltip with a reference to the Layer to which it refers.
var tooltip = function (options, source) {
	return new Tooltip(options, source);
};

// @namespace Map
// @section Methods for Layers and Controls
Map.include({

	// @method openTooltip(tooltip: Tooltip): this
	// Opens the specified tooltip.
	// @alternative
	// @method openTooltip(content: String|HTMLElement, latlng: LatLng, options?: Tooltip options): this
	// Creates a tooltip with the specified content and options and open it.
	openTooltip: function (tooltip, latlng, options) {
		if (!(tooltip instanceof Tooltip)) {
			tooltip = new Tooltip(options).setContent(tooltip);
		}

		if (latlng) {
			tooltip.setLatLng(latlng);
		}

		if (this.hasLayer(tooltip)) {
			return this;
		}

		return this.addLayer(tooltip);
	},

	// @method closeTooltip(tooltip?: Tooltip): this
	// Closes the tooltip given as parameter.
	closeTooltip: function (tooltip) {
		if (tooltip) {
			this.removeLayer(tooltip);
		}
		return this;
	}

});

/*
 * @namespace Layer
 * @section Tooltip methods example
 *
 * All layers share a set of methods convenient for binding tooltips to it.
 *
 * ```js
 * var layer = L.Polygon(latlngs).bindTooltip('Hi There!').addTo(map);
 * layer.openTooltip();
 * layer.closeTooltip();
 * ```
 */

// @section Tooltip methods
Layer.include({

	// @method bindTooltip(content: String|HTMLElement|Function|Tooltip, options?: Tooltip options): this
	// Binds a tooltip to the layer with the passed `content` and sets up the
	// necessary event listeners. If a `Function` is passed it will receive
	// the layer as the first argument and should return a `String` or `HTMLElement`.
	bindTooltip: function (content, options) {

		if (content instanceof Tooltip) {
			setOptions(content, options);
			this._tooltip = content;
			content._source = this;
		} else {
			if (!this._tooltip || options) {
				this._tooltip = new Tooltip(options, this);
			}
			this._tooltip.setContent(content);

		}

		this._initTooltipInteractions();

		if (this._tooltip.options.permanent && this._map && this._map.hasLayer(this)) {
			this.openTooltip();
		}

		return this;
	},

	// @method unbindTooltip(): this
	// Removes the tooltip previously bound with `bindTooltip`.
	unbindTooltip: function () {
		if (this._tooltip) {
			this._initTooltipInteractions(true);
			this.closeTooltip();
			this._tooltip = null;
		}
		return this;
	},

	_initTooltipInteractions: function (remove$$1) {
		if (!remove$$1 && this._tooltipHandlersAdded) { return; }
		var onOff = remove$$1 ? 'off' : 'on',
		    events = {
			remove: this.closeTooltip,
			move: this._moveTooltip
		    };
		if (!this._tooltip.options.permanent) {
			events.mouseover = this._openTooltip;
			events.mouseout = this.closeTooltip;
			if (this._tooltip.options.sticky) {
				events.mousemove = this._moveTooltip;
			}
			if (touch) {
				events.click = this._openTooltip;
			}
		} else {
			events.add = this._openTooltip;
		}
		this[onOff](events);
		this._tooltipHandlersAdded = !remove$$1;
	},

	// @method openTooltip(latlng?: LatLng): this
	// Opens the bound tooltip at the specified `latlng` or at the default tooltip anchor if no `latlng` is passed.
	openTooltip: function (layer, latlng) {
		if (this._tooltip && this._map) {
			latlng = this._tooltip._prepareOpen(this, layer, latlng);

			// open the tooltip on the map
			this._map.openTooltip(this._tooltip, latlng);

			// Tooltip container may not be defined if not permanent and never
			// opened.
			if (this._tooltip.options.interactive && this._tooltip._container) {
				addClass(this._tooltip._container, 'leaflet-clickable');
				this.addInteractiveTarget(this._tooltip._container);
			}
		}

		return this;
	},

	// @method closeTooltip(): this
	// Closes the tooltip bound to this layer if it is open.
	closeTooltip: function () {
		if (this._tooltip) {
			this._tooltip._close();
			if (this._tooltip.options.interactive && this._tooltip._container) {
				removeClass(this._tooltip._container, 'leaflet-clickable');
				this.removeInteractiveTarget(this._tooltip._container);
			}
		}
		return this;
	},

	// @method toggleTooltip(): this
	// Opens or closes the tooltip bound to this layer depending on its current state.
	toggleTooltip: function (target) {
		if (this._tooltip) {
			if (this._tooltip._map) {
				this.closeTooltip();
			} else {
				this.openTooltip(target);
			}
		}
		return this;
	},

	// @method isTooltipOpen(): boolean
	// Returns `true` if the tooltip bound to this layer is currently open.
	isTooltipOpen: function () {
		return this._tooltip.isOpen();
	},

	// @method setTooltipContent(content: String|HTMLElement|Tooltip): this
	// Sets the content of the tooltip bound to this layer.
	setTooltipContent: function (content) {
		if (this._tooltip) {
			this._tooltip.setContent(content);
		}
		return this;
	},

	// @method getTooltip(): Tooltip
	// Returns the tooltip bound to this layer.
	getTooltip: function () {
		return this._tooltip;
	},

	_openTooltip: function (e) {
		var layer = e.layer || e.target;

		if (!this._tooltip || !this._map) {
			return;
		}
		this.openTooltip(layer, this._tooltip.options.sticky ? e.latlng : undefined);
	},

	_moveTooltip: function (e) {
		var latlng = e.latlng, containerPoint, layerPoint;
		if (this._tooltip.options.sticky && e.originalEvent) {
			containerPoint = this._map.mouseEventToContainerPoint(e.originalEvent);
			layerPoint = this._map.containerPointToLayerPoint(containerPoint);
			latlng = this._map.layerPointToLatLng(layerPoint);
		}
		this._tooltip.setLatLng(latlng);
	}
});

/*
 * @class DivIcon
 * @aka L.DivIcon
 * @inherits Icon
 *
 * Represents a lightweight icon for markers that uses a simple `<div>`
 * element instead of an image. Inherits from `Icon` but ignores the `iconUrl` and shadow options.
 *
 * @example
 * ```js
 * var myIcon = L.divIcon({className: 'my-div-icon'});
 * // you can set .my-div-icon styles in CSS
 *
 * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
 * ```
 *
 * By default, it has a 'leaflet-div-icon' CSS class and is styled as a little white square with a shadow.
 */

var DivIcon = Icon.extend({
	options: {
		// @section
		// @aka DivIcon options
		iconSize: [12, 12], // also can be set through CSS

		// iconAnchor: (Point),
		// popupAnchor: (Point),

		// @option html: String|HTMLElement = ''
		// Custom HTML code to put inside the div element, empty by default. Alternatively,
		// an instance of `HTMLElement`.
		html: false,

		// @option bgPos: Point = [0, 0]
		// Optional relative position of the background, in pixels
		bgPos: null,

		className: 'leaflet-div-icon'
	},

	createIcon: function (oldIcon) {
		var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
		    options = this.options;

		if (options.html instanceof Element) {
			empty(div);
			div.appendChild(options.html);
		} else {
			div.innerHTML = options.html !== false ? options.html : '';
		}

		if (options.bgPos) {
			var bgPos = toPoint(options.bgPos);
			div.style.backgroundPosition = (-bgPos.x) + 'px ' + (-bgPos.y) + 'px';
		}
		this._setIconStyles(div, 'icon');

		return div;
	},

	createShadow: function () {
		return null;
	}
});

// @factory L.divIcon(options: DivIcon options)
// Creates a `DivIcon` instance with the given options.
function divIcon(options) {
	return new DivIcon(options);
}

Icon.Default = IconDefault;

/*
 * @class GridLayer
 * @inherits Layer
 * @aka L.GridLayer
 *
 * Generic class for handling a tiled grid of HTML elements. This is the base class for all tile layers and replaces `TileLayer.Canvas`.
 * GridLayer can be extended to create a tiled grid of HTML elements like `<canvas>`, `<img>` or `<div>`. GridLayer will handle creating and animating these DOM elements for you.
 *
 *
 * @section Synchronous usage
 * @example
 *
 * To create a custom layer, extend GridLayer and implement the `createTile()` method, which will be passed a `Point` object with the `x`, `y`, and `z` (zoom level) coordinates to draw your tile.
 *
 * ```js
 * var CanvasLayer = L.GridLayer.extend({
 *     createTile: function(coords){
 *         // create a <canvas> element for drawing
 *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
 *
 *         // setup tile width and height according to the options
 *         var size = this.getTileSize();
 *         tile.width = size.x;
 *         tile.height = size.y;
 *
 *         // get a canvas context and draw something on it using coords.x, coords.y and coords.z
 *         var ctx = tile.getContext('2d');
 *
 *         // return the tile so it can be rendered on screen
 *         return tile;
 *     }
 * });
 * ```
 *
 * @section Asynchronous usage
 * @example
 *
 * Tile creation can also be asynchronous, this is useful when using a third-party drawing library. Once the tile is finished drawing it can be passed to the `done()` callback.
 *
 * ```js
 * var CanvasLayer = L.GridLayer.extend({
 *     createTile: function(coords, done){
 *         var error;
 *
 *         // create a <canvas> element for drawing
 *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
 *
 *         // setup tile width and height according to the options
 *         var size = this.getTileSize();
 *         tile.width = size.x;
 *         tile.height = size.y;
 *
 *         // draw something asynchronously and pass the tile to the done() callback
 *         setTimeout(function() {
 *             done(error, tile);
 *         }, 1000);
 *
 *         return tile;
 *     }
 * });
 * ```
 *
 * @section
 */


var GridLayer = Layer.extend({

	// @section
	// @aka GridLayer options
	options: {
		// @option tileSize: Number|Point = 256
		// Width and height of tiles in the grid. Use a number if width and height are equal, or `L.point(width, height)` otherwise.
		tileSize: 256,

		// @option opacity: Number = 1.0
		// Opacity of the tiles. Can be used in the `createTile()` function.
		opacity: 1,

		// @option updateWhenIdle: Boolean = (depends)
		// Load new tiles only when panning ends.
		// `true` by default on mobile browsers, in order to avoid too many requests and keep smooth navigation.
		// `false` otherwise in order to display new tiles _during_ panning, since it is easy to pan outside the
		// [`keepBuffer`](#gridlayer-keepbuffer) option in desktop browsers.
		updateWhenIdle: mobile,

		// @option updateWhenZooming: Boolean = true
		// By default, a smooth zoom animation (during a [touch zoom](#map-touchzoom) or a [`flyTo()`](#map-flyto)) will update grid layers every integer zoom level. Setting this option to `false` will update the grid layer only when the smooth animation ends.
		updateWhenZooming: true,

		// @option updateInterval: Number = 200
		// Tiles will not update more than once every `updateInterval` milliseconds when panning.
		updateInterval: 200,

		// @option zIndex: Number = 1
		// The explicit zIndex of the tile layer.
		zIndex: 1,

		// @option bounds: LatLngBounds = undefined
		// If set, tiles will only be loaded inside the set `LatLngBounds`.
		bounds: null,

		// @option minZoom: Number = 0
		// The minimum zoom level down to which this layer will be displayed (inclusive).
		minZoom: 0,

		// @option maxZoom: Number = undefined
		// The maximum zoom level up to which this layer will be displayed (inclusive).
		maxZoom: undefined,

		// @option maxNativeZoom: Number = undefined
		// Maximum zoom number the tile source has available. If it is specified,
		// the tiles on all zoom levels higher than `maxNativeZoom` will be loaded
		// from `maxNativeZoom` level and auto-scaled.
		maxNativeZoom: undefined,

		// @option minNativeZoom: Number = undefined
		// Minimum zoom number the tile source has available. If it is specified,
		// the tiles on all zoom levels lower than `minNativeZoom` will be loaded
		// from `minNativeZoom` level and auto-scaled.
		minNativeZoom: undefined,

		// @option noWrap: Boolean = false
		// Whether the layer is wrapped around the antimeridian. If `true`, the
		// GridLayer will only be displayed once at low zoom levels. Has no
		// effect when the [map CRS](#map-crs) doesn't wrap around. Can be used
		// in combination with [`bounds`](#gridlayer-bounds) to prevent requesting
		// tiles outside the CRS limits.
		noWrap: false,

		// @option pane: String = 'tilePane'
		// `Map pane` where the grid layer will be added.
		pane: 'tilePane',

		// @option className: String = ''
		// A custom class name to assign to the tile layer. Empty by default.
		className: '',

		// @option keepBuffer: Number = 2
		// When panning the map, keep this many rows and columns of tiles before unloading them.
		keepBuffer: 2
	},

	initialize: function (options) {
		setOptions(this, options);
	},

	onAdd: function () {
		this._initContainer();

		this._levels = {};
		this._tiles = {};

		this._resetView();
		this._update();
	},

	beforeAdd: function (map) {
		map._addZoomLimit(this);
	},

	onRemove: function (map) {
		this._removeAllTiles();
		remove(this._container);
		map._removeZoomLimit(this);
		this._container = null;
		this._tileZoom = undefined;
	},

	// @method bringToFront: this
	// Brings the tile layer to the top of all tile layers.
	bringToFront: function () {
		if (this._map) {
			toFront(this._container);
			this._setAutoZIndex(Math.max);
		}
		return this;
	},

	// @method bringToBack: this
	// Brings the tile layer to the bottom of all tile layers.
	bringToBack: function () {
		if (this._map) {
			toBack(this._container);
			this._setAutoZIndex(Math.min);
		}
		return this;
	},

	// @method getContainer: HTMLElement
	// Returns the HTML element that contains the tiles for this layer.
	getContainer: function () {
		return this._container;
	},

	// @method setOpacity(opacity: Number): this
	// Changes the [opacity](#gridlayer-opacity) of the grid layer.
	setOpacity: function (opacity) {
		this.options.opacity = opacity;
		this._updateOpacity();
		return this;
	},

	// @method setZIndex(zIndex: Number): this
	// Changes the [zIndex](#gridlayer-zindex) of the grid layer.
	setZIndex: function (zIndex) {
		this.options.zIndex = zIndex;
		this._updateZIndex();

		return this;
	},

	// @method isLoading: Boolean
	// Returns `true` if any tile in the grid layer has not finished loading.
	isLoading: function () {
		return this._loading;
	},

	// @method redraw: this
	// Causes the layer to clear all the tiles and request them again.
	redraw: function () {
		if (this._map) {
			this._removeAllTiles();
			this._update();
		}
		return this;
	},

	getEvents: function () {
		var events = {
			viewprereset: this._invalidateAll,
			viewreset: this._resetView,
			zoom: this._resetView,
			moveend: this._onMoveEnd
		};

		if (!this.options.updateWhenIdle) {
			// update tiles on move, but not more often than once per given interval
			if (!this._onMove) {
				this._onMove = throttle(this._onMoveEnd, this.options.updateInterval, this);
			}

			events.move = this._onMove;
		}

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},

	// @section Extension methods
	// Layers extending `GridLayer` shall reimplement the following method.
	// @method createTile(coords: Object, done?: Function): HTMLElement
	// Called only internally, must be overridden by classes extending `GridLayer`.
	// Returns the `HTMLElement` corresponding to the given `coords`. If the `done` callback
	// is specified, it must be called when the tile has finished loading and drawing.
	createTile: function () {
		return document.createElement('div');
	},

	// @section
	// @method getTileSize: Point
	// Normalizes the [tileSize option](#gridlayer-tilesize) into a point. Used by the `createTile()` method.
	getTileSize: function () {
		var s = this.options.tileSize;
		return s instanceof Point ? s : new Point(s, s);
	},

	_updateZIndex: function () {
		if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
			this._container.style.zIndex = this.options.zIndex;
		}
	},

	_setAutoZIndex: function (compare) {
		// go through all other layers of the same pane, set zIndex to max + 1 (front) or min - 1 (back)

		var layers = this.getPane().children,
		    edgeZIndex = -compare(-Infinity, Infinity); // -Infinity for max, Infinity for min

		for (var i = 0, len = layers.length, zIndex; i < len; i++) {

			zIndex = layers[i].style.zIndex;

			if (layers[i] !== this._container && zIndex) {
				edgeZIndex = compare(edgeZIndex, +zIndex);
			}
		}

		if (isFinite(edgeZIndex)) {
			this.options.zIndex = edgeZIndex + compare(-1, 1);
			this._updateZIndex();
		}
	},

	_updateOpacity: function () {
		if (!this._map) { return; }

		// IE doesn't inherit filter opacity properly, so we're forced to set it on tiles
		if (ielt9) { return; }

		setOpacity(this._container, this.options.opacity);

		var now = +new Date(),
		    nextFrame = false,
		    willPrune = false;

		for (var key in this._tiles) {
			var tile = this._tiles[key];
			if (!tile.current || !tile.loaded) { continue; }

			var fade = Math.min(1, (now - tile.loaded) / 200);

			setOpacity(tile.el, fade);
			if (fade < 1) {
				nextFrame = true;
			} else {
				if (tile.active) {
					willPrune = true;
				} else {
					this._onOpaqueTile(tile);
				}
				tile.active = true;
			}
		}

		if (willPrune && !this._noPrune) { this._pruneTiles(); }

		if (nextFrame) {
			cancelAnimFrame(this._fadeFrame);
			this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
		}
	},

	_onOpaqueTile: falseFn,

	_initContainer: function () {
		if (this._container) { return; }

		this._container = create$1('div', 'leaflet-layer ' + (this.options.className || ''));
		this._updateZIndex();

		if (this.options.opacity < 1) {
			this._updateOpacity();
		}

		this.getPane().appendChild(this._container);
	},

	_updateLevels: function () {

		var zoom = this._tileZoom,
		    maxZoom = this.options.maxZoom;

		if (zoom === undefined) { return undefined; }

		for (var z in this._levels) {
			if (this._levels[z].el.children.length || z === zoom) {
				this._levels[z].el.style.zIndex = maxZoom - Math.abs(zoom - z);
				this._onUpdateLevel(z);
			} else {
				remove(this._levels[z].el);
				this._removeTilesAtZoom(z);
				this._onRemoveLevel(z);
				delete this._levels[z];
			}
		}

		var level = this._levels[zoom],
		    map = this._map;

		if (!level) {
			level = this._levels[zoom] = {};

			level.el = create$1('div', 'leaflet-tile-container leaflet-zoom-animated', this._container);
			level.el.style.zIndex = maxZoom;

			level.origin = map.project(map.unproject(map.getPixelOrigin()), zoom).round();
			level.zoom = zoom;

			this._setZoomTransform(level, map.getCenter(), map.getZoom());

			// force the browser to consider the newly added element for transition
			falseFn(level.el.offsetWidth);

			this._onCreateLevel(level);
		}

		this._level = level;

		return level;
	},

	_onUpdateLevel: falseFn,

	_onRemoveLevel: falseFn,

	_onCreateLevel: falseFn,

	_pruneTiles: function () {
		if (!this._map) {
			return;
		}

		var key, tile;

		var zoom = this._map.getZoom();
		if (zoom > this.options.maxZoom ||
			zoom < this.options.minZoom) {
			this._removeAllTiles();
			return;
		}

		for (key in this._tiles) {
			tile = this._tiles[key];
			tile.retain = tile.current;
		}

		for (key in this._tiles) {
			tile = this._tiles[key];
			if (tile.current && !tile.active) {
				var coords = tile.coords;
				if (!this._retainParent(coords.x, coords.y, coords.z, coords.z - 5)) {
					this._retainChildren(coords.x, coords.y, coords.z, coords.z + 2);
				}
			}
		}

		for (key in this._tiles) {
			if (!this._tiles[key].retain) {
				this._removeTile(key);
			}
		}
	},

	_removeTilesAtZoom: function (zoom) {
		for (var key in this._tiles) {
			if (this._tiles[key].coords.z !== zoom) {
				continue;
			}
			this._removeTile(key);
		}
	},

	_removeAllTiles: function () {
		for (var key in this._tiles) {
			this._removeTile(key);
		}
	},

	_invalidateAll: function () {
		for (var z in this._levels) {
			remove(this._levels[z].el);
			this._onRemoveLevel(z);
			delete this._levels[z];
		}
		this._removeAllTiles();

		this._tileZoom = undefined;
	},

	_retainParent: function (x, y, z, minZoom) {
		var x2 = Math.floor(x / 2),
		    y2 = Math.floor(y / 2),
		    z2 = z - 1,
		    coords2 = new Point(+x2, +y2);
		coords2.z = +z2;

		var key = this._tileCoordsToKey(coords2),
		    tile = this._tiles[key];

		if (tile && tile.active) {
			tile.retain = true;
			return true;

		} else if (tile && tile.loaded) {
			tile.retain = true;
		}

		if (z2 > minZoom) {
			return this._retainParent(x2, y2, z2, minZoom);
		}

		return false;
	},

	_retainChildren: function (x, y, z, maxZoom) {

		for (var i = 2 * x; i < 2 * x + 2; i++) {
			for (var j = 2 * y; j < 2 * y + 2; j++) {

				var coords = new Point(i, j);
				coords.z = z + 1;

				var key = this._tileCoordsToKey(coords),
				    tile = this._tiles[key];

				if (tile && tile.active) {
					tile.retain = true;
					continue;

				} else if (tile && tile.loaded) {
					tile.retain = true;
				}

				if (z + 1 < maxZoom) {
					this._retainChildren(i, j, z + 1, maxZoom);
				}
			}
		}
	},

	_resetView: function (e) {
		var animating = e && (e.pinch || e.flyTo);
		this._setView(this._map.getCenter(), this._map.getZoom(), animating, animating);
	},

	_animateZoom: function (e) {
		this._setView(e.center, e.zoom, true, e.noUpdate);
	},

	_clampZoom: function (zoom) {
		var options = this.options;

		if (undefined !== options.minNativeZoom && zoom < options.minNativeZoom) {
			return options.minNativeZoom;
		}

		if (undefined !== options.maxNativeZoom && options.maxNativeZoom < zoom) {
			return options.maxNativeZoom;
		}

		return zoom;
	},

	_setView: function (center, zoom, noPrune, noUpdate) {
		var tileZoom = this._clampZoom(Math.round(zoom));
		if ((this.options.maxZoom !== undefined && tileZoom > this.options.maxZoom) ||
		    (this.options.minZoom !== undefined && tileZoom < this.options.minZoom)) {
			tileZoom = undefined;
		}

		var tileZoomChanged = this.options.updateWhenZooming && (tileZoom !== this._tileZoom);

		if (!noUpdate || tileZoomChanged) {

			this._tileZoom = tileZoom;

			if (this._abortLoading) {
				this._abortLoading();
			}

			this._updateLevels();
			this._resetGrid();

			if (tileZoom !== undefined) {
				this._update(center);
			}

			if (!noPrune) {
				this._pruneTiles();
			}

			// Flag to prevent _updateOpacity from pruning tiles during
			// a zoom anim or a pinch gesture
			this._noPrune = !!noPrune;
		}

		this._setZoomTransforms(center, zoom);
	},

	_setZoomTransforms: function (center, zoom) {
		for (var i in this._levels) {
			this._setZoomTransform(this._levels[i], center, zoom);
		}
	},

	_setZoomTransform: function (level, center, zoom) {
		var scale = this._map.getZoomScale(zoom, level.zoom),
		    translate = level.origin.multiplyBy(scale)
		        .subtract(this._map._getNewPixelOrigin(center, zoom)).round();

		if (any3d) {
			setTransform(level.el, translate, scale);
		} else {
			setPosition(level.el, translate);
		}
	},

	_resetGrid: function () {
		var map = this._map,
		    crs = map.options.crs,
		    tileSize = this._tileSize = this.getTileSize(),
		    tileZoom = this._tileZoom;

		var bounds = this._map.getPixelWorldBounds(this._tileZoom);
		if (bounds) {
			this._globalTileRange = this._pxBoundsToTileRange(bounds);
		}

		this._wrapX = crs.wrapLng && !this.options.noWrap && [
			Math.floor(map.project([0, crs.wrapLng[0]], tileZoom).x / tileSize.x),
			Math.ceil(map.project([0, crs.wrapLng[1]], tileZoom).x / tileSize.y)
		];
		this._wrapY = crs.wrapLat && !this.options.noWrap && [
			Math.floor(map.project([crs.wrapLat[0], 0], tileZoom).y / tileSize.x),
			Math.ceil(map.project([crs.wrapLat[1], 0], tileZoom).y / tileSize.y)
		];
	},

	_onMoveEnd: function () {
		if (!this._map || this._map._animatingZoom) { return; }

		this._update();
	},

	_getTiledPixelBounds: function (center) {
		var map = this._map,
		    mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(),
		    scale = map.getZoomScale(mapZoom, this._tileZoom),
		    pixelCenter = map.project(center, this._tileZoom).floor(),
		    halfSize = map.getSize().divideBy(scale * 2);

		return new Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
	},

	// Private method to load tiles in the grid's active zoom level according to map bounds
	_update: function (center) {
		var map = this._map;
		if (!map) { return; }
		var zoom = this._clampZoom(map.getZoom());

		if (center === undefined) { center = map.getCenter(); }
		if (this._tileZoom === undefined) { return; }	// if out of minzoom/maxzoom

		var pixelBounds = this._getTiledPixelBounds(center),
		    tileRange = this._pxBoundsToTileRange(pixelBounds),
		    tileCenter = tileRange.getCenter(),
		    queue = [],
		    margin = this.options.keepBuffer,
		    noPruneRange = new Bounds(tileRange.getBottomLeft().subtract([margin, -margin]),
		                              tileRange.getTopRight().add([margin, -margin]));

		// Sanity check: panic if the tile range contains Infinity somewhere.
		if (!(isFinite(tileRange.min.x) &&
		      isFinite(tileRange.min.y) &&
		      isFinite(tileRange.max.x) &&
		      isFinite(tileRange.max.y))) { throw new Error('Attempted to load an infinite number of tiles'); }

		for (var key in this._tiles) {
			var c = this._tiles[key].coords;
			if (c.z !== this._tileZoom || !noPruneRange.contains(new Point(c.x, c.y))) {
				this._tiles[key].current = false;
			}
		}

		// _update just loads more tiles. If the tile zoom level differs too much
		// from the map's, let _setView reset levels and prune old tiles.
		if (Math.abs(zoom - this._tileZoom) > 1) { this._setView(center, zoom); return; }

		// create a queue of coordinates to load tiles from
		for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
			for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
				var coords = new Point(i, j);
				coords.z = this._tileZoom;

				if (!this._isValidTile(coords)) { continue; }

				var tile = this._tiles[this._tileCoordsToKey(coords)];
				if (tile) {
					tile.current = true;
				} else {
					queue.push(coords);
				}
			}
		}

		// sort tile queue to load tiles in order of their distance to center
		queue.sort(function (a, b) {
			return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
		});

		if (queue.length !== 0) {
			// if it's the first batch of tiles to load
			if (!this._loading) {
				this._loading = true;
				// @event loading: Event
				// Fired when the grid layer starts loading tiles.
				this.fire('loading');
			}

			// create DOM fragment to append tiles in one batch
			var fragment = document.createDocumentFragment();

			for (i = 0; i < queue.length; i++) {
				this._addTile(queue[i], fragment);
			}

			this._level.el.appendChild(fragment);
		}
	},

	_isValidTile: function (coords) {
		var crs = this._map.options.crs;

		if (!crs.infinite) {
			// don't load tile if it's out of bounds and not wrapped
			var bounds = this._globalTileRange;
			if ((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
			    (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false; }
		}

		if (!this.options.bounds) { return true; }

		// don't load tile if it doesn't intersect the bounds in options
		var tileBounds = this._tileCoordsToBounds(coords);
		return toLatLngBounds(this.options.bounds).overlaps(tileBounds);
	},

	_keyToBounds: function (key) {
		return this._tileCoordsToBounds(this._keyToTileCoords(key));
	},

	_tileCoordsToNwSe: function (coords) {
		var map = this._map,
		    tileSize = this.getTileSize(),
		    nwPoint = coords.scaleBy(tileSize),
		    sePoint = nwPoint.add(tileSize),
		    nw = map.unproject(nwPoint, coords.z),
		    se = map.unproject(sePoint, coords.z);
		return [nw, se];
	},

	// converts tile coordinates to its geographical bounds
	_tileCoordsToBounds: function (coords) {
		var bp = this._tileCoordsToNwSe(coords),
		    bounds = new LatLngBounds(bp[0], bp[1]);

		if (!this.options.noWrap) {
			bounds = this._map.wrapLatLngBounds(bounds);
		}
		return bounds;
	},
	// converts tile coordinates to key for the tile cache
	_tileCoordsToKey: function (coords) {
		return coords.x + ':' + coords.y + ':' + coords.z;
	},

	// converts tile cache key to coordinates
	_keyToTileCoords: function (key) {
		var k = key.split(':'),
		    coords = new Point(+k[0], +k[1]);
		coords.z = +k[2];
		return coords;
	},

	_removeTile: function (key) {
		var tile = this._tiles[key];
		if (!tile) { return; }

		remove(tile.el);

		delete this._tiles[key];

		// @event tileunload: TileEvent
		// Fired when a tile is removed (e.g. when a tile goes off the screen).
		this.fire('tileunload', {
			tile: tile.el,
			coords: this._keyToTileCoords(key)
		});
	},

	_initTile: function (tile) {
		addClass(tile, 'leaflet-tile');

		var tileSize = this.getTileSize();
		tile.style.width = tileSize.x + 'px';
		tile.style.height = tileSize.y + 'px';

		tile.onselectstart = falseFn;
		tile.onmousemove = falseFn;

		// update opacity on tiles in IE7-8 because of filter inheritance problems
		if (ielt9 && this.options.opacity < 1) {
			setOpacity(tile, this.options.opacity);
		}

		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (android && !android23) {
			tile.style.WebkitBackfaceVisibility = 'hidden';
		}
	},

	_addTile: function (coords, container) {
		var tilePos = this._getTilePos(coords),
		    key = this._tileCoordsToKey(coords);

		var tile = this.createTile(this._wrapCoords(coords), bind(this._tileReady, this, coords));

		this._initTile(tile);

		// if createTile is defined with a second argument ("done" callback),
		// we know that tile is async and will be ready later; otherwise
		if (this.createTile.length < 2) {
			// mark tile as ready, but delay one frame for opacity animation to happen
			requestAnimFrame(bind(this._tileReady, this, coords, null, tile));
		}

		setPosition(tile, tilePos);

		// save tile in cache
		this._tiles[key] = {
			el: tile,
			coords: coords,
			current: true
		};

		container.appendChild(tile);
		// @event tileloadstart: TileEvent
		// Fired when a tile is requested and starts loading.
		this.fire('tileloadstart', {
			tile: tile,
			coords: coords
		});
	},

	_tileReady: function (coords, err, tile) {
		if (err) {
			// @event tileerror: TileErrorEvent
			// Fired when there is an error loading a tile.
			this.fire('tileerror', {
				error: err,
				tile: tile,
				coords: coords
			});
		}

		var key = this._tileCoordsToKey(coords);

		tile = this._tiles[key];
		if (!tile) { return; }

		tile.loaded = +new Date();
		if (this._map._fadeAnimated) {
			setOpacity(tile.el, 0);
			cancelAnimFrame(this._fadeFrame);
			this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
		} else {
			tile.active = true;
			this._pruneTiles();
		}

		if (!err) {
			addClass(tile.el, 'leaflet-tile-loaded');

			// @event tileload: TileEvent
			// Fired when a tile loads.
			this.fire('tileload', {
				tile: tile.el,
				coords: coords
			});
		}

		if (this._noTilesToLoad()) {
			this._loading = false;
			// @event load: Event
			// Fired when the grid layer loaded all visible tiles.
			this.fire('load');

			if (ielt9 || !this._map._fadeAnimated) {
				requestAnimFrame(this._pruneTiles, this);
			} else {
				// Wait a bit more than 0.2 secs (the duration of the tile fade-in)
				// to trigger a pruning.
				setTimeout(bind(this._pruneTiles, this), 250);
			}
		}
	},

	_getTilePos: function (coords) {
		return coords.scaleBy(this.getTileSize()).subtract(this._level.origin);
	},

	_wrapCoords: function (coords) {
		var newCoords = new Point(
			this._wrapX ? wrapNum(coords.x, this._wrapX) : coords.x,
			this._wrapY ? wrapNum(coords.y, this._wrapY) : coords.y);
		newCoords.z = coords.z;
		return newCoords;
	},

	_pxBoundsToTileRange: function (bounds) {
		var tileSize = this.getTileSize();
		return new Bounds(
			bounds.min.unscaleBy(tileSize).floor(),
			bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1]));
	},

	_noTilesToLoad: function () {
		for (var key in this._tiles) {
			if (!this._tiles[key].loaded) { return false; }
		}
		return true;
	}
});

// @factory L.gridLayer(options?: GridLayer options)
// Creates a new instance of GridLayer with the supplied options.
function gridLayer(options) {
	return new GridLayer(options);
}

/*
 * @class TileLayer
 * @inherits GridLayer
 * @aka L.TileLayer
 * Used to load and display tile layers on the map. Note that most tile servers require attribution, which you can set under `Layer`. Extends `GridLayer`.
 *
 * @example
 *
 * ```js
 * L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'}).addTo(map);
 * ```
 *
 * @section URL template
 * @example
 *
 * A string of the following form:
 *
 * ```
 * 'http://{s}.somedomain.com/blabla/{z}/{x}/{y}{r}.png'
 * ```
 *
 * `{s}` means one of the available subdomains (used sequentially to help with browser parallel requests per domain limitation; subdomain values are specified in options; `a`, `b` or `c` by default, can be omitted), `{z}` — zoom level, `{x}` and `{y}` — tile coordinates. `{r}` can be used to add "&commat;2x" to the URL to load retina tiles.
 *
 * You can use custom keys in the template, which will be [evaluated](#util-template) from TileLayer options, like this:
 *
 * ```
 * L.tileLayer('http://{s}.somedomain.com/{foo}/{z}/{x}/{y}.png', {foo: 'bar'});
 * ```
 */


var TileLayer = GridLayer.extend({

	// @section
	// @aka TileLayer options
	options: {
		// @option minZoom: Number = 0
		// The minimum zoom level down to which this layer will be displayed (inclusive).
		minZoom: 0,

		// @option maxZoom: Number = 18
		// The maximum zoom level up to which this layer will be displayed (inclusive).
		maxZoom: 18,

		// @option subdomains: String|String[] = 'abc'
		// Subdomains of the tile service. Can be passed in the form of one string (where each letter is a subdomain name) or an array of strings.
		subdomains: 'abc',

		// @option errorTileUrl: String = ''
		// URL to the tile image to show in place of the tile that failed to load.
		errorTileUrl: '',

		// @option zoomOffset: Number = 0
		// The zoom number used in tile URLs will be offset with this value.
		zoomOffset: 0,

		// @option tms: Boolean = false
		// If `true`, inverses Y axis numbering for tiles (turn this on for [TMS](https://en.wikipedia.org/wiki/Tile_Map_Service) services).
		tms: false,

		// @option zoomReverse: Boolean = false
		// If set to true, the zoom number used in tile URLs will be reversed (`maxZoom - zoom` instead of `zoom`)
		zoomReverse: false,

		// @option detectRetina: Boolean = false
		// If `true` and user is on a retina display, it will request four tiles of half the specified size and a bigger zoom level in place of one to utilize the high resolution.
		detectRetina: false,

		// @option crossOrigin: Boolean|String = false
		// Whether the crossOrigin attribute will be added to the tiles.
		// If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
		crossOrigin: false
	},

	initialize: function (url, options) {

		this._url = url;

		options = setOptions(this, options);

		// detecting retina displays, adjusting tileSize and zoom levels
		if (options.detectRetina && retina && options.maxZoom > 0) {

			options.tileSize = Math.floor(options.tileSize / 2);

			if (!options.zoomReverse) {
				options.zoomOffset++;
				options.maxZoom--;
			} else {
				options.zoomOffset--;
				options.minZoom++;
			}

			options.minZoom = Math.max(0, options.minZoom);
		}

		if (typeof options.subdomains === 'string') {
			options.subdomains = options.subdomains.split('');
		}

		// for https://github.com/Leaflet/Leaflet/issues/137
		if (!android) {
			this.on('tileunload', this._onTileRemove);
		}
	},

	// @method setUrl(url: String, noRedraw?: Boolean): this
	// Updates the layer's URL template and redraws it (unless `noRedraw` is set to `true`).
	// If the URL does not change, the layer will not be redrawn unless
	// the noRedraw parameter is set to false.
	setUrl: function (url, noRedraw) {
		if (this._url === url && noRedraw === undefined) {
			noRedraw = true;
		}

		this._url = url;

		if (!noRedraw) {
			this.redraw();
		}
		return this;
	},

	// @method createTile(coords: Object, done?: Function): HTMLElement
	// Called only internally, overrides GridLayer's [`createTile()`](#gridlayer-createtile)
	// to return an `<img>` HTML element with the appropriate image URL given `coords`. The `done`
	// callback is called when the tile has been loaded.
	createTile: function (coords, done) {
		var tile = document.createElement('img');

		on(tile, 'load', bind(this._tileOnLoad, this, done, tile));
		on(tile, 'error', bind(this._tileOnError, this, done, tile));

		if (this.options.crossOrigin || this.options.crossOrigin === '') {
			tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
		}

		/*
		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
		 http://www.w3.org/TR/WCAG20-TECHS/H67
		*/
		tile.alt = '';

		/*
		 Set role="presentation" to force screen readers to ignore this
		 https://www.w3.org/TR/wai-aria/roles#textalternativecomputation
		*/
		tile.setAttribute('role', 'presentation');

		tile.src = this.getTileUrl(coords);

		return tile;
	},

	// @section Extension methods
	// @uninheritable
	// Layers extending `TileLayer` might reimplement the following method.
	// @method getTileUrl(coords: Object): String
	// Called only internally, returns the URL for a tile given its coordinates.
	// Classes extending `TileLayer` can override this function to provide custom tile URL naming schemes.
	getTileUrl: function (coords) {
		var data = {
			r: retina ? '@2x' : '',
			s: this._getSubdomain(coords),
			x: coords.x,
			y: coords.y,
			z: this._getZoomForUrl()
		};
		if (this._map && !this._map.options.crs.infinite) {
			var invertedY = this._globalTileRange.max.y - coords.y;
			if (this.options.tms) {
				data['y'] = invertedY;
			}
			data['-y'] = invertedY;
		}

		return template(this._url, extend(data, this.options));
	},

	_tileOnLoad: function (done, tile) {
		// For https://github.com/Leaflet/Leaflet/issues/3332
		if (ielt9) {
			setTimeout(bind(done, this, null, tile), 0);
		} else {
			done(null, tile);
		}
	},

	_tileOnError: function (done, tile, e) {
		var errorUrl = this.options.errorTileUrl;
		if (errorUrl && tile.getAttribute('src') !== errorUrl) {
			tile.src = errorUrl;
		}
		done(e, tile);
	},

	_onTileRemove: function (e) {
		e.tile.onload = null;
	},

	_getZoomForUrl: function () {
		var zoom = this._tileZoom,
		maxZoom = this.options.maxZoom,
		zoomReverse = this.options.zoomReverse,
		zoomOffset = this.options.zoomOffset;

		if (zoomReverse) {
			zoom = maxZoom - zoom;
		}

		return zoom + zoomOffset;
	},

	_getSubdomain: function (tilePoint) {
		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
		return this.options.subdomains[index];
	},

	// stops loading all tiles in the background layer
	_abortLoading: function () {
		var i, tile;
		for (i in this._tiles) {
			if (this._tiles[i].coords.z !== this._tileZoom) {
				tile = this._tiles[i].el;

				tile.onload = falseFn;
				tile.onerror = falseFn;

				if (!tile.complete) {
					tile.src = emptyImageUrl;
					remove(tile);
					delete this._tiles[i];
				}
			}
		}
	},

	_removeTile: function (key) {
		var tile = this._tiles[key];
		if (!tile) { return; }

		// Cancels any pending http requests associated with the tile
		// unless we're on Android's stock browser,
		// see https://github.com/Leaflet/Leaflet/issues/137
		if (!androidStock) {
			tile.el.setAttribute('src', emptyImageUrl);
		}

		return GridLayer.prototype._removeTile.call(this, key);
	},

	_tileReady: function (coords, err, tile) {
		if (!this._map || (tile && tile.getAttribute('src') === emptyImageUrl)) {
			return;
		}

		return GridLayer.prototype._tileReady.call(this, coords, err, tile);
	}
});


// @factory L.tilelayer(urlTemplate: String, options?: TileLayer options)
// Instantiates a tile layer object given a `URL template` and optionally an options object.

function tileLayer(url, options) {
	return new TileLayer(url, options);
}

/*
 * @class TileLayer.WMS
 * @inherits TileLayer
 * @aka L.TileLayer.WMS
 * Used to display [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services as tile layers on the map. Extends `TileLayer`.
 *
 * @example
 *
 * ```js
 * var nexrad = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
 * 	layers: 'nexrad-n0r-900913',
 * 	format: 'image/png',
 * 	transparent: true,
 * 	attribution: "Weather data © 2012 IEM Nexrad"
 * });
 * ```
 */

var TileLayerWMS = TileLayer.extend({

	// @section
	// @aka TileLayer.WMS options
	// If any custom options not documented here are used, they will be sent to the
	// WMS server as extra parameters in each request URL. This can be useful for
	// [non-standard vendor WMS parameters](http://docs.geoserver.org/stable/en/user/services/wms/vendor.html).
	defaultWmsParams: {
		service: 'WMS',
		request: 'GetMap',

		// @option layers: String = ''
		// **(required)** Comma-separated list of WMS layers to show.
		layers: '',

		// @option styles: String = ''
		// Comma-separated list of WMS styles.
		styles: '',

		// @option format: String = 'image/jpeg'
		// WMS image format (use `'image/png'` for layers with transparency).
		format: 'image/jpeg',

		// @option transparent: Boolean = false
		// If `true`, the WMS service will return images with transparency.
		transparent: false,

		// @option version: String = '1.1.1'
		// Version of the WMS service to use
		version: '1.1.1'
	},

	options: {
		// @option crs: CRS = null
		// Coordinate Reference System to use for the WMS requests, defaults to
		// map CRS. Don't change this if you're not sure what it means.
		crs: null,

		// @option uppercase: Boolean = false
		// If `true`, WMS request parameter keys will be uppercase.
		uppercase: false
	},

	initialize: function (url, options) {

		this._url = url;

		var wmsParams = extend({}, this.defaultWmsParams);

		// all keys that are not TileLayer options go to WMS params
		for (var i in options) {
			if (!(i in this.options)) {
				wmsParams[i] = options[i];
			}
		}

		options = setOptions(this, options);

		var realRetina = options.detectRetina && retina ? 2 : 1;
		var tileSize = this.getTileSize();
		wmsParams.width = tileSize.x * realRetina;
		wmsParams.height = tileSize.y * realRetina;

		this.wmsParams = wmsParams;
	},

	onAdd: function (map) {

		this._crs = this.options.crs || map.options.crs;
		this._wmsVersion = parseFloat(this.wmsParams.version);

		var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
		this.wmsParams[projectionKey] = this._crs.code;

		TileLayer.prototype.onAdd.call(this, map);
	},

	getTileUrl: function (coords) {

		var tileBounds = this._tileCoordsToNwSe(coords),
		    crs = this._crs,
		    bounds = toBounds(crs.project(tileBounds[0]), crs.project(tileBounds[1])),
		    min = bounds.min,
		    max = bounds.max,
		    bbox = (this._wmsVersion >= 1.3 && this._crs === EPSG4326 ?
		    [min.y, min.x, max.y, max.x] :
		    [min.x, min.y, max.x, max.y]).join(','),
		    url = TileLayer.prototype.getTileUrl.call(this, coords);
		return url +
			getParamString(this.wmsParams, url, this.options.uppercase) +
			(this.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;
	},

	// @method setParams(params: Object, noRedraw?: Boolean): this
	// Merges an object with the new parameters and re-requests tiles on the current screen (unless `noRedraw` was set to true).
	setParams: function (params, noRedraw) {

		extend(this.wmsParams, params);

		if (!noRedraw) {
			this.redraw();
		}

		return this;
	}
});


// @factory L.tileLayer.wms(baseUrl: String, options: TileLayer.WMS options)
// Instantiates a WMS tile layer object given a base URL of the WMS service and a WMS parameters/options object.
function tileLayerWMS(url, options) {
	return new TileLayerWMS(url, options);
}

TileLayer.WMS = TileLayerWMS;
tileLayer.wms = tileLayerWMS;

/*
 * @class Renderer
 * @inherits Layer
 * @aka L.Renderer
 *
 * Base class for vector renderer implementations (`SVG`, `Canvas`). Handles the
 * DOM container of the renderer, its bounds, and its zoom animation.
 *
 * A `Renderer` works as an implicit layer group for all `Path`s - the renderer
 * itself can be added or removed to the map. All paths use a renderer, which can
 * be implicit (the map will decide the type of renderer and use it automatically)
 * or explicit (using the [`renderer`](#path-renderer) option of the path).
 *
 * Do not use this class directly, use `SVG` and `Canvas` instead.
 *
 * @event update: Event
 * Fired when the renderer updates its bounds, center and zoom, for example when
 * its map has moved
 */

var Renderer = Layer.extend({

	// @section
	// @aka Renderer options
	options: {
		// @option padding: Number = 0.1
		// How much to extend the clip area around the map view (relative to its size)
		// e.g. 0.1 would be 10% of map view in each direction
		padding: 0.1,

		// @option tolerance: Number = 0
		// How much to extend click tolerance round a path/object on the map
		tolerance : 0
	},

	initialize: function (options) {
		setOptions(this, options);
		stamp(this);
		this._layers = this._layers || {};
	},

	onAdd: function () {
		if (!this._container) {
			this._initContainer(); // defined by renderer implementations

			if (this._zoomAnimated) {
				addClass(this._container, 'leaflet-zoom-animated');
			}
		}

		this.getPane().appendChild(this._container);
		this._update();
		this.on('update', this._updatePaths, this);
	},

	onRemove: function () {
		this.off('update', this._updatePaths, this);
		this._destroyContainer();
	},

	getEvents: function () {
		var events = {
			viewreset: this._reset,
			zoom: this._onZoom,
			moveend: this._update,
			zoomend: this._onZoomEnd
		};
		if (this._zoomAnimated) {
			events.zoomanim = this._onAnimZoom;
		}
		return events;
	},

	_onAnimZoom: function (ev) {
		this._updateTransform(ev.center, ev.zoom);
	},

	_onZoom: function () {
		this._updateTransform(this._map.getCenter(), this._map.getZoom());
	},

	_updateTransform: function (center, zoom) {
		var scale = this._map.getZoomScale(zoom, this._zoom),
		    position = getPosition(this._container),
		    viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
		    currentCenterPoint = this._map.project(this._center, zoom),
		    destCenterPoint = this._map.project(center, zoom),
		    centerOffset = destCenterPoint.subtract(currentCenterPoint),

		    topLeftOffset = viewHalf.multiplyBy(-scale).add(position).add(viewHalf).subtract(centerOffset);

		if (any3d) {
			setTransform(this._container, topLeftOffset, scale);
		} else {
			setPosition(this._container, topLeftOffset);
		}
	},

	_reset: function () {
		this._update();
		this._updateTransform(this._center, this._zoom);

		for (var id in this._layers) {
			this._layers[id]._reset();
		}
	},

	_onZoomEnd: function () {
		for (var id in this._layers) {
			this._layers[id]._project();
		}
	},

	_updatePaths: function () {
		for (var id in this._layers) {
			this._layers[id]._update();
		}
	},

	_update: function () {
		// Update pixel bounds of renderer container (for positioning/sizing/clipping later)
		// Subclasses are responsible of firing the 'update' event.
		var p = this.options.padding,
		    size = this._map.getSize(),
		    min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round();

		this._bounds = new Bounds(min, min.add(size.multiplyBy(1 + p * 2)).round());

		this._center = this._map.getCenter();
		this._zoom = this._map.getZoom();
	}
});

/*
 * @class Canvas
 * @inherits Renderer
 * @aka L.Canvas
 *
 * Allows vector layers to be displayed with [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
 * Inherits `Renderer`.
 *
 * Due to [technical limitations](http://caniuse.com/#search=canvas), Canvas is not
 * available in all web browsers, notably IE8, and overlapping geometries might
 * not display properly in some edge cases.
 *
 * @example
 *
 * Use Canvas by default for all paths in the map:
 *
 * ```js
 * var map = L.map('map', {
 * 	renderer: L.canvas()
 * });
 * ```
 *
 * Use a Canvas renderer with extra padding for specific vector geometries:
 *
 * ```js
 * var map = L.map('map');
 * var myRenderer = L.canvas({ padding: 0.5 });
 * var line = L.polyline( coordinates, { renderer: myRenderer } );
 * var circle = L.circle( center, { renderer: myRenderer } );
 * ```
 */

var Canvas = Renderer.extend({
	getEvents: function () {
		var events = Renderer.prototype.getEvents.call(this);
		events.viewprereset = this._onViewPreReset;
		return events;
	},

	_onViewPreReset: function () {
		// Set a flag so that a viewprereset+moveend+viewreset only updates&redraws once
		this._postponeUpdatePaths = true;
	},

	onAdd: function () {
		Renderer.prototype.onAdd.call(this);

		// Redraw vectors since canvas is cleared upon removal,
		// in case of removing the renderer itself from the map.
		this._draw();
	},

	_initContainer: function () {
		var container = this._container = document.createElement('canvas');

		on(container, 'mousemove', throttle(this._onMouseMove, 32, this), this);
		on(container, 'click dblclick mousedown mouseup contextmenu', this._onClick, this);
		on(container, 'mouseout', this._handleMouseOut, this);

		this._ctx = container.getContext('2d');
	},

	_destroyContainer: function () {
		cancelAnimFrame(this._redrawRequest);
		delete this._ctx;
		remove(this._container);
		off(this._container);
		delete this._container;
	},

	_updatePaths: function () {
		if (this._postponeUpdatePaths) { return; }

		var layer;
		this._redrawBounds = null;
		for (var id in this._layers) {
			layer = this._layers[id];
			layer._update();
		}
		this._redraw();
	},

	_update: function () {
		if (this._map._animatingZoom && this._bounds) { return; }

		Renderer.prototype._update.call(this);

		var b = this._bounds,
		    container = this._container,
		    size = b.getSize(),
		    m = retina ? 2 : 1;

		setPosition(container, b.min);

		// set canvas size (also clearing it); use double size on retina
		container.width = m * size.x;
		container.height = m * size.y;
		container.style.width = size.x + 'px';
		container.style.height = size.y + 'px';

		if (retina) {
			this._ctx.scale(2, 2);
		}

		// translate so we use the same path coordinates after canvas element moves
		this._ctx.translate(-b.min.x, -b.min.y);

		// Tell paths to redraw themselves
		this.fire('update');
	},

	_reset: function () {
		Renderer.prototype._reset.call(this);

		if (this._postponeUpdatePaths) {
			this._postponeUpdatePaths = false;
			this._updatePaths();
		}
	},

	_initPath: function (layer) {
		this._updateDashArray(layer);
		this._layers[stamp(layer)] = layer;

		var order = layer._order = {
			layer: layer,
			prev: this._drawLast,
			next: null
		};
		if (this._drawLast) { this._drawLast.next = order; }
		this._drawLast = order;
		this._drawFirst = this._drawFirst || this._drawLast;
	},

	_addPath: function (layer) {
		this._requestRedraw(layer);
	},

	_removePath: function (layer) {
		var order = layer._order;
		var next = order.next;
		var prev = order.prev;

		if (next) {
			next.prev = prev;
		} else {
			this._drawLast = prev;
		}
		if (prev) {
			prev.next = next;
		} else {
			this._drawFirst = next;
		}

		delete layer._order;

		delete this._layers[stamp(layer)];

		this._requestRedraw(layer);
	},

	_updatePath: function (layer) {
		// Redraw the union of the layer's old pixel
		// bounds and the new pixel bounds.
		this._extendRedrawBounds(layer);
		layer._project();
		layer._update();
		// The redraw will extend the redraw bounds
		// with the new pixel bounds.
		this._requestRedraw(layer);
	},

	_updateStyle: function (layer) {
		this._updateDashArray(layer);
		this._requestRedraw(layer);
	},

	_updateDashArray: function (layer) {
		if (typeof layer.options.dashArray === 'string') {
			var parts = layer.options.dashArray.split(/[, ]+/),
			    dashArray = [],
			    dashValue,
			    i;
			for (i = 0; i < parts.length; i++) {
				dashValue = Number(parts[i]);
				// Ignore dash array containing invalid lengths
				if (isNaN(dashValue)) { return; }
				dashArray.push(dashValue);
			}
			layer.options._dashArray = dashArray;
		} else {
			layer.options._dashArray = layer.options.dashArray;
		}
	},

	_requestRedraw: function (layer) {
		if (!this._map) { return; }

		this._extendRedrawBounds(layer);
		this._redrawRequest = this._redrawRequest || requestAnimFrame(this._redraw, this);
	},

	_extendRedrawBounds: function (layer) {
		if (layer._pxBounds) {
			var padding = (layer.options.weight || 0) + 1;
			this._redrawBounds = this._redrawBounds || new Bounds();
			this._redrawBounds.extend(layer._pxBounds.min.subtract([padding, padding]));
			this._redrawBounds.extend(layer._pxBounds.max.add([padding, padding]));
		}
	},

	_redraw: function () {
		this._redrawRequest = null;

		if (this._redrawBounds) {
			this._redrawBounds.min._floor();
			this._redrawBounds.max._ceil();
		}

		this._clear(); // clear layers in redraw bounds
		this._draw(); // draw layers

		this._redrawBounds = null;
	},

	_clear: function () {
		var bounds = this._redrawBounds;
		if (bounds) {
			var size = bounds.getSize();
			this._ctx.clearRect(bounds.min.x, bounds.min.y, size.x, size.y);
		} else {
			this._ctx.clearRect(0, 0, this._container.width, this._container.height);
		}
	},

	_draw: function () {
		var layer, bounds = this._redrawBounds;
		this._ctx.save();
		if (bounds) {
			var size = bounds.getSize();
			this._ctx.beginPath();
			this._ctx.rect(bounds.min.x, bounds.min.y, size.x, size.y);
			this._ctx.clip();
		}

		this._drawing = true;

		for (var order = this._drawFirst; order; order = order.next) {
			layer = order.layer;
			if (!bounds || (layer._pxBounds && layer._pxBounds.intersects(bounds))) {
				layer._updatePath();
			}
		}

		this._drawing = false;

		this._ctx.restore();  // Restore state before clipping.
	},

	_updatePoly: function (layer, closed) {
		if (!this._drawing) { return; }

		var i, j, len2, p,
		    parts = layer._parts,
		    len = parts.length,
		    ctx = this._ctx;

		if (!len) { return; }

		ctx.beginPath();

		for (i = 0; i < len; i++) {
			for (j = 0, len2 = parts[i].length; j < len2; j++) {
				p = parts[i][j];
				ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
			}
			if (closed) {
				ctx.closePath();
			}
		}

		this._fillStroke(ctx, layer);

		// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
	},

	_updateCircle: function (layer) {

		if (!this._drawing || layer._empty()) { return; }

		var p = layer._point,
		    ctx = this._ctx,
		    r = Math.max(Math.round(layer._radius), 1),
		    s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;

		if (s !== 1) {
			ctx.save();
			ctx.scale(1, s);
		}

		ctx.beginPath();
		ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);

		if (s !== 1) {
			ctx.restore();
		}

		this._fillStroke(ctx, layer);
	},

	_fillStroke: function (ctx, layer) {
		var options = layer.options;

		if (options.fill) {
			ctx.globalAlpha = options.fillOpacity;
			ctx.fillStyle = options.fillColor || options.color;
			ctx.fill(options.fillRule || 'evenodd');
		}

		if (options.stroke && options.weight !== 0) {
			if (ctx.setLineDash) {
				ctx.setLineDash(layer.options && layer.options._dashArray || []);
			}
			ctx.globalAlpha = options.opacity;
			ctx.lineWidth = options.weight;
			ctx.strokeStyle = options.color;
			ctx.lineCap = options.lineCap;
			ctx.lineJoin = options.lineJoin;
			ctx.stroke();
		}
	},

	// Canvas obviously doesn't have mouse events for individual drawn objects,
	// so we emulate that by calculating what's under the mouse on mousemove/click manually

	_onClick: function (e) {
		var point = this._map.mouseEventToLayerPoint(e), layer, clickedLayer;

		for (var order = this._drawFirst; order; order = order.next) {
			layer = order.layer;
			if (layer.options.interactive && layer._containsPoint(point) && !this._map._draggableMoved(layer)) {
				clickedLayer = layer;
			}
		}
		if (clickedLayer)  {
			fakeStop(e);
			this._fireEvent([clickedLayer], e);
		}
	},

	_onMouseMove: function (e) {
		if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) { return; }

		var point = this._map.mouseEventToLayerPoint(e);
		this._handleMouseHover(e, point);
	},


	_handleMouseOut: function (e) {
		var layer = this._hoveredLayer;
		if (layer) {
			// if we're leaving the layer, fire mouseout
			removeClass(this._container, 'leaflet-interactive');
			this._fireEvent([layer], e, 'mouseout');
			this._hoveredLayer = null;
		}
	},

	_handleMouseHover: function (e, point) {
		var layer, candidateHoveredLayer;

		for (var order = this._drawFirst; order; order = order.next) {
			layer = order.layer;
			if (layer.options.interactive && layer._containsPoint(point)) {
				candidateHoveredLayer = layer;
			}
		}

		if (candidateHoveredLayer !== this._hoveredLayer) {
			this._handleMouseOut(e);

			if (candidateHoveredLayer) {
				addClass(this._container, 'leaflet-interactive'); // change cursor
				this._fireEvent([candidateHoveredLayer], e, 'mouseover');
				this._hoveredLayer = candidateHoveredLayer;
			}
		}

		if (this._hoveredLayer) {
			this._fireEvent([this._hoveredLayer], e);
		}
	},

	_fireEvent: function (layers, e, type) {
		this._map._fireDOMEvent(e, type || e.type, layers);
	},

	_bringToFront: function (layer) {
		var order = layer._order;

		if (!order) { return; }

		var next = order.next;
		var prev = order.prev;

		if (next) {
			next.prev = prev;
		} else {
			// Already last
			return;
		}
		if (prev) {
			prev.next = next;
		} else if (next) {
			// Update first entry unless this is the
			// single entry
			this._drawFirst = next;
		}

		order.prev = this._drawLast;
		this._drawLast.next = order;

		order.next = null;
		this._drawLast = order;

		this._requestRedraw(layer);
	},

	_bringToBack: function (layer) {
		var order = layer._order;

		if (!order) { return; }

		var next = order.next;
		var prev = order.prev;

		if (prev) {
			prev.next = next;
		} else {
			// Already first
			return;
		}
		if (next) {
			next.prev = prev;
		} else if (prev) {
			// Update last entry unless this is the
			// single entry
			this._drawLast = prev;
		}

		order.prev = null;

		order.next = this._drawFirst;
		this._drawFirst.prev = order;
		this._drawFirst = order;

		this._requestRedraw(layer);
	}
});

// @factory L.canvas(options?: Renderer options)
// Creates a Canvas renderer with the given options.
function canvas$1(options) {
	return canvas ? new Canvas(options) : null;
}

/*
 * Thanks to Dmitry Baranovsky and his Raphael library for inspiration!
 */


var vmlCreate = (function () {
	try {
		document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
		return function (name) {
			return document.createElement('<lvml:' + name + ' class="lvml">');
		};
	} catch (e) {
		return function (name) {
			return document.createElement('<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
		};
	}
})();


/*
 * @class SVG
 *
 *
 * VML was deprecated in 2012, which means VML functionality exists only for backwards compatibility
 * with old versions of Internet Explorer.
 */

// mixin to redefine some SVG methods to handle VML syntax which is similar but with some differences
var vmlMixin = {

	_initContainer: function () {
		this._container = create$1('div', 'leaflet-vml-container');
	},

	_update: function () {
		if (this._map._animatingZoom) { return; }
		Renderer.prototype._update.call(this);
		this.fire('update');
	},

	_initPath: function (layer) {
		var container = layer._container = vmlCreate('shape');

		addClass(container, 'leaflet-vml-shape ' + (this.options.className || ''));

		container.coordsize = '1 1';

		layer._path = vmlCreate('path');
		container.appendChild(layer._path);

		this._updateStyle(layer);
		this._layers[stamp(layer)] = layer;
	},

	_addPath: function (layer) {
		var container = layer._container;
		this._container.appendChild(container);

		if (layer.options.interactive) {
			layer.addInteractiveTarget(container);
		}
	},

	_removePath: function (layer) {
		var container = layer._container;
		remove(container);
		layer.removeInteractiveTarget(container);
		delete this._layers[stamp(layer)];
	},

	_updateStyle: function (layer) {
		var stroke = layer._stroke,
		    fill = layer._fill,
		    options = layer.options,
		    container = layer._container;

		container.stroked = !!options.stroke;
		container.filled = !!options.fill;

		if (options.stroke) {
			if (!stroke) {
				stroke = layer._stroke = vmlCreate('stroke');
			}
			container.appendChild(stroke);
			stroke.weight = options.weight + 'px';
			stroke.color = options.color;
			stroke.opacity = options.opacity;

			if (options.dashArray) {
				stroke.dashStyle = isArray(options.dashArray) ?
				    options.dashArray.join(' ') :
				    options.dashArray.replace(/( *, *)/g, ' ');
			} else {
				stroke.dashStyle = '';
			}
			stroke.endcap = options.lineCap.replace('butt', 'flat');
			stroke.joinstyle = options.lineJoin;

		} else if (stroke) {
			container.removeChild(stroke);
			layer._stroke = null;
		}

		if (options.fill) {
			if (!fill) {
				fill = layer._fill = vmlCreate('fill');
			}
			container.appendChild(fill);
			fill.color = options.fillColor || options.color;
			fill.opacity = options.fillOpacity;

		} else if (fill) {
			container.removeChild(fill);
			layer._fill = null;
		}
	},

	_updateCircle: function (layer) {
		var p = layer._point.round(),
		    r = Math.round(layer._radius),
		    r2 = Math.round(layer._radiusY || r);

		this._setPath(layer, layer._empty() ? 'M0 0' :
			'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r2 + ' 0,' + (65535 * 360));
	},

	_setPath: function (layer, path) {
		layer._path.v = path;
	},

	_bringToFront: function (layer) {
		toFront(layer._container);
	},

	_bringToBack: function (layer) {
		toBack(layer._container);
	}
};

var create$2 = vml ? vmlCreate : svgCreate;

/*
 * @class SVG
 * @inherits Renderer
 * @aka L.SVG
 *
 * Allows vector layers to be displayed with [SVG](https://developer.mozilla.org/docs/Web/SVG).
 * Inherits `Renderer`.
 *
 * Due to [technical limitations](http://caniuse.com/#search=svg), SVG is not
 * available in all web browsers, notably Android 2.x and 3.x.
 *
 * Although SVG is not available on IE7 and IE8, these browsers support
 * [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language)
 * (a now deprecated technology), and the SVG renderer will fall back to VML in
 * this case.
 *
 * @example
 *
 * Use SVG by default for all paths in the map:
 *
 * ```js
 * var map = L.map('map', {
 * 	renderer: L.svg()
 * });
 * ```
 *
 * Use a SVG renderer with extra padding for specific vector geometries:
 *
 * ```js
 * var map = L.map('map');
 * var myRenderer = L.svg({ padding: 0.5 });
 * var line = L.polyline( coordinates, { renderer: myRenderer } );
 * var circle = L.circle( center, { renderer: myRenderer } );
 * ```
 */

var SVG = Renderer.extend({

	getEvents: function () {
		var events = Renderer.prototype.getEvents.call(this);
		events.zoomstart = this._onZoomStart;
		return events;
	},

	_initContainer: function () {
		this._container = create$2('svg');

		// makes it possible to click through svg root; we'll reset it back in individual paths
		this._container.setAttribute('pointer-events', 'none');

		this._rootGroup = create$2('g');
		this._container.appendChild(this._rootGroup);
	},

	_destroyContainer: function () {
		remove(this._container);
		off(this._container);
		delete this._container;
		delete this._rootGroup;
		delete this._svgSize;
	},

	_onZoomStart: function () {
		// Drag-then-pinch interactions might mess up the center and zoom.
		// In this case, the easiest way to prevent this is re-do the renderer
		//   bounds and padding when the zooming starts.
		this._update();
	},

	_update: function () {
		if (this._map._animatingZoom && this._bounds) { return; }

		Renderer.prototype._update.call(this);

		var b = this._bounds,
		    size = b.getSize(),
		    container = this._container;

		// set size of svg-container if changed
		if (!this._svgSize || !this._svgSize.equals(size)) {
			this._svgSize = size;
			container.setAttribute('width', size.x);
			container.setAttribute('height', size.y);
		}

		// movement: update container viewBox so that we don't have to change coordinates of individual layers
		setPosition(container, b.min);
		container.setAttribute('viewBox', [b.min.x, b.min.y, size.x, size.y].join(' '));

		this.fire('update');
	},

	// methods below are called by vector layers implementations

	_initPath: function (layer) {
		var path = layer._path = create$2('path');

		// @namespace Path
		// @option className: String = null
		// Custom class name set on an element. Only for SVG renderer.
		if (layer.options.className) {
			addClass(path, layer.options.className);
		}

		if (layer.options.interactive) {
			addClass(path, 'leaflet-interactive');
		}

		this._updateStyle(layer);
		this._layers[stamp(layer)] = layer;
	},

	_addPath: function (layer) {
		if (!this._rootGroup) { this._initContainer(); }
		this._rootGroup.appendChild(layer._path);
		layer.addInteractiveTarget(layer._path);
	},

	_removePath: function (layer) {
		remove(layer._path);
		layer.removeInteractiveTarget(layer._path);
		delete this._layers[stamp(layer)];
	},

	_updatePath: function (layer) {
		layer._project();
		layer._update();
	},

	_updateStyle: function (layer) {
		var path = layer._path,
		    options = layer.options;

		if (!path) { return; }

		if (options.stroke) {
			path.setAttribute('stroke', options.color);
			path.setAttribute('stroke-opacity', options.opacity);
			path.setAttribute('stroke-width', options.weight);
			path.setAttribute('stroke-linecap', options.lineCap);
			path.setAttribute('stroke-linejoin', options.lineJoin);

			if (options.dashArray) {
				path.setAttribute('stroke-dasharray', options.dashArray);
			} else {
				path.removeAttribute('stroke-dasharray');
			}

			if (options.dashOffset) {
				path.setAttribute('stroke-dashoffset', options.dashOffset);
			} else {
				path.removeAttribute('stroke-dashoffset');
			}
		} else {
			path.setAttribute('stroke', 'none');
		}

		if (options.fill) {
			path.setAttribute('fill', options.fillColor || options.color);
			path.setAttribute('fill-opacity', options.fillOpacity);
			path.setAttribute('fill-rule', options.fillRule || 'evenodd');
		} else {
			path.setAttribute('fill', 'none');
		}
	},

	_updatePoly: function (layer, closed) {
		this._setPath(layer, pointsToPath(layer._parts, closed));
	},

	_updateCircle: function (layer) {
		var p = layer._point,
		    r = Math.max(Math.round(layer._radius), 1),
		    r2 = Math.max(Math.round(layer._radiusY), 1) || r,
		    arc = 'a' + r + ',' + r2 + ' 0 1,0 ';

		// drawing a circle with two half-arcs
		var d = layer._empty() ? 'M0 0' :
			'M' + (p.x - r) + ',' + p.y +
			arc + (r * 2) + ',0 ' +
			arc + (-r * 2) + ',0 ';

		this._setPath(layer, d);
	},

	_setPath: function (layer, path) {
		layer._path.setAttribute('d', path);
	},

	// SVG does not have the concept of zIndex so we resort to changing the DOM order of elements
	_bringToFront: function (layer) {
		toFront(layer._path);
	},

	_bringToBack: function (layer) {
		toBack(layer._path);
	}
});

if (vml) {
	SVG.include(vmlMixin);
}

// @namespace SVG
// @factory L.svg(options?: Renderer options)
// Creates a SVG renderer with the given options.
function svg$1(options) {
	return svg || vml ? new SVG(options) : null;
}

Map.include({
	// @namespace Map; @method getRenderer(layer: Path): Renderer
	// Returns the instance of `Renderer` that should be used to render the given
	// `Path`. It will ensure that the `renderer` options of the map and paths
	// are respected, and that the renderers do exist on the map.
	getRenderer: function (layer) {
		// @namespace Path; @option renderer: Renderer
		// Use this specific instance of `Renderer` for this path. Takes
		// precedence over the map's [default renderer](#map-renderer).
		var renderer = layer.options.renderer || this._getPaneRenderer(layer.options.pane) || this.options.renderer || this._renderer;

		if (!renderer) {
			renderer = this._renderer = this._createRenderer();
		}

		if (!this.hasLayer(renderer)) {
			this.addLayer(renderer);
		}
		return renderer;
	},

	_getPaneRenderer: function (name) {
		if (name === 'overlayPane' || name === undefined) {
			return false;
		}

		var renderer = this._paneRenderers[name];
		if (renderer === undefined) {
			renderer = this._createRenderer({pane: name});
			this._paneRenderers[name] = renderer;
		}
		return renderer;
	},

	_createRenderer: function (options) {
		// @namespace Map; @option preferCanvas: Boolean = false
		// Whether `Path`s should be rendered on a `Canvas` renderer.
		// By default, all `Path`s are rendered in a `SVG` renderer.
		return (this.options.preferCanvas && canvas$1(options)) || svg$1(options);
	}
});

/*
 * L.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
 */

/*
 * @class Rectangle
 * @aka L.Rectangle
 * @inherits Polygon
 *
 * A class for drawing rectangle overlays on a map. Extends `Polygon`.
 *
 * @example
 *
 * ```js
 * // define rectangle geographical bounds
 * var bounds = [[54.559322, -5.767822], [56.1210604, -3.021240]];
 *
 * // create an orange rectangle
 * L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);
 *
 * // zoom the map to the rectangle bounds
 * map.fitBounds(bounds);
 * ```
 *
 */


var Rectangle = Polygon.extend({
	initialize: function (latLngBounds, options) {
		Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
	},

	// @method setBounds(latLngBounds: LatLngBounds): this
	// Redraws the rectangle with the passed bounds.
	setBounds: function (latLngBounds) {
		return this.setLatLngs(this._boundsToLatLngs(latLngBounds));
	},

	_boundsToLatLngs: function (latLngBounds) {
		latLngBounds = toLatLngBounds(latLngBounds);
		return [
			latLngBounds.getSouthWest(),
			latLngBounds.getNorthWest(),
			latLngBounds.getNorthEast(),
			latLngBounds.getSouthEast()
		];
	}
});


// @factory L.rectangle(latLngBounds: LatLngBounds, options?: Polyline options)
function rectangle(latLngBounds, options) {
	return new Rectangle(latLngBounds, options);
}

SVG.create = create$2;
SVG.pointsToPath = pointsToPath;

GeoJSON.geometryToLayer = geometryToLayer;
GeoJSON.coordsToLatLng = coordsToLatLng;
GeoJSON.coordsToLatLngs = coordsToLatLngs;
GeoJSON.latLngToCoords = latLngToCoords;
GeoJSON.latLngsToCoords = latLngsToCoords;
GeoJSON.getFeature = getFeature;
GeoJSON.asFeature = asFeature;

/*
 * L.Handler.BoxZoom is used to add shift-drag zoom interaction to the map
 * (zoom to a selected bounding box), enabled by default.
 */

// @namespace Map
// @section Interaction Options
Map.mergeOptions({
	// @option boxZoom: Boolean = true
	// Whether the map can be zoomed to a rectangular area specified by
	// dragging the mouse while pressing the shift key.
	boxZoom: true
});

var BoxZoom = Handler.extend({
	initialize: function (map) {
		this._map = map;
		this._container = map._container;
		this._pane = map._panes.overlayPane;
		this._resetStateTimeout = 0;
		map.on('unload', this._destroy, this);
	},

	addHooks: function () {
		on(this._container, 'mousedown', this._onMouseDown, this);
	},

	removeHooks: function () {
		off(this._container, 'mousedown', this._onMouseDown, this);
	},

	moved: function () {
		return this._moved;
	},

	_destroy: function () {
		remove(this._pane);
		delete this._pane;
	},

	_resetState: function () {
		this._resetStateTimeout = 0;
		this._moved = false;
	},

	_clearDeferredResetState: function () {
		if (this._resetStateTimeout !== 0) {
			clearTimeout(this._resetStateTimeout);
			this._resetStateTimeout = 0;
		}
	},

	_onMouseDown: function (e) {
		if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

		// Clear the deferred resetState if it hasn't executed yet, otherwise it
		// will interrupt the interaction and orphan a box element in the container.
		this._clearDeferredResetState();
		this._resetState();

		disableTextSelection();
		disableImageDrag();

		this._startPoint = this._map.mouseEventToContainerPoint(e);

		on(document, {
			contextmenu: stop,
			mousemove: this._onMouseMove,
			mouseup: this._onMouseUp,
			keydown: this._onKeyDown
		}, this);
	},

	_onMouseMove: function (e) {
		if (!this._moved) {
			this._moved = true;

			this._box = create$1('div', 'leaflet-zoom-box', this._container);
			addClass(this._container, 'leaflet-crosshair');

			this._map.fire('boxzoomstart');
		}

		this._point = this._map.mouseEventToContainerPoint(e);

		var bounds = new Bounds(this._point, this._startPoint),
		    size = bounds.getSize();

		setPosition(this._box, bounds.min);

		this._box.style.width  = size.x + 'px';
		this._box.style.height = size.y + 'px';
	},

	_finish: function () {
		if (this._moved) {
			remove(this._box);
			removeClass(this._container, 'leaflet-crosshair');
		}

		enableTextSelection();
		enableImageDrag();

		off(document, {
			contextmenu: stop,
			mousemove: this._onMouseMove,
			mouseup: this._onMouseUp,
			keydown: this._onKeyDown
		}, this);
	},

	_onMouseUp: function (e) {
		if ((e.which !== 1) && (e.button !== 1)) { return; }

		this._finish();

		if (!this._moved) { return; }
		// Postpone to next JS tick so internal click event handling
		// still see it as "moved".
		this._clearDeferredResetState();
		this._resetStateTimeout = setTimeout(bind(this._resetState, this), 0);

		var bounds = new LatLngBounds(
		        this._map.containerPointToLatLng(this._startPoint),
		        this._map.containerPointToLatLng(this._point));

		this._map
			.fitBounds(bounds)
			.fire('boxzoomend', {boxZoomBounds: bounds});
	},

	_onKeyDown: function (e) {
		if (e.keyCode === 27) {
			this._finish();
		}
	}
});

// @section Handlers
// @property boxZoom: Handler
// Box (shift-drag with mouse) zoom handler.
Map.addInitHook('addHandler', 'boxZoom', BoxZoom);

/*
 * L.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
 */

// @namespace Map
// @section Interaction Options

Map.mergeOptions({
	// @option doubleClickZoom: Boolean|String = true
	// Whether the map can be zoomed in by double clicking on it and
	// zoomed out by double clicking while holding shift. If passed
	// `'center'`, double-click zoom will zoom to the center of the
	//  view regardless of where the mouse was.
	doubleClickZoom: true
});

var DoubleClickZoom = Handler.extend({
	addHooks: function () {
		this._map.on('dblclick', this._onDoubleClick, this);
	},

	removeHooks: function () {
		this._map.off('dblclick', this._onDoubleClick, this);
	},

	_onDoubleClick: function (e) {
		var map = this._map,
		    oldZoom = map.getZoom(),
		    delta = map.options.zoomDelta,
		    zoom = e.originalEvent.shiftKey ? oldZoom - delta : oldZoom + delta;

		if (map.options.doubleClickZoom === 'center') {
			map.setZoom(zoom);
		} else {
			map.setZoomAround(e.containerPoint, zoom);
		}
	}
});

// @section Handlers
//
// Map properties include interaction handlers that allow you to control
// interaction behavior in runtime, enabling or disabling certain features such
// as dragging or touch zoom (see `Handler` methods). For example:
//
// ```js
// map.doubleClickZoom.disable();
// ```
//
// @property doubleClickZoom: Handler
// Double click zoom handler.
Map.addInitHook('addHandler', 'doubleClickZoom', DoubleClickZoom);

/*
 * L.Handler.MapDrag is used to make the map draggable (with panning inertia), enabled by default.
 */

// @namespace Map
// @section Interaction Options
Map.mergeOptions({
	// @option dragging: Boolean = true
	// Whether the map be draggable with mouse/touch or not.
	dragging: true,

	// @section Panning Inertia Options
	// @option inertia: Boolean = *
	// If enabled, panning of the map will have an inertia effect where
	// the map builds momentum while dragging and continues moving in
	// the same direction for some time. Feels especially nice on touch
	// devices. Enabled by default unless running on old Android devices.
	inertia: !android23,

	// @option inertiaDeceleration: Number = 3000
	// The rate with which the inertial movement slows down, in pixels/second².
	inertiaDeceleration: 3400, // px/s^2

	// @option inertiaMaxSpeed: Number = Infinity
	// Max speed of the inertial movement, in pixels/second.
	inertiaMaxSpeed: Infinity, // px/s

	// @option easeLinearity: Number = 0.2
	easeLinearity: 0.2,

	// TODO refactor, move to CRS
	// @option worldCopyJump: Boolean = false
	// With this option enabled, the map tracks when you pan to another "copy"
	// of the world and seamlessly jumps to the original one so that all overlays
	// like markers and vector layers are still visible.
	worldCopyJump: false,

	// @option maxBoundsViscosity: Number = 0.0
	// If `maxBounds` is set, this option will control how solid the bounds
	// are when dragging the map around. The default value of `0.0` allows the
	// user to drag outside the bounds at normal speed, higher values will
	// slow down map dragging outside bounds, and `1.0` makes the bounds fully
	// solid, preventing the user from dragging outside the bounds.
	maxBoundsViscosity: 0.0
});

var Drag = Handler.extend({
	addHooks: function () {
		if (!this._draggable) {
			var map = this._map;

			this._draggable = new Draggable(map._mapPane, map._container);

			this._draggable.on({
				dragstart: this._onDragStart,
				drag: this._onDrag,
				dragend: this._onDragEnd
			}, this);

			this._draggable.on('predrag', this._onPreDragLimit, this);
			if (map.options.worldCopyJump) {
				this._draggable.on('predrag', this._onPreDragWrap, this);
				map.on('zoomend', this._onZoomEnd, this);

				map.whenReady(this._onZoomEnd, this);
			}
		}
		addClass(this._map._container, 'leaflet-grab leaflet-touch-drag');
		this._draggable.enable();
		this._positions = [];
		this._times = [];
	},

	removeHooks: function () {
		removeClass(this._map._container, 'leaflet-grab');
		removeClass(this._map._container, 'leaflet-touch-drag');
		this._draggable.disable();
	},

	moved: function () {
		return this._draggable && this._draggable._moved;
	},

	moving: function () {
		return this._draggable && this._draggable._moving;
	},

	_onDragStart: function () {
		var map = this._map;

		map._stop();
		if (this._map.options.maxBounds && this._map.options.maxBoundsViscosity) {
			var bounds = toLatLngBounds(this._map.options.maxBounds);

			this._offsetLimit = toBounds(
				this._map.latLngToContainerPoint(bounds.getNorthWest()).multiplyBy(-1),
				this._map.latLngToContainerPoint(bounds.getSouthEast()).multiplyBy(-1)
					.add(this._map.getSize()));

			this._viscosity = Math.min(1.0, Math.max(0.0, this._map.options.maxBoundsViscosity));
		} else {
			this._offsetLimit = null;
		}

		map
		    .fire('movestart')
		    .fire('dragstart');

		if (map.options.inertia) {
			this._positions = [];
			this._times = [];
		}
	},

	_onDrag: function (e) {
		if (this._map.options.inertia) {
			var time = this._lastTime = +new Date(),
			    pos = this._lastPos = this._draggable._absPos || this._draggable._newPos;

			this._positions.push(pos);
			this._times.push(time);

			this._prunePositions(time);
		}

		this._map
		    .fire('move', e)
		    .fire('drag', e);
	},

	_prunePositions: function (time) {
		while (this._positions.length > 1 && time - this._times[0] > 50) {
			this._positions.shift();
			this._times.shift();
		}
	},

	_onZoomEnd: function () {
		var pxCenter = this._map.getSize().divideBy(2),
		    pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);

		this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
		this._worldWidth = this._map.getPixelWorldBounds().getSize().x;
	},

	_viscousLimit: function (value, threshold) {
		return value - (value - threshold) * this._viscosity;
	},

	_onPreDragLimit: function () {
		if (!this._viscosity || !this._offsetLimit) { return; }

		var offset = this._draggable._newPos.subtract(this._draggable._startPos);

		var limit = this._offsetLimit;
		if (offset.x < limit.min.x) { offset.x = this._viscousLimit(offset.x, limit.min.x); }
		if (offset.y < limit.min.y) { offset.y = this._viscousLimit(offset.y, limit.min.y); }
		if (offset.x > limit.max.x) { offset.x = this._viscousLimit(offset.x, limit.max.x); }
		if (offset.y > limit.max.y) { offset.y = this._viscousLimit(offset.y, limit.max.y); }

		this._draggable._newPos = this._draggable._startPos.add(offset);
	},

	_onPreDragWrap: function () {
		// TODO refactor to be able to adjust map pane position after zoom
		var worldWidth = this._worldWidth,
		    halfWidth = Math.round(worldWidth / 2),
		    dx = this._initialWorldOffset,
		    x = this._draggable._newPos.x,
		    newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
		    newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
		    newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;

		this._draggable._absPos = this._draggable._newPos.clone();
		this._draggable._newPos.x = newX;
	},

	_onDragEnd: function (e) {
		var map = this._map,
		    options = map.options,

		    noInertia = !options.inertia || this._times.length < 2;

		map.fire('dragend', e);

		if (noInertia) {
			map.fire('moveend');

		} else {
			this._prunePositions(+new Date());

			var direction = this._lastPos.subtract(this._positions[0]),
			    duration = (this._lastTime - this._times[0]) / 1000,
			    ease = options.easeLinearity,

			    speedVector = direction.multiplyBy(ease / duration),
			    speed = speedVector.distanceTo([0, 0]),

			    limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
			    limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),

			    decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
			    offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();

			if (!offset.x && !offset.y) {
				map.fire('moveend');

			} else {
				offset = map._limitOffset(offset, map.options.maxBounds);

				requestAnimFrame(function () {
					map.panBy(offset, {
						duration: decelerationDuration,
						easeLinearity: ease,
						noMoveStart: true,
						animate: true
					});
				});
			}
		}
	}
});

// @section Handlers
// @property dragging: Handler
// Map dragging handler (by both mouse and touch).
Map.addInitHook('addHandler', 'dragging', Drag);

/*
 * L.Map.Keyboard is handling keyboard interaction with the map, enabled by default.
 */

// @namespace Map
// @section Keyboard Navigation Options
Map.mergeOptions({
	// @option keyboard: Boolean = true
	// Makes the map focusable and allows users to navigate the map with keyboard
	// arrows and `+`/`-` keys.
	keyboard: true,

	// @option keyboardPanDelta: Number = 80
	// Amount of pixels to pan when pressing an arrow key.
	keyboardPanDelta: 80
});

var Keyboard = Handler.extend({

	keyCodes: {
		left:    [37],
		right:   [39],
		down:    [40],
		up:      [38],
		zoomIn:  [187, 107, 61, 171],
		zoomOut: [189, 109, 54, 173]
	},

	initialize: function (map) {
		this._map = map;

		this._setPanDelta(map.options.keyboardPanDelta);
		this._setZoomDelta(map.options.zoomDelta);
	},

	addHooks: function () {
		var container = this._map._container;

		// make the container focusable by tabbing
		if (container.tabIndex <= 0) {
			container.tabIndex = '0';
		}

		on(container, {
			focus: this._onFocus,
			blur: this._onBlur,
			mousedown: this._onMouseDown
		}, this);

		this._map.on({
			focus: this._addHooks,
			blur: this._removeHooks
		}, this);
	},

	removeHooks: function () {
		this._removeHooks();

		off(this._map._container, {
			focus: this._onFocus,
			blur: this._onBlur,
			mousedown: this._onMouseDown
		}, this);

		this._map.off({
			focus: this._addHooks,
			blur: this._removeHooks
		}, this);
	},

	_onMouseDown: function () {
		if (this._focused) { return; }

		var body = document.body,
		    docEl = document.documentElement,
		    top = body.scrollTop || docEl.scrollTop,
		    left = body.scrollLeft || docEl.scrollLeft;

		this._map._container.focus();

		window.scrollTo(left, top);
	},

	_onFocus: function () {
		this._focused = true;
		this._map.fire('focus');
	},

	_onBlur: function () {
		this._focused = false;
		this._map.fire('blur');
	},

	_setPanDelta: function (panDelta) {
		var keys = this._panKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.left.length; i < len; i++) {
			keys[codes.left[i]] = [-1 * panDelta, 0];
		}
		for (i = 0, len = codes.right.length; i < len; i++) {
			keys[codes.right[i]] = [panDelta, 0];
		}
		for (i = 0, len = codes.down.length; i < len; i++) {
			keys[codes.down[i]] = [0, panDelta];
		}
		for (i = 0, len = codes.up.length; i < len; i++) {
			keys[codes.up[i]] = [0, -1 * panDelta];
		}
	},

	_setZoomDelta: function (zoomDelta) {
		var keys = this._zoomKeys = {},
		    codes = this.keyCodes,
		    i, len;

		for (i = 0, len = codes.zoomIn.length; i < len; i++) {
			keys[codes.zoomIn[i]] = zoomDelta;
		}
		for (i = 0, len = codes.zoomOut.length; i < len; i++) {
			keys[codes.zoomOut[i]] = -zoomDelta;
		}
	},

	_addHooks: function () {
		on(document, 'keydown', this._onKeyDown, this);
	},

	_removeHooks: function () {
		off(document, 'keydown', this._onKeyDown, this);
	},

	_onKeyDown: function (e) {
		if (e.altKey || e.ctrlKey || e.metaKey) { return; }

		var key = e.keyCode,
		    map = this._map,
		    offset;

		if (key in this._panKeys) {
			if (!map._panAnim || !map._panAnim._inProgress) {
				offset = this._panKeys[key];
				if (e.shiftKey) {
					offset = toPoint(offset).multiplyBy(3);
				}

				map.panBy(offset);

				if (map.options.maxBounds) {
					map.panInsideBounds(map.options.maxBounds);
				}
			}
		} else if (key in this._zoomKeys) {
			map.setZoom(map.getZoom() + (e.shiftKey ? 3 : 1) * this._zoomKeys[key]);

		} else if (key === 27 && map._popup && map._popup.options.closeOnEscapeKey) {
			map.closePopup();

		} else {
			return;
		}

		stop(e);
	}
});

// @section Handlers
// @section Handlers
// @property keyboard: Handler
// Keyboard navigation handler.
Map.addInitHook('addHandler', 'keyboard', Keyboard);

/*
 * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
 */

// @namespace Map
// @section Interaction Options
Map.mergeOptions({
	// @section Mousewheel options
	// @option scrollWheelZoom: Boolean|String = true
	// Whether the map can be zoomed by using the mouse wheel. If passed `'center'`,
	// it will zoom to the center of the view regardless of where the mouse was.
	scrollWheelZoom: true,

	// @option wheelDebounceTime: Number = 40
	// Limits the rate at which a wheel can fire (in milliseconds). By default
	// user can't zoom via wheel more often than once per 40 ms.
	wheelDebounceTime: 40,

	// @option wheelPxPerZoomLevel: Number = 60
	// How many scroll pixels (as reported by [L.DomEvent.getWheelDelta](#domevent-getwheeldelta))
	// mean a change of one full zoom level. Smaller values will make wheel-zooming
	// faster (and vice versa).
	wheelPxPerZoomLevel: 60
});

var ScrollWheelZoom = Handler.extend({
	addHooks: function () {
		on(this._map._container, 'mousewheel', this._onWheelScroll, this);

		this._delta = 0;
	},

	removeHooks: function () {
		off(this._map._container, 'mousewheel', this._onWheelScroll, this);
	},

	_onWheelScroll: function (e) {
		var delta = getWheelDelta(e);

		var debounce = this._map.options.wheelDebounceTime;

		this._delta += delta;
		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

		if (!this._startTime) {
			this._startTime = +new Date();
		}

		var left = Math.max(debounce - (+new Date() - this._startTime), 0);

		clearTimeout(this._timer);
		this._timer = setTimeout(bind(this._performZoom, this), left);

		stop(e);
	},

	_performZoom: function () {
		var map = this._map,
		    zoom = map.getZoom(),
		    snap = this._map.options.zoomSnap || 0;

		map._stop(); // stop panning and fly animations if any

		// map the delta with a sigmoid function to -4..4 range leaning on -1..1
		var d2 = this._delta / (this._map.options.wheelPxPerZoomLevel * 4),
		    d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
		    d4 = snap ? Math.ceil(d3 / snap) * snap : d3,
		    delta = map._limitZoom(zoom + (this._delta > 0 ? d4 : -d4)) - zoom;

		this._delta = 0;
		this._startTime = null;

		if (!delta) { return; }

		if (map.options.scrollWheelZoom === 'center') {
			map.setZoom(zoom + delta);
		} else {
			map.setZoomAround(this._lastMousePos, zoom + delta);
		}
	}
});

// @section Handlers
// @property scrollWheelZoom: Handler
// Scroll wheel zoom handler.
Map.addInitHook('addHandler', 'scrollWheelZoom', ScrollWheelZoom);

/*
 * L.Map.Tap is used to enable mobile hacks like quick taps and long hold.
 */

// @namespace Map
// @section Interaction Options
Map.mergeOptions({
	// @section Touch interaction options
	// @option tap: Boolean = true
	// Enables mobile hacks for supporting instant taps (fixing 200ms click
	// delay on iOS/Android) and touch holds (fired as `contextmenu` events).
	tap: true,

	// @option tapTolerance: Number = 15
	// The max number of pixels a user can shift his finger during touch
	// for it to be considered a valid tap.
	tapTolerance: 15
});

var Tap = Handler.extend({
	addHooks: function () {
		on(this._map._container, 'touchstart', this._onDown, this);
	},

	removeHooks: function () {
		off(this._map._container, 'touchstart', this._onDown, this);
	},

	_onDown: function (e) {
		if (!e.touches) { return; }

		preventDefault(e);

		this._fireClick = true;

		// don't simulate click or track longpress if more than 1 touch
		if (e.touches.length > 1) {
			this._fireClick = false;
			clearTimeout(this._holdTimeout);
			return;
		}

		var first = e.touches[0],
		    el = first.target;

		this._startPos = this._newPos = new Point(first.clientX, first.clientY);

		// if touching a link, highlight it
		if (el.tagName && el.tagName.toLowerCase() === 'a') {
			addClass(el, 'leaflet-active');
		}

		// simulate long hold but setting a timeout
		this._holdTimeout = setTimeout(bind(function () {
			if (this._isTapValid()) {
				this._fireClick = false;
				this._onUp();
				this._simulateEvent('contextmenu', first);
			}
		}, this), 1000);

		this._simulateEvent('mousedown', first);

		on(document, {
			touchmove: this._onMove,
			touchend: this._onUp
		}, this);
	},

	_onUp: function (e) {
		clearTimeout(this._holdTimeout);

		off(document, {
			touchmove: this._onMove,
			touchend: this._onUp
		}, this);

		if (this._fireClick && e && e.changedTouches) {

			var first = e.changedTouches[0],
			    el = first.target;

			if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
				removeClass(el, 'leaflet-active');
			}

			this._simulateEvent('mouseup', first);

			// simulate click if the touch didn't move too much
			if (this._isTapValid()) {
				this._simulateEvent('click', first);
			}
		}
	},

	_isTapValid: function () {
		return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
	},

	_onMove: function (e) {
		var first = e.touches[0];
		this._newPos = new Point(first.clientX, first.clientY);
		this._simulateEvent('mousemove', first);
	},

	_simulateEvent: function (type, e) {
		var simulatedEvent = document.createEvent('MouseEvents');

		simulatedEvent._simulated = true;
		e.target._simulatedClick = true;

		simulatedEvent.initMouseEvent(
		        type, true, true, window, 1,
		        e.screenX, e.screenY,
		        e.clientX, e.clientY,
		        false, false, false, false, 0, null);

		e.target.dispatchEvent(simulatedEvent);
	}
});

// @section Handlers
// @property tap: Handler
// Mobile touch hacks (quick tap and touch hold) handler.
if (touch && !pointer) {
	Map.addInitHook('addHandler', 'tap', Tap);
}

/*
 * L.Handler.TouchZoom is used by L.Map to add pinch zoom on supported mobile browsers.
 */

// @namespace Map
// @section Interaction Options
Map.mergeOptions({
	// @section Touch interaction options
	// @option touchZoom: Boolean|String = *
	// Whether the map can be zoomed by touch-dragging with two fingers. If
	// passed `'center'`, it will zoom to the center of the view regardless of
	// where the touch events (fingers) were. Enabled for touch-capable web
	// browsers except for old Androids.
	touchZoom: touch && !android23,

	// @option bounceAtZoomLimits: Boolean = true
	// Set it to false if you don't want the map to zoom beyond min/max zoom
	// and then bounce back when pinch-zooming.
	bounceAtZoomLimits: true
});

var TouchZoom = Handler.extend({
	addHooks: function () {
		addClass(this._map._container, 'leaflet-touch-zoom');
		on(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	removeHooks: function () {
		removeClass(this._map._container, 'leaflet-touch-zoom');
		off(this._map._container, 'touchstart', this._onTouchStart, this);
	},

	_onTouchStart: function (e) {
		var map = this._map;
		if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }

		var p1 = map.mouseEventToContainerPoint(e.touches[0]),
		    p2 = map.mouseEventToContainerPoint(e.touches[1]);

		this._centerPoint = map.getSize()._divideBy(2);
		this._startLatLng = map.containerPointToLatLng(this._centerPoint);
		if (map.options.touchZoom !== 'center') {
			this._pinchStartLatLng = map.containerPointToLatLng(p1.add(p2)._divideBy(2));
		}

		this._startDist = p1.distanceTo(p2);
		this._startZoom = map.getZoom();

		this._moved = false;
		this._zooming = true;

		map._stop();

		on(document, 'touchmove', this._onTouchMove, this);
		on(document, 'touchend', this._onTouchEnd, this);

		preventDefault(e);
	},

	_onTouchMove: function (e) {
		if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

		var map = this._map,
		    p1 = map.mouseEventToContainerPoint(e.touches[0]),
		    p2 = map.mouseEventToContainerPoint(e.touches[1]),
		    scale = p1.distanceTo(p2) / this._startDist;

		this._zoom = map.getScaleZoom(scale, this._startZoom);

		if (!map.options.bounceAtZoomLimits && (
			(this._zoom < map.getMinZoom() && scale < 1) ||
			(this._zoom > map.getMaxZoom() && scale > 1))) {
			this._zoom = map._limitZoom(this._zoom);
		}

		if (map.options.touchZoom === 'center') {
			this._center = this._startLatLng;
			if (scale === 1) { return; }
		} else {
			// Get delta from pinch to center, so centerLatLng is delta applied to initial pinchLatLng
			var delta = p1._add(p2)._divideBy(2)._subtract(this._centerPoint);
			if (scale === 1 && delta.x === 0 && delta.y === 0) { return; }
			this._center = map.unproject(map.project(this._pinchStartLatLng, this._zoom).subtract(delta), this._zoom);
		}

		if (!this._moved) {
			map._moveStart(true, false);
			this._moved = true;
		}

		cancelAnimFrame(this._animRequest);

		var moveFn = bind(map._move, map, this._center, this._zoom, {pinch: true, round: false});
		this._animRequest = requestAnimFrame(moveFn, this, true);

		preventDefault(e);
	},

	_onTouchEnd: function () {
		if (!this._moved || !this._zooming) {
			this._zooming = false;
			return;
		}

		this._zooming = false;
		cancelAnimFrame(this._animRequest);

		off(document, 'touchmove', this._onTouchMove);
		off(document, 'touchend', this._onTouchEnd);

		// Pinch updates GridLayers' levels only when zoomSnap is off, so zoomSnap becomes noUpdate.
		if (this._map.options.zoomAnimation) {
			this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
		} else {
			this._map._resetView(this._center, this._map._limitZoom(this._zoom));
		}
	}
});

// @section Handlers
// @property touchZoom: Handler
// Touch zoom handler.
Map.addInitHook('addHandler', 'touchZoom', TouchZoom);

Map.BoxZoom = BoxZoom;
Map.DoubleClickZoom = DoubleClickZoom;
Map.Drag = Drag;
Map.Keyboard = Keyboard;
Map.ScrollWheelZoom = ScrollWheelZoom;
Map.Tap = Tap;
Map.TouchZoom = TouchZoom;

Object.freeze = freeze;

exports.version = version;
exports.Control = Control;
exports.control = control;
exports.Browser = Browser;
exports.Evented = Evented;
exports.Mixin = Mixin;
exports.Util = Util;
exports.Class = Class;
exports.Handler = Handler;
exports.extend = extend;
exports.bind = bind;
exports.stamp = stamp;
exports.setOptions = setOptions;
exports.DomEvent = DomEvent;
exports.DomUtil = DomUtil;
exports.PosAnimation = PosAnimation;
exports.Draggable = Draggable;
exports.LineUtil = LineUtil;
exports.PolyUtil = PolyUtil;
exports.Point = Point;
exports.point = toPoint;
exports.Bounds = Bounds;
exports.bounds = toBounds;
exports.Transformation = Transformation;
exports.transformation = toTransformation;
exports.Projection = index;
exports.LatLng = LatLng;
exports.latLng = toLatLng;
exports.LatLngBounds = LatLngBounds;
exports.latLngBounds = toLatLngBounds;
exports.CRS = CRS;
exports.GeoJSON = GeoJSON;
exports.geoJSON = geoJSON;
exports.geoJson = geoJson;
exports.Layer = Layer;
exports.LayerGroup = LayerGroup;
exports.layerGroup = layerGroup;
exports.FeatureGroup = FeatureGroup;
exports.featureGroup = featureGroup;
exports.ImageOverlay = ImageOverlay;
exports.imageOverlay = imageOverlay;
exports.VideoOverlay = VideoOverlay;
exports.videoOverlay = videoOverlay;
exports.SVGOverlay = SVGOverlay;
exports.svgOverlay = svgOverlay;
exports.DivOverlay = DivOverlay;
exports.Popup = Popup;
exports.popup = popup;
exports.Tooltip = Tooltip;
exports.tooltip = tooltip;
exports.Icon = Icon;
exports.icon = icon;
exports.DivIcon = DivIcon;
exports.divIcon = divIcon;
exports.Marker = Marker;
exports.marker = marker;
exports.TileLayer = TileLayer;
exports.tileLayer = tileLayer;
exports.GridLayer = GridLayer;
exports.gridLayer = gridLayer;
exports.SVG = SVG;
exports.svg = svg$1;
exports.Renderer = Renderer;
exports.Canvas = Canvas;
exports.canvas = canvas$1;
exports.Path = Path;
exports.CircleMarker = CircleMarker;
exports.circleMarker = circleMarker;
exports.Circle = Circle;
exports.circle = circle;
exports.Polyline = Polyline;
exports.polyline = polyline;
exports.Polygon = Polygon;
exports.polygon = polygon;
exports.Rectangle = Rectangle;
exports.rectangle = rectangle;
exports.Map = Map;
exports.map = createMap;

var oldL = window.L;
exports.noConflict = function() {
	window.L = oldL;
	return this;
}

// Always export us to window global (see #2364)
window.L = exports;

})));
//# sourceMappingURL=leaflet-src.js.map


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var stylesInDom = {};

var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

function listToStyles(list, options) {
  var styles = [];
  var newStyles = {};

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var css = item[1];
    var media = item[2];
    var sourceMap = item[3];
    var part = {
      css: css,
      media: media,
      sourceMap: sourceMap
    };

    if (!newStyles[id]) {
      styles.push(newStyles[id] = {
        id: id,
        parts: [part]
      });
    } else {
      newStyles[id].parts.push(part);
    }
  }

  return styles;
}

function addStylesToDom(styles, options) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i];
    var domStyle = stylesInDom[item.id];
    var j = 0;

    if (domStyle) {
      domStyle.refs++;

      for (; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j]);
      }

      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j], options));
      }
    } else {
      var parts = [];

      for (; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j], options));
      }

      stylesInDom[item.id] = {
        id: item.id,
        refs: 1,
        parts: parts
      };
    }
  }
}

function insertStyleElement(options) {
  var style = document.createElement('style');

  if (typeof options.attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : undefined;

    if (nonce) {
      options.attributes.nonce = nonce;
    }
  }

  Object.keys(options.attributes).forEach(function (key) {
    style.setAttribute(key, options.attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  }

  if (sourceMap && btoa) {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {};
  options.attributes = typeof options.attributes === 'object' ? options.attributes : {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  var styles = listToStyles(list, options);
  addStylesToDom(styles, options);
  return function update(newList) {
    var mayRemove = [];

    for (var i = 0; i < styles.length; i++) {
      var item = styles[i];
      var domStyle = stylesInDom[item.id];

      if (domStyle) {
        domStyle.refs--;
        mayRemove.push(domStyle);
      }
    }

    if (newList) {
      var newStyles = listToStyles(newList, options);
      addStylesToDom(newStyles, options);
    }

    for (var _i = 0; _i < mayRemove.length; _i++) {
      var _domStyle = mayRemove[_i];

      if (_domStyle.refs === 0) {
        for (var j = 0; j < _domStyle.parts.length; j++) {
          _domStyle.parts[j]();
        }

        delete stylesInDom[_domStyle.id];
      }
    }
  };
};

/***/ }),

/***/ "./src/Feed.js":
/*!*********************!*\
  !*** ./src/Feed.js ***!
  \*********************/
/*! exports provided: Feed, toPopupDisplay, dissolve */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Feed", function() { return Feed; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toPopupDisplay", function() { return toPopupDisplay; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dissolve", function() { return dissolve; });
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! leaflet */ "./node_modules/leaflet/dist/leaflet-src.js");
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(leaflet__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Station__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Station */ "./src/Station.js");
/* harmony import */ var _Vehicle__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Vehicle */ "./src/Vehicle.js");





class Feed {
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

    generateFeatureGroup(objects, options) {
        let displayOpts = options.displayOpts;
        let popup = options.popup;
        let layers = objects.map(obj => {
            let marker = generateMarker(obj, displayOpts);
            if (typeof popup !== 'undefined') {

                marker.bindPopup(toPopupDisplay(dissolve(obj)));
            }
            return marker;
        });
        let lg = leaflet__WEBPACK_IMPORTED_MODULE_0___default.a.featureGroup(layers);
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
                    return new _Vehicle__WEBPACK_IMPORTED_MODULE_2__["Vehicle"](v);
                });

                let createdStations = {};
                for (let info in data[1]) {
                    let station = data[1][info];
                    createdStations[station["station_id"]] = new _Station__WEBPACK_IMPORTED_MODULE_1__["Station"](station);
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
            marker = new leaflet__WEBPACK_IMPORTED_MODULE_0___default.a.marker([obj.lat, obj.lon], displayOpts.options);
            break;
        case "circle":
            marker = new leaflet__WEBPACK_IMPORTED_MODULE_0___default.a.circleMarker([obj.lat, obj.lon], displayOpts.options);
            break;
    }
    return marker;
}

/**
 * Converts Array of JSON Objects into HTML with keys bolded and followed with a colon.
 * @param {Object[]} objects Array of JSON objects representing keys and values
 */
function toPopupDisplay(objects) {
    let str = "";

    for (let obj in objects) {
        for (let l in objects[obj]) {
            str += "<strong>" + l + ":</strong> " + objects[obj][l].toString().replace(/,/g, ", ") + "<br />";
        }
    }
    return str;
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

function dissolve(json) {

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

/***/ }),

/***/ "./src/Station.js":
/*!************************!*\
  !*** ./src/Station.js ***!
  \************************/
/*! exports provided: Station */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Station", function() { return Station; });
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
        for (let s in json) {
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

/***/ }),

/***/ "./src/Vehicle.js":
/*!************************!*\
  !*** ./src/Vehicle.js ***!
  \************************/
/*! exports provided: Vehicle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Vehicle", function() { return Vehicle; });
/**
 * Represents a GBFS Vehicle/Bike.
 */
class Vehicle {

    /**
     * Constructs a Vehcile based on its JSON representation in free_bike_status.json.
     * @param {Object} json The JSON for this vehcile in free_bike_status.json.
     */
    constructor(json) {
        this.info = {};

        for (let i in json) {
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
                    this.info[i] = json[i];
                    break;
            }
        }
    }
}

/***/ }),

/***/ "./src/index.html":
/*!************************!*\
  !*** ./src/index.html ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n<html lang=\"en\">\n\n<head>\n  <meta charset=\"utf-8\">\n  <meta http-equiv=\"x-ua-compatible\" content=\"ie=edge\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\">\n\n  <title>GBFS Viewer</title>\n\n  <link rel=\"stylesheet\" href=\"https://unpkg.com/leaflet@1.5.1/dist/leaflet.css\"\n    integrity=\"sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ==\"\n    crossorigin=\"\" />\n\n  <script src=\"https://unpkg.com/leaflet@1.5.1/dist/leaflet.js\"\n    integrity=\"sha512-GffPMF3RvMeYyc1LWMHtK8EbPv0iNZ8/oTtHPx9/cc2ILxQ+u905qIwdpULaqDkyBKgOaB57QTMg7ztg8Jm2Og==\"\n    crossorigin=\"\"></script>\n</head>\n\n<body>\n\n  <div id=\"gbfsMap\"></div>\n\n<!--  <div id=\"loader\">Loading data...</div>-->\n\n  <div id=\"modal-container\" style=\"display: none;\">\n    <div id=\"modal\">\n      <div id=\"close\" onclick=\"document.getElementById('modal-container').style.display = 'none'\">❌</div>\n      <h1>GBFS Viewer</h1>\n      <h2>A simple viewer for GBFS feeds.</h2>\n      <p>This instance of GBFS Viewer is for Providence, Rhode Island. It shows realtime vehicle locations and station\n        information from the JUMP Bike Share program, and realtime vehicle locations from the two current operators of\n        the E-Scooter Share Program, Bird and Lime.</p>\n      <p>Providence has designated five \"zones\" for the vehicle fleet distribution requirements in its E-Scooter Share\n        Program. These five zones are shown in orange. Clicking on each zone will show a count of vehicles and stations within each.</p>\n      <p><a href=\"http://www.providenceri.gov/planning/jump-bike-share/\">Learn more about the JUMP Bike Share\n          program.</a></p>\n      <p><a href=\"http://www.providenceri.gov/planning/e-scooter-share-pilot-program/\">Learn more about the E-Scooter\n          Share Program.</a></p>\n      <p><a href=\"https://github.com/chris-sarli/GBFS-Viewer\">View GBFS Viewer on GitHub.</a></p>\n    </div>\n  </div>\n\n</body>\n\n</html>";

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index_html__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.html */ "./src/index.html");
/* harmony import */ var _index_html__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_index_html__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./style.css */ "./src/style.css");
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_style_css__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! leaflet */ "./node_modules/leaflet/dist/leaflet-src.js");
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(leaflet__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _turf_boolean_point_in_polygon__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @turf/boolean-point-in-polygon */ "./node_modules/@turf/boolean-point-in-polygon/index.js");
/* harmony import */ var _turf_boolean_point_in_polygon__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_turf_boolean_point_in_polygon__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _turf_helpers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @turf/helpers */ "./node_modules/@turf/helpers/index.js");
/* harmony import */ var _turf_helpers__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_turf_helpers__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _turf_invariant__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @turf/invariant */ "./node_modules/@turf/invariant/index.js");
/* harmony import */ var _turf_invariant__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_turf_invariant__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _turf_meta__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @turf/meta */ "./node_modules/@turf/meta/index.js");
/* harmony import */ var _turf_meta__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_turf_meta__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _options__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./options */ "./src/options.js");
/* harmony import */ var _Feed__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Feed */ "./src/Feed.js");












let app = {}

app.options = _options__WEBPACK_IMPORTED_MODULE_7__["options"];

// Holds the OldFeed objects
app.feeds = [];

app.zs = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.marker();

// Create the basemaps that will be available
app.basemaps = function () {
    let out = {};
    for (let mapName in app.options.basemaps) {
        out[mapName] = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.tileLayer(app.options.basemaps[mapName].url, app.options.basemaps[mapName].opts);
    }
    return out;
}();

app.zones = {};

// Holds the Overlay Layers for each OldFeed object
app.feedLayers = {};

// The leaflet Control.Layer
app.layersControl = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.control.layers(app.basemaps, app.feedLayers, {collapsed: false});

app.map = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.map(app.options.mapObject, {
    layers: Object.values(app.basemaps)
});

// Custom button control
app.customButtons = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.Control.extend({
    options: {
        position: 'bottomright'
    },
    onAdd: function (map) {

        let container = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.DomUtil.create('div', '');
        container.innerHTML = `

        <div class='custom-collection'>
    
        <div class='leaflet-bar leaflet-control leaflet-control-custom' onclick='document.getElementById("modal-container").style.display = ""'><span class='symbol'>ⓘ</span> About</div>

        <div id="reload" class='leaflet-bar leaflet-control leaflet-control-custom fix-margin'><span class='symbol'>↻</span> Reload Data...</div>
        
        </div>
        `;
        return container;
    },
});

// Create an instance of the custom control buttons and add it to the map
let custom = new app.customButtons();
custom.addTo(app.map);

function getZoneCounts(zone) {
    let keys = Object.keys(app.zones[zone].objs);
    console.log(zone, keys)
    return keys.map(key => {
        let o = {};
        o[key] = app.zones[zone].objs[key];
        return o;
    });
}

// Add Zone geoJSON to map if specified
if (typeof app.options.zones !== 'undefined') {

    // Create the polygons
    app.systemZones = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.geoJSON(app.options.zones.data, app.options.zones.display);

    Object(_turf_meta__WEBPACK_IMPORTED_MODULE_6__["featureEach"])(Object(_turf_invariant__WEBPACK_IMPORTED_MODULE_5__["getGeom"])(app.options.zones.data), (c, i) => {
        app.zones[c.properties.zone] = {objs: {}};
        app.zones[c.properties.zone].poly = c.geometry;
    });
    console.log(app.zones);
}

/**
 * Creates OldFeed objects from indicated feeds.
 * @param {Object[]} specified Array of Objects representing feeds to be added to map.
 */
function createFeeds(specified) {
    let feeds = [];
    for (let f in specified) {
        let feedToAdd = specified[f];
        let feed = new _Feed__WEBPACK_IMPORTED_MODULE_8__["Feed"](feedToAdd, _options__WEBPACK_IMPORTED_MODULE_7__["options"].files);
        // feed.getFeatureGroups(app.options.files);
        feeds.push([feed]);
    }

    return feeds;
}

// This is here because of CORS
(function () {
    let cors_api_host = 'cors-anywhere.herokuapp.com';
    let cors_api_url = 'https://' + cors_api_host + '/';
    let slice = [].slice;
    let origin = window.location.protocol + '//' + window.location.host;
    let open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
        let args = slice.call(arguments);
        let targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
})();

// Variable to track loading state of view
let loading = false;


function clearZoneCounts() {
    for (let z in app.zones) {
        app.zones[z].objs = {};
    }
    app.UNZONED = {};
}

// Clear map and load
function load() {
    deactivateReloader();
    clearZoneCounts();
    return new Promise(function (resolve) {

        for (let feedLayer in app.feedLayers) {
            app.feedLayers[feedLayer].eachLayer(function (layerToRemove) {
                app.feedLayers[feedLayer].removeLayer(layerToRemove);
            });
            app.layersControl.removeLayer(app.feedLayers[feedLayer]);
        }

        app.feeds = createFeeds(app.options.feeds);

        app.map.fitBounds(app.options.bounds);

        let featurePromises = [];

        for (let f in app.feeds) {
            featurePromises = featurePromises.concat(app.feeds[f].map(feed => {
                return feed.makeLeafletObjects();
            }));
        }

        Promise.all(featurePromises).then(feedGroups => {
            let userLayers = {};
            feedGroups.map(feedGroup => {
                userLayers = {...userLayers, ...feedGroup};
            });
            return userLayers;
        }).then(userLayers => {
            app.map.addControl(app.layersControl);
            Object.keys(userLayers).forEach(key => {
                userLayers[key].eachLayer(m => {
                        let ll = m.getLatLng();
                        distributeToZones(ll.lat, ll.lng, key);
                    }
                );
            })
            return userLayers;
        }).then(userLayers => {
            app.zs.removeFrom(app.map);
            app.zs = (function () {
                // If specified, bind popups to individual polygon zones
                if (typeof app.options.zones.popup !== 'undefined') {
                    return app.systemZones.bindPopup(function (layer) {
                        let str = app.options.zones.popup.title + layer.feature.properties[app.options.zones.popup.geoJsonField];
                        str += `<br />`;
                        str += Object(_Feed__WEBPACK_IMPORTED_MODULE_8__["toPopupDisplay"])(getZoneCounts(layer.feature.properties[app.options.zones.popup.geoJsonField]));
                        return str;
                    });
                } else {
                    return app.systemZones;
                }
            })();
            app.zs.addTo(app.map);
            return userLayers;
        }).then(userLayers => {
            Object.keys(userLayers).forEach(key => {
                app.map.addLayer(userLayers[key]);
                app.feedLayers[key] = userLayers[key];
                app.layersControl.addOverlay(userLayers[key], key);
            });
        }).finally(_f => {
            // if (document.getElementById('loader') != undefined) {
            //     document.getElementById('loader').remove();
            // }

            resolve(true);
        });
    }).then(() => {
        activateReloader();
    });
}

function distributeToZones(lat, lon, feed) {

    let zoned = false;
    for(let z in app.zones) {
        let zone = app.zones[z];
        if (!zoned && _turf_boolean_point_in_polygon__WEBPACK_IMPORTED_MODULE_3___default()([lon, lat], zone.poly)) {
            let a = zone.objs[feed];
            if (typeof a === 'undefined') {
                app.zones[z].objs[feed] = 1;
            }
            else {
                app.zones[z].objs[feed] = a + 1;
            }
            zoned = true;
        }
    }
    if(!zoned) {
        let a = app.UNZONED;
        if (typeof a === 'undefined') {
            app.UNZONED = {};
        }
        let b = app.UNZONED[feed];
        if (typeof b === 'undefined') {
            app.UNZONED[feed] = 0;
        }
        b = app.UNZONED[feed];
        app.UNZONED[feed] = b + 1;
    }
}

function activateReloader() {
    let elem = document.getElementById("reload");
    elem.classList.remove('buttonLoading');
    elem.innerHTML = "<span class='symbol'>↻</span> Reload Data...";
    elem.onclick = function () {
        load();
    };
}

function deactivateReloader() {
    let elem = document.getElementById("reload");
    elem.innerHTML = "<span class='symbol spin'>↻</span> Loading...";
    elem.onclick = function () {
    };
    elem.classList.add('buttonLoading');
}

// Load on load :)
load();

/***/ }),

/***/ "./src/options.js":
/*!************************!*\
  !*** ./src/options.js ***!
  \************************/
/*! exports provided: options */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "options", function() { return options; });
const zones = __webpack_require__(/*! json-loader!./zones.geojson */ "./node_modules/json-loader/index.js!./src/zones.geojson");

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

let options = {
    mapObject: 'gbfsMap',
    bounds: [[41.7703, -71.4777], [41.8648, -71.3706]],
    files: files,
    basemaps: tileBasemapsToInclude,
    feeds: feedsToInclude,
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

/***/ }),

/***/ "./src/style.css":
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var content = __webpack_require__(/*! !../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./src/style.css");

if (typeof content === 'string') {
  content = [[module.i, content, '']];
}

var options = {}

options.insert = "head";
options.singleton = false;

var update = __webpack_require__(/*! ../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js")(content, options);

if (content.locals) {
  module.exports = content.locals;
}


/***/ })

/******/ });