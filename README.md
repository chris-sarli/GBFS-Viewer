# GBFS Viewer

GBFS Viewer is a set of tools developed to help make sense of [GBFS](https://github.com/NABSA/gbfs) feeds.

First and foremost, GBFS Viewer is a public-facing web application. It can be configured to show different feeds and cities. The [deployed version](https://chris-sarli.github.io/GBFS-Viewer/) is set up for Providence, RI. Currently, the tool plots locations and isochrones. Other tools are included, primarily a series of Python scripts used to pre-generate isochrones from Open Street Map data.

While GBFS Viewer is adaptable to any city/set of feeds, its feature set is informed by my own interests and the specific geographic, technical, and political conditions of Providence. There are currently no plans for further generalization, though suggestions are welcome.

## Project Organization

### Web App

“GBFS Viewer” the app is largely based on [Leaflet](https://leafletjs.com). It is intended to be lightweight and compatible with a wide range of devices and mindful of users with limited bandwidth.

The `app` directory contains all web-based development.

### Tools

Tools are located in the `tools` directory. Currently, the only included tool is the isochrone generator.

#### Common

`tools/common` contains `GBFS-Viewer_Conda.yml`, a configuration file for the [Conda](https://docs.conda.io/en/latest/) environment used in isochrone generation.

To create a Conda environment from this file, first `cd` into the `tools` directory and run:

```conda env create -n GBFS-Viewer -f ./GBFS-Viewer_Conda.yml```

To create the environment with a different name, replace `GBFS-Viewer` with the desired name.

#### Isochrone Generation

The `tools/isochrone_generation` directory contains scripts for the downloading of OpenStreetMap data and creation of isochrones. This process relies heavily on [OSMnx](https://github.com/gboeing/osmnx), and was guided largely by [Geoff Boeing](https://geoffboeing.com)’s very helpful [examples](https://github.com/gboeing/osmnx-examples/blob/master/notebooks/13-isolines-isochrones.ipynb).