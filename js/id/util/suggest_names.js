iD.util.SuggestNames = function(preset, suggestions) {
    preset = preset.id.split('/', 2);
    var k = preset[0],
        v = preset[1];

    return function(value, callback) {
        var result = [];
        // Either length > 2 or any CJK ideograph
        if (value && (value.length > 2 || value.match(/[\u3400-\u9FAF]/))) {
            if (suggestions[k] && suggestions[k][v]) {
                var t = 1;  // max dist allowed
                if ((value.length < 4) || (value.match(/[\u3400-\u9FAF]/) && value.length < 2)) {
                    t = 0;
                }
                value = value.toLowerCase();
                _.forEach (suggestions[k][v], function (sugg) {
                    var dist;
                    dist = _.min(
                        _.map(sugg.split, function(c) {
                            return ({
                                dist: iD.util.suggestEditDistance(value, c.str, t),
                                pos: c.pos
                            });
                        }), 'dist');
                    if (dist.dist < 9999) {
                        result.push({
                            title: sugg.string,
                            value: sugg.string,
                            dist: dist,
                            count: sugg.count
                        });
                    }
                });
            }
            result.sort(function(a, b) {
                var diff = a.dist.dist - b.dist.dist;
                if (diff === 0) {
                    diff = a.dist.pos - b.dist.pos;
                } else return diff;
                if (diff === 0) {
                    diff = b.count - a.count;
                }
                return diff;
            });
            result = result.slice(0,3);
        }
        callback(result);
    };
};
