iD.util.SuggestNames = function(preset, suggestions) {
    preset = preset.id.split('/', 2);
    var k = preset[0],
        v = preset[1];

    return function(value, callback) {
        var result = [];
        // Either length > 2 or any CJK ideograph
        if (value && (value.length > 2 || value.match(/[\u3400-\u9FAF]/))) {
            if (suggestions[k] && suggestions[k][v]) {
                _.forEach (suggestions[k][v], function (sugg) {
                    var dist;
                    if (value.length > 2) {
                        dist = iD.util.editDistance(value, sugg.substring(0, value.length));
                        if (dist < 3) {
                            result.push({
                                title: sugg,
                                value: sugg,
                                dist: dist
                            });
                        }
                    } else {
                        var i = sugg.indexOf(value);
                        if (i > -1) {
                            dist = 0;
                            if (i>0) dist = 1;
                            result.push({
                                title: sugg,
                                value: sugg,
                                dist: dist
                            });
                        }
                    }
                });
            }
            result.sort(function(a, b) {
                return a.dist - b.dist;
            });
        }
        result = result.slice(0,3);
        callback(result);
    };
};
