import json
from useful_functions import get_bounds, make_ls
import warnings
from colorama import init
from termcolor import colored
import geopandas as gpd
import networkx as nx
from fiona.crs import from_epsg
from shapely.geometry import Point, Polygon, LineString
from descartes import PolygonPatch
import matplotlib.pyplot as plt
import osmnx as ox
import os

init()  # Colorama

unprojected_filename = "unprojected_graph.graphml"
projected_filename = "projected_graph.graphml"

bbox_filename = "data/bbox.txt"
output_filename = "data/mapping.json"

# configure the place, trip times, and travel speed
trip_times = [2, 5, 10]  # in minutes
travel_speed = 4.5  # walking speed in km/hour

grid_size = 0.0005

ox.config(log_console=True, use_cache=True)

bbox = get_bounds(bbox_filename)
lats = make_ls(bbox[0][0], bbox[0][1], grid_size)
lons = make_ls(bbox[1][0], bbox[1][1], grid_size)

# load the street network
unprojected = ox.load_graphml(unprojected_filename)
projected = ox.load_graphml(projected_filename)

table = {}
previously_calculated = []

os.makedirs("data/geojson", exist_ok=True)

def make_iso_polys(G_unprojected, G_projected, coordinates, edge_buff=50, node_buff=50, plotting=False):
    # Find the node nearest the requested points
    nearest_node = ox.get_nearest_node(G_unprojected, coordinates)
    node_id = str(nearest_node)

    # Check to see if this node has already been calculated
    if node_id in previously_calculated:
        print(colored("Node {} already calculated.".format(node_id), 'yellow'))
    else:
        previously_calculated.append(node_id)
        isochrone_polys = {}
        ogd = gpd.GeoDataFrame()
        ogd['geometry'] = None
        ogd['time'] = None
        for trip_time in sorted(trip_times, reverse=True):
            subgraph = nx.ego_graph(G_projected, nearest_node, radius=trip_time, distance='time')

            node_points = [Point((data['x'], data['y'])) for node, data in subgraph.nodes(data=True)]
            nodes_gdf = gpd.GeoDataFrame({'id': subgraph.nodes()}, geometry=node_points, crs=from_epsg(32619))
            nodes_gdf = nodes_gdf.set_index('id')

            edge_lines = []
            for n_fr, n_to in subgraph.edges():
                f = nodes_gdf.loc[n_fr].geometry
                t = nodes_gdf.loc[n_to].geometry
                edge_lines.append(LineString([f, t]))

            n = nodes_gdf.buffer(node_buff).geometry
            e = gpd.GeoSeries(edge_lines).buffer(edge_buff).geometry
            all_gs = list(n) + list(e)
            new_iso = gpd.GeoSeries(all_gs).unary_union

            # try to fill in surrounded areas so shapes will appear solid and blocks without white space inside them
            new_iso = Polygon(new_iso.exterior)

            isochrone_polys[trip_time] = new_iso
            ogd.loc[trip_time, 'geometry'] = new_iso
            ogd.loc[trip_time, 'time'] = trip_time

        ogd.crs = from_epsg(32619)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            ogd = ogd.to_crs(epsg=4326)
        print(ogd.head())

        gj = ogd.to_json()
        jf = open("./data/geojson/" + str(nearest_node) + ".geojson", "w+")
        jf.write(gj)
        jf.close()

        if plotting:
            iso_colors = ox.get_colors(n=len(trip_times), cmap='Blues', start=0.3, return_hex=True)
            fig, ax = ox.plot_graph(G_projected, fig_height=8, show=False, close=False, edge_color='k', edge_alpha=0.2,
                                    node_color='none', dpi=244)
            for polygon, fc in zip(isochrone_polys.values(), iso_colors):
                patch = PolygonPatch(polygon, fc=fc, ec='none', alpha=0.6, zorder=-1)
                ax.add_patch(patch)
            plt.show()
        print(colored("DONE", 'green'))
    return node_id


for lat in lats:
    row = {}
    for lon in lons:
        nearest_node_id = make_iso_polys(unprojected, projected, (lat, lon))
        row[lon] = nearest_node_id
    table[lat] = row

with open(output_filename, "w+") as output_fp:
    json.dump(table, output_fp)
