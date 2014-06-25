describe('iD.Util', function() {
    it('#tagText', function() {
        expect(iD.util.tagText({})).to.eql('');
        expect(iD.util.tagText({tags:{foo:'bar'}})).to.eql('foo=bar');
        expect(iD.util.tagText({tags:{foo:'bar',two:'three'}})).to.eql('foo=bar, two=three');
    });

    it('#stringQs', function() {
        expect(iD.util.stringQs('foo=bar')).to.eql({foo: 'bar'});
        expect(iD.util.stringQs('foo=bar&one=2')).to.eql({foo: 'bar', one: '2' });
        expect(iD.util.stringQs('')).to.eql({});
    });

    it('#qsString', function() {
        expect(iD.util.qsString({ foo: 'bar' })).to.eql('foo=bar');
        expect(iD.util.qsString({ foo: 'bar', one: 2 })).to.eql('foo=bar&one=2');
        expect(iD.util.qsString({})).to.eql('');
    });

    it('#getPrototypeOf', function() {
        var a = function() {};
        a.prototype = { foo: 'foo' };
        expect(iD.util.getPrototypeOf({})).to.eql({});
        expect(iD.util.getPrototypeOf(new a())).to.eql({ foo: 'foo' });
    });

    it('#uniSplit', function() {
        expect(iD.util.uniSplit('mno pqrs')).to.eql([{str:'mno pqrs', pos:0}, {str:'pqrs', pos:4}]);
        expect(iD.util.uniSplit('mno-!-pqrs')).to.eql([{str:'mno-!-pqrs', pos:0}, {str:'pqrs', pos:6}]);
        expect(iD.util.uniSplit('一二（三四）')).to.eql([{str:'一二（三四）', pos:0}, {str:'三四）', pos:3}]);
    });

    describe('#editDistance', function() {
        it('returns zero for same strings', function() {
            expect(iD.util.editDistance('foo', 'foo')).to.eql(0);
        });

        it('reports an insertion of 1', function() {
            expect(iD.util.editDistance('foo', 'fooa')).to.eql(1);
        });

        it('reports a replacement of 1', function() {
            expect(iD.util.editDistance('foob', 'fooa')).to.eql(1);
        });

        it('does not fail on empty input', function() {
            expect(iD.util.editDistance('', '')).to.eql(0);
        });
    });

    describe('#suggestEditDistance', function() {
        it('returns zero for same strings', function() {
            expect(iD.util.suggestEditDistance('foo', 'foo', 1)).to.eql(0);
        });

        it('reports an insertion of 1', function() {
            expect(iD.util.suggestEditDistance('foo', 'faoo', 1)).to.eql(1);
        });

        it('reports a replacement of 1', function() {
            expect(iD.util.suggestEditDistance('foob', 'fooa', 1)).to.eql(1);
        });

        it('counts only up to matching end of first string', function() {
            expect(iD.util.suggestEditDistance('f1oo', 'fooa', 1)).to.eql(1);
        });

        it('reports fail if tolerance exceeded', function() {
            expect(iD.util.suggestEditDistance('f1oo', 'fooa', 0)).to.eql(9999);
        });

        it('does not fail on empty input', function() {
            expect(iD.util.suggestEditDistance('', '', 1)).to.eql(0);
        });
    });

    describe('#asyncMap', function() {
        it('handles correct replies', function() {
            iD.util.asyncMap([1, 2, 3],
                function(d, c) { c(null, d * 2); },
                function(err, res) {
                    expect(err).to.eql([null, null, null]);
                    expect(res).to.eql([2, 4, 6]);
                });
        });
        it('handles errors', function() {
            iD.util.asyncMap([1, 2, 3],
                function(d, c) { c('whoops ' + d, null); },
                function(err, res) {
                    expect(err).to.eql(['whoops 1', 'whoops 2', 'whoops 3']);
                    expect(res).to.eql([null, null, null]);
                });
        });
    });
});
