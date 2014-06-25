iD.presets.Collection = function(collection) {

    var maxSearchResults = 50,
        maxSuggestionResults = 10;

    var presets = {

        collection: collection,

        item: function(id) {
            return _.find(collection, function(d) {
                return d.id === id;
            });
        },

        matchGeometry: function(geometry) {
            return iD.presets.Collection(collection.filter(function(d) {
                return d.matchGeometry(geometry);
            }));
        },

        search: function(value, geometry) {
            if (!value) return this;

            value = value.toLowerCase().trim();
            
            var shortv = (value.length < 4);
            if (value.match(/[\u3400-\u9FAF]/)) shortv = (value.length < 2);
            
            var searchable = _.filter(collection, function(a) {
                return (((typeof a.searchable === 'undefined') || a.searchable !== false) && ((typeof a.suggestion === 'undefined') || !a.suggestion));
            }),
            suggestions = _.filter(collection, function(a) {
                return ((typeof a.suggestion !== 'undefined') && a.suggestion === true);
            });

            // Function to determine search matching and ranking behavior
            // return a distance metric, or 9999 if edit distance higher than threshold
            function calcDist(a) {
                // allow no error for short strings, 1 for others
                return iD.util.suggestEditDistance(value, a, shortv ? 0 : 1);
            }

            function minmap(preset, names) {
                return {
                    preset: preset,
                    dist: _.min(names.map(function(b) {
                        return _.min(
                            iD.util.uniSplit(b).map(function(c) {
                                return ({
                                    dist: calcDist(c.str),
                                    pos: c.pos
                                });
                            }), 'dist');
                        }), 'dist')
                };
            }
            
            // finds close matches to value in preset.name
            var levenstein_name = searchable.map(function(a) {
                var ret = minmap(a, [a.name()]);
                ret.matchname = true;
                return ret;
            }).filter(function(a) {
                return a.dist.dist < 9999;
            });
                           
            // finds close matches to value in preset.terms
            var leventstein_terms = searchable.map(function(a) {
                if (!a.terms()) return null;
                return minmap(a, a.terms());
            }).filter(function(a) {
                return (a !== null) && (a.dist.dist < 9999);
            });
               
            function suggestionName(name) {
                var nameArray = name.split(' - ');
                if (nameArray.length > 1) {
                    name = nameArray.slice(0, nameArray.length-1).join(' - ');
                }
                return name;
            }

            var leven_suggestions = suggestions.map(function(a) {
                var names = [suggestionName(a.name())].concat(a.canon());
                return minmap(a, names);
            }).filter(function(a) {
                return a.dist.dist < 9999;
            });
                 
            function laven_sort (a, b) {
                var diff = a.dist.dist - b.dist.dist;
                if (diff === 0) {
                    diff = a.dist.pos - b.dist.pos;
                } else return diff;
                if (diff === 0) {
                    // name matches first
                    if ((typeof a.matchname === 'undefined') && (typeof b.matchname !== 'undefined')) {
                        diff = 1;
                    } else if ((typeof b.matchname === 'undefined') && (typeof a.matchname !== 'undefined')) {
                        diff = -1;
                    }
                } else return diff;
                if (diff === 0) {
                    // the higher count first
                    diff = b.preset.count() - a.preset.count();
                } else return diff;
                if (diff === 0) {
                    diff = a.preset.name().length - b.preset.name().length;
                }
                return diff;
            }
                
            var results_sugg = leven_suggestions
                .sort(laven_sort)
                .slice(0, maxSuggestionResults);
            
            var results = levenstein_name.concat(leventstein_terms, results_sugg)
                .sort(laven_sort)
                .map(function(a) {
                    return a.preset;
                })
                .slice(0, maxSearchResults-1);

            var other = presets.item(geometry);

            return iD.presets.Collection(_.unique(
                    results.concat(other)
                ));
        },
        
        clearLocal: function () {
            var removedPresets = _.remove(collection, function(a) {
                return (typeof a.local !== 'undefined') && (a.local === true);
            });
            return removedPresets;
        }
        
    };

    return presets;
};
