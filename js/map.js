function map1x(map1x_argument) {
    return (map1x_argument - 0.5) * 2;
}

function map1y(map1y_argument) {
    return map1y_argument;
}

function map2y(map2y_argument) {
    return BRY * (map2y_argument * map2y_argument / H + map2y_argument * 1.5) / 2.5;
}

function map2x(map2x_argument, map2y_argument) {
    return (TRX + (BRX - TRX) * map2y(map2y_argument) / BRY) * map2x_argument / W;
}

function map3x(map3x_argument) {
    return map3x_argument + PITCH3_TCX - BALLX / 2;
}

function map3y(map3y_argument) {
    return map3y_argument + PITCH3_TCY - BALLY;
}

function mapx(mapx_argument, mapy_argument) {
    return map3x(map2x(map1x(mapx_argument), map1y(mapy_argument)));
}

function mapy(mapx_argument, mapy_argument) {
    return map3y(map2y(map1y(mapy_argument)));
}

function mapnx(x, y) {
    return mapx(x, y) + BALLX / 2;
}

function mapny(x, y) {
    return mapy(x, y) + BALLY;
}