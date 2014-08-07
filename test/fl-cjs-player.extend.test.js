'use strict';

var bind = require('./lib/Function.bind.js');
var assert = require('power-assert');

describe('CreateJS Player extend', function() {
    it('should exist constructor in global', function() {
        var FLCjsPlayer = global.FLCjsPlayer;

        assert(typeof FLCjsPlayer.extend === 'function');
    });
    it('should extend with object', function() {
        var hoge = {};
        var fuga = {
                foo: 1,
                bar: {
                    dameleon: null
                }
        };
        var piyo = {
                baz: 2,
                bar: {
                    dameleon: undefined
                }
        };
        var res = FLCjsPlayer.extend(hoge, fuga, piyo);

        assert.equal(res.foo, 1);
        assert.equal(res.bar.dameleon, undefined);
        assert.equal(res.baz, 2);
        assert.equal(fuga.bar.dameleon, null);
    });
    it('should extend with array', function() {
        var hoge = [];
        var fuga = [1,2,3,4];
        var piyo = [5,6,7];
        var res = FLCjsPlayer.extend(hoge, fuga, piyo);

        assert.equal(hoge.length, 4);
        assert.equal(hoge[0], 5);
        assert.equal(hoge[1], 6);
        assert.equal(hoge[2], 7);
        assert.equal(hoge[3], 4);

        assert.equal(fuga.length, 4);
        assert.equal(fuga[0], 1);
        assert.equal(fuga[1], 2);
        assert.equal(fuga[2], 3);
        assert.equal(fuga[3], 4);
    });
});
