import json

d = None
with open('data/mapping.json') as jf:
    d = json.load(jf)

mappings = []

for lat in d:
    inner = []
    for lon in d[lat]:
        inner.append(int(d[lat][lon]))
    mappings.append(inner)

output = {}
output['meta'] = {
    'grid_size': 0.0005,
    'bbox': {
        'north': 41.861571,
        'south': 41.772414,
        'east': -71.3736135,
        'west': -71.472667
    }
}
output['mappings'] = mappings

with open('data/refined.json', 'w+') as rj:
    json.dump(output, rj)
