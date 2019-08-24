/**
 * Represents a GBFS Vehicle/Bike.
 */
export class Vehicle {

    /**
     * Constructs a Vehcile based on its JSON representation in free_bike_status.json.
     * @param {Object} json The JSON for this vehcile in free_bike_status.json.
     */
    constructor(json) {
        this.misc = {};

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
                    this.misc[i] = json[i];
                    break;
            }
        }
    }
}