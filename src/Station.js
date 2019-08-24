/**
 * Represents a GBFS Hub/Station
 */
export class Station {

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