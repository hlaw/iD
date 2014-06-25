iD.util = {};

iD.util.tagText = function(entity) {
    return d3.entries(entity.tags).map(function(e) {
        return e.key + '=' + e.value;
    }).join(', ');
};

iD.util.entitySelector = function(ids) {
    return ids.length ? '.' + ids.join(',.') : 'nothing';
};

iD.util.entityOrMemberSelector = function(ids, graph) {
    var s = iD.util.entitySelector(ids);

    ids.forEach(function(id) {
        var entity = graph.hasEntity(id);
        if (entity && entity.type === 'relation') {
            entity.members.forEach(function(member) {
                s += ',.' + member.id;
            });
        }
    });

    return s;
};

iD.util.displayName = function(entity) {
    var localeName = 'name:' + iD.detect().locale.toLowerCase().split('-')[0];
    return entity.tags[localeName] || entity.tags.name || entity.tags.ref;
};

iD.util.stringQs = function(str) {
    return str.split('&').reduce(function(obj, pair){
        var parts = pair.split('=');
        if (parts.length === 2) {
            obj[parts[0]] = (null === parts[1]) ? '' : decodeURIComponent(parts[1]);
        }
        return obj;
    }, {});
};

iD.util.qsString = function(obj, noencode) {
    function softEncode(s) { return s.replace('&', '%26'); }
    return Object.keys(obj).sort().map(function(key) {
        return encodeURIComponent(key) + '=' + (
            noencode ? softEncode(obj[key]) : encodeURIComponent(obj[key]));
    }).join('&');
};

iD.util.prefixDOMProperty = function(property) {
    var prefixes = ['webkit', 'ms', 'moz', 'o'],
        i = -1,
        n = prefixes.length,
        s = document.body;

    if (property in s)
        return property;

    property = property.substr(0, 1).toUpperCase() + property.substr(1);

    while (++i < n)
        if (prefixes[i] + property in s)
            return prefixes[i] + property;

    return false;
};

iD.util.prefixCSSProperty = function(property) {
    var prefixes = ['webkit', 'ms', 'Moz', 'O'],
        i = -1,
        n = prefixes.length,
        s = document.body.style;

    if (property.toLowerCase() in s)
        return property.toLowerCase();

    while (++i < n)
        if (prefixes[i] + property in s)
            return '-' + prefixes[i].toLowerCase() + property.replace(/([A-Z])/g, '-$1').toLowerCase();

    return false;
};


iD.util.setTransform = function(el, x, y, scale) {
    var prop = iD.util.transformProperty = iD.util.transformProperty || iD.util.prefixCSSProperty('Transform'),
        translate = iD.detect().opera ?
            'translate('   + x + 'px,' + y + 'px)' :
            'translate3d(' + x + 'px,' + y + 'px,0)';
    return el.style(prop, translate + (scale ? ' scale(' + scale + ')' : ''));
};

iD.util.getStyle = function(selector) {
    for (var i = 0; i < document.styleSheets.length; i++) {
        var rules = document.styleSheets[i].rules || document.styleSheets[i].cssRules || [];
        for (var k = 0; k < rules.length; k++) {
            var selectorText = rules[k].selectorText && rules[k].selectorText.split(', ');
            if (_.contains(selectorText, selector)) {
                return rules[k];
            }
        }
    }
};

iD.util.editDistance = function(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    var matrix = [];
    for (var i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (var j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i-1) === a.charAt(j-1)) {
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                    Math.min(matrix[i][j-1] + 1, // insertion
                    matrix[i-1][j] + 1)); // deletion
            }
        }
    }
    return matrix[b.length][a.length];
};

