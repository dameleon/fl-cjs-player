'use strict';

var bind = require('./lib/Function.bind.js');
var assert = require('power-assert');

describe('CreateJS Player Q', function() {
    it('should exist constructor in global', function() {
        var FlCjsPlayer = global.FlCjsPlayer;

        assert(typeof FlCjsPlayer.Q === 'function');
    });
    it('should call handlers with queueing', function(done) {
        var q = new FlCjsPlayer.Q(function() {
            assert.ok(true);
            done();
        });

        setTimeout(q.ing());
        setTimeout(q.ing());
        setTimeout(q.ing());
    });
    it('should call handlers with add and tick', function(done) {
        var q = new FlCjsPlayer.Q(function() {
            assert.ok(true);
            done();
        });

        q.add();
        q.add();
        setTimeout(function() {
            q.tick();
        });
        setTimeout(function() {
            q.tick();
        });
    });
    it('should throw error when passed wrong type handler', function() {
        var q = new FlCjsPlayer.Q();

        assert.throws(function() {
            q.addHandler(null);
        }, /Argument type error/);
    })
});
