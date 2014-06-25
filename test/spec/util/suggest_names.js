describe("iD.util.SuggestNames", function() {
    var suggestions = {
        'key': {
            'value': [
                {string: 'abcdef', split: [{str:'abcdef', pos:0}], count: 10},
                {string: 'ghijkl', split: [{str:'ghijkl', pos:0}], count: 10},
                {string: '一二三', split: [{str:'一二三', pos:0}], count: 10},
                {string: 'mno pqrs', split: [{str:'mno pqrs', pos:0}, {str:'pqrs', pos:4}], count: 10}
            ]
        }
    };

    var preset = {
        'id': 'key/value'
    };

    var a = iD.util.SuggestNames(preset, suggestions);

    it('provides suggestions for an entered value', function(done) {
        a('abcd', function(result) {
            expect(result).to.eql([
                {
                    title: 'abcdef',
                    value: 'abcdef',
                    dist: {dist: 0, pos: 0},
                    count: 10
                }
            ]);
            done();
        });
    });

    it('provides no suggestions for short values', function(done){
        a('ab', function(result) {
            expect(result).to.eql([]);
            done();
        });
    });
    
    it('except when CJK ideographs are present', function(done){
        a('一', function(result) {
            expect(result).to.eql([
                {
                    title: '一二三',
                    value: '一二三',
                    dist: {dist: 0, pos: 0},
                    count: 10
                }
            ]);
            done();
        });
    });
    
    it('returns matches of words in middle of string', function(done){
        a('pqr', function(result) {
            expect(result).to.eql([
                {
                    title: 'mno pqrs',
                    value: 'mno pqrs',
                    dist: {dist: 0, pos: 4},
                    count: 10
                }
            ]);
            done();
        });
    });
});