iD.util.re = /[\u00BF-\u1FFF\u2C00-\u2FFF\u3040-\u30FA\u30FC-\uD7FF\w']+/g;
            
iD.util.uniSplit = function(s) {
    var res = [],
        m;
    while (null !== (m = iD.util.re.exec(s))) {
        res.push({str:s.substring(m.index).toLowerCase(), pos:m.index});
    }
    return res;
};

// Modified version of edit distance for comparison on suggestion
// (1) Uses Damerau–Levenshtein as basis, allows transposition
// (2) No initial insertion / deletion 
// (3) Only counts up to end of a (user input value) 
//     if s = true, limit count to either end of a or b (symmetrical)
//     (further ins / del has no cost)
// (4) Only allows edit distance <=t, return 9999 if exceeded 
// (for efficient actual evaluation)

iD.util.suggestEditDistance = function(a, b, t, s) {
    var blen = b.length;
    var alen = a.length;
    if (alen === 0) return 0;
    var symm = false;
    if (typeof s !== 'undefined' && s === true) {
        symm = true;
    }
    if (blen === 0) return symm? 0 : ((alen>t) ? 9999 : alen);
    var matrix = [];
    matrix[0]=[0];
    // No initial insertion and deletion
    for (var i = 1; i <= b.length; i++) { matrix[i] = []; }
    var prevj = 0;  // mark last assigned position of previous row
    var prevfirstj = 0;
    var firstj = 1;  // limit test to diagonal region only
    var nextfirstj = 1;

    for (i = 1; i <= blen; i++) {
        var ins = 1;  // insertion cost
        if (symm && (i === blen)) ins = 0;  // not to count distance after end of b
        var del = 1;  // deletion cost
        var min = 9999;
        for (var j = firstj; j <= alen; j++) {
            var sub = 1;
            if (j === alen) del = 0;
            if (b.charAt(i-1) === a.charAt(j-1)) sub = 0;
            matrix[i][j] = Math.min((((j-1) > prevj) || ((j-1) < prevfirstj))? 9999 : matrix[i-1][j-1] + sub, // match or substitution
                Math.min((j === firstj)? 9999 : matrix[i][j-1] + ins, // insertion
                (j > prevj)? 9999 : matrix[i-1][j] + del)); // deletion
            if ((i > 1) && (j > 1) && (b.charAt(i-1) === a.charAt(j-2)) && (b.charAt(i-2) === a.charAt(j-1))) {
                matrix[i][j] = Math.min(matrix[i][j],
                    (typeof matrix[i-2][j-2] === 'undefined')? 9999 : matrix[i-2][j-2] + 1);  // transposition
            }
            min = Math.min(matrix[i][j], min);  // best of this row
            if ((j === nextfirstj && (j !== alen)) && (matrix[i][j] > t)) {
                nextfirstj++;
            }
            if ((j > prevj) && (matrix[i][j] >= t)) {
                if (i !== blen) {
                    // no need to further loop on j, as it can only be increasing unless i===blen
                    prevj = j;
                    break;
                }
                // bottom row, if not symm and matrix[i][j] already >=t 
                // before reaching end of row, fail
                if ((!symm) && (j<alen)) {
                    return 9999;
                }
            }
            if (j === alen) prevj = j;
        }
        if (min > t) return 9999;
        prevfirstj = firstj;
        if (nextfirstj === alen) {
            // continuing would just carry the value downwards
            return matrix[i][alen];
        }
        if (firstj !== nextfirstj) firstj = nextfirstj+1;
    }
    return matrix[blen][alen];
};

// a d3.mouse-alike which
// 1. Only works on HTML elements, not SVG
// 2. Does not cause style recalculation
iD.util.fastMouse = function(container) {
    var rect = _.clone(container.getBoundingClientRect()),
        rectLeft = rect.left,
        rectTop = rect.top,
        clientLeft = +container.clientLeft,
        clientTop = +container.clientTop;
    return function(e) {
        return [
            e.clientX - rectLeft - clientLeft,
            e.clientY - rectTop - clientTop];
    };
};

/* jshint -W103 */
iD.util.getPrototypeOf = Object.getPrototypeOf || function(obj) { return obj.__proto__; };

iD.util.asyncMap = function(inputs, func, callback) {
    var remaining = inputs.length,
        results = [],
        errors = [];

    inputs.forEach(function(d, i) {
        func(d, function done(err, data) {
            errors[i] = err;
            results[i] = data;
            remaining --;
            if (!remaining) callback(errors, results);
        });
    });
};

// wraps an index to an interval [0..length-1]
iD.util.wrap = function(index, length) {
    if (index < 0)
        index += Math.ceil(-index/length)*length;
    return index % length;
};
