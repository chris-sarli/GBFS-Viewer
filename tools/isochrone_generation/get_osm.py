import osmnx as ox

# Define filenames for storage of downloaded graphs
filename_projected = "projected_graph.graphml"
filename_unprojected = "unprojected_graph.graphml"

# Define filename to store bounding box
bounding_box_df = r'data/bbox.txt'

# Configure the place, network type
place = 'Providence, RI, USA'
network_type = 'walk'

# Configure OSMnx
ox.config(log_console=True, use_cache=True)

# First, get a GeoDataFrame of the network, and use it to create the bounding box
gdf = ox.gdf_from_place(place)

bbox_file = open(bounding_box_df, 'w+')
lines = ["bbox_north", "bbox_south", "bbox_east", "bbox_west"]
for line in lines:
    bbox_file.write("{}\n".format(str(gdf.loc[0, line])))
bbox_file.close()

# Download the street network, and save it (unprojected)
G = ox.graph_from_place(place, network_type=network_type)
ox.save_graphml(G, filename=filename_unprojected, gephi=False)

# Project the graph, save that projected version
projected = ox.project_graph(G)
ox.save_graphml(projected, filename=filename_projected, gephi=False)
