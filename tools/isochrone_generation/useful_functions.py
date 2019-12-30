def get_grid_count(a, b, grid_size):
    return int(abs(b - a) / grid_size)


def get_bounds(filename):
    bbox_file = open(filename, "r")
    bbox_lines = bbox_file.read().splitlines()
    bbox_file.close()

    north = float(bbox_lines[0])
    south = float(bbox_lines[1])
    east = float(bbox_lines[3])
    west = float(bbox_lines[2])

    return [[north, south], [east, west]]


def get_leading_zeros(x):
    c = 0
    while int(x) == 0:
        x *= 10
        c += 1
    return c


def round_down(x, i):
    return round(i * int(x / i), get_leading_zeros(i))


def round_up(x, i):
    return round(i * (int(x / i) + 1), get_leading_zeros(i))


def make_ls(a, b, grid_size):
    high = round_up(max(a, b), grid_size)
    low = round_down(min(a, b), grid_size)

    values = []
    val = low
    while val <= high:
        values.append(val)
        val = round(val + grid_size, get_leading_zeros(grid_size))

    return values
