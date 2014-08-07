'use strict';

var bind = require('./lib/Function.bind.js');
var assert = require('power-assert');

describe('CreateJS Player AssetLoader', function() {
    it('should exist constructor in global', function() {
        var FLCjsPlayer = global.FLCjsPlayer;

        assert(typeof FLCjsPlayer.AssetLoader === 'function');
    });
    it('should load image with manifests', function(done) {
        // from fixture
        var manifests = lib.properties.manifest;
        var loader = new FLCjsPlayer.AssetLoader();

        loader.on('fileLoaded', function(ev) {
            var result = ev.result;

            manifests.forEach(function(manifest) {
                if (manifest.id === result.id) {
                    assert.equal(manifest.src, result.src);
                }
            });
        });
        loader.on('manifestsLoaded', function(ev) {
            var result = ev.result;
            var count = 0;

            result.forEach(function(res) {
                manifests.forEach(function(manifest) {
                    if (res.id === manifest.id) {
                        assert.equal(res.src, manifest.src)
                        count++;
                    }
                });
            });
            assert.equal(manifests.length, count);
            done();
        });
        loader.loadWithManifests(manifests);
    });
    it('should trigger error event when source not found', function(done) {
        var loader = new FLCjsPlayer.AssetLoader();

        loader.on('error', function(ev) {
            var result = ev.result;

            assert.equal(result.id, 'hoge');
            done();
        });
        loader.loadWithManifests([
            { id: 'hoge', type: 'fuga', src:'http://notfound.com/piyo.png' }
        ]);
    });
    it('should throw error when broken manifests', function() {
        var loader = new FLCjsPlayer.AssetLoader();

        assert.throws(function() {
            loader.loadWithManifests();
        }, /Argument type error/);
        assert.doesNotThrow(function() {
            loader.loadWithManifests([]);
        });
    });
});
