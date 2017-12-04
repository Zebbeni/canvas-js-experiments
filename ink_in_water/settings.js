var RANDOMIZE_COLORS = false;
var COLOR_VARIABILITY = 10.0;
var SHADE_STREAMS = false;
var SHOW_BLEEDERS = true;
var MAX_SPEED = 0.5;

var toggleRandomizeColors = function() {
    RANDOMIZE_COLORS = !RANDOMIZE_COLORS;
};

var toggleShadeStreams = function() {
    SHADE_STREAMS = !SHADE_STREAMS;
}

var toggleShowBleeders = function() {
    SHOW_BLEEDERS = !SHOW_BLEEDERS;
}

var setColorVariability = function(value) {
    COLOR_VARIABILITY = value;
}

var setMaxStreamSpeed = function(value) {
    MAX_SPEED = value;
}