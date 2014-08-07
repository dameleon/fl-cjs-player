'use strict';

var TEST_CJS_LIB_NAME = 'sample_cjs';
var bind = require('./lib/Function.bind.js');
var assert = require('power-assert');

describe('FL-CJS Player', function() {
    before(function() {
        var canvas = document.createElement('canvas');

        canvas.id = 'canvas';
        document.body.appendChild(canvas);
    });

    it('should exist constructors and static methods in global', function() {
        var FlCjsPlayer = global.FlCjsPlayer;

        assert(typeof FlCjsPlayer === 'function');
    });

    it('should have any static properties', function() {
        assert(typeof FlCjsPlayer.STATES === 'object');
        assert(typeof FlCjsPlayer.env === 'object');
    });

    describe('instantiation', function() {
        before(function() {
            this.canvas = document.getElementById('canvas');
        });
        it('should initialize with 2 arguments', function() {
            var player = new FlCjsPlayer(this.canvas, TEST_CJS_LIB_NAME);

            assert(player.state === FlCjsPlayer.STATES.INITIALIZE);
        });
        it('should initialize with 3 arguments', function() {
            var option = {
                hd: true,
                properties: {
                    width: 100,
                    height: 100
                }
            };
            var player = new FlCjsPlayer(this.canvas, TEST_CJS_LIB_NAME, option);

            assert(player.state === FlCjsPlayer.STATES.INITIALIZE);
            assert(player.setting.hd === option.hd);
            assert(player.properties.width === option.properties.width);
            assert(player.properties.height === option.properties.height);
        });
        it('should initialize, when passed argument 1 type of string', function() {
            var player = new FlCjsPlayer('#canvas', TEST_CJS_LIB_NAME);

            assert(player.state === FlCjsPlayer.STATES.INITIALIZE);
        });
        it('should initialize with load assets', function(done) {
            var player = new FlCjsPlayer('#canvas', TEST_CJS_LIB_NAME);

            player.load(function() {
                assert(player.state = FlCjsPlayer.STATES.LOADED);

                var manifests = player.properties.manifest;
                var imagesNamespace = player._ns.images;

                manifests.forEach(function(manifest) {
                    assert(imagesNamespace[manifest.id].tagName.toLowerCase() === 'img');
                });
                done();
            });
        });
    });

    describe('instance state', function() {
        var STATES = FlCjsPlayer.STATES;

        beforeEach(function() {
            this.player = new FlCjsPlayer('#canvas', TEST_CJS_LIB_NAME);
        });

        it('should be initialize', function() {
            assert.equal(this.player.state, STATES.INITIALIZE);
        });
        it('should be loaded', function(done) {
            this.player.load(function() {
                assert.equal(this.player.state, STATES.LOADED);
                done();
            }.bind(this));
        });
        it('should be playing', function(done) {
            this.player.load(function() {
                this.player.play();
                assert.equal(this.player.state, STATES.PLAYING);
                done();
            }.bind(this));
        });
        it('should be stoped', function(done) {
            this.player.load(function() {
                this.player.play();
                this.player.stop();
                assert.equal(this.player.state, STATES.STOPED);
                done();
            }.bind(this));
        });
        it('shoud be paused', function(done) {
            this.player.load(function() {
                this.player.play();
                this.player.pause();
                assert.equal(this.player.state, STATES.PAUSED);
                done();
            }.bind(this));
        });
        it('should be not paused', function(done) {
            this.player.load(function() {
                this.player.play();
                this.player.stop();
                this.player.pause();
                assert.notEqual(this.player.state, STATES.PAUSED);
                done();
            }.bind(this));
        })
        it('shoud be playing by resume method', function(done) {
            this.player.load(function() {
                this.player.play();
                this.player.pause();
                this.player.resume();
                assert.equal(this.player.state, STATES.PLAYING);
                done();
            }.bind(this));
        });
        it('should be not playing by resume method', function(done) {
            this.player.load(function() {
                this.player.play();
                this.player.stop();
                this.player.resume();
                assert.notEqual(this.player.state, STATES.PLAYING);
                done();
            }.bind(this));
        });
        it('should be destroyed and deleted all properties other than "state" property', function(done) {
            this.player.load(function() {
                this.player.play();

                var instancePropertiesList = Object.keys(this.player);

                this.player.destroy();

                instancePropertiesList.forEach(function(key) {
                    // state だけは残ってる
                    if (key === 'state') {
                        assert.equal(this.player[key], STATES.DESTROYED);
                    } else {
                        assert.equal(this.player[key], undefined);
                    }
                }, this);
                done();
            }.bind(this));
        });
    });

    describe('options', function() {
        before(function() {
            this.canvas = document.getElementById('canvas');
        });

        it('should set HD mode', function() {
            var player = new FlCjsPlayer(this.canvas, TEST_CJS_LIB_NAME, {
                hd: true
            });

            assert.equal(player.isHdMode, true);
        });

        it('should start automatically', function(done) {
            var player = new FlCjsPlayer(this.canvas, TEST_CJS_LIB_NAME, {
                autostart: true,
                onload: function() {
                    assert.equal(FlCjsPlayer.STATES.PLAYING, player.state);
                    done();
                }
            });
        });

        it('should resize screen size', function(done) {
            var player = new FlCjsPlayer(this.canvas, TEST_CJS_LIB_NAME, {
                fullscreen: true
            });
            var contentWidth = player.properties.width;
            var contentHeight = player.properties.height;
            var scale = contentHeight / contentWidth;

            player.load(function() {
                player.play();
                var innerWidth = global.innerWidth;
                var innerHeight = global.innerHeight;
                var windowScale = innerHeight / innerWidth;
                var canvas = this.canvas;
                var canvasStyle = canvas.style;

                // window 比率の方が大きいので横がピッタリになる
                if (scale < windowScale) {
                    assert.equal(canvasStyle.width, innerWidth + 'px');
                    assert.equal(canvasStyle.height, (innerWidth * scale) + 'px');
                }
                // window 比率の方が小さいので縦がぴったりになる
                else if (scale > windowScale) {
                    assert.equal(canvasStyle.height, innerHeight + 'px');
                    assert.equal(canvasStyle.width, (innerHeight / scale) + 'px');
                }
                // window とコンテンツの比率がピッタリの場合は、そのままのサイズになる
                else {
                    assert.equal(canvasStyle.width, innerWidth + 'px');
                    assert.equal(canvasStyle.height, innerHeight + 'px');
                }
                done();
            });
        })
    });

    describe('instance methods', function() {
        beforeEach(function() {
            this.player = new FlCjsPlayer('#canvas', TEST_CJS_LIB_NAME);
        });
        it('should add new manifest data', function(done) {
            var data = {
                id: 'dameleon',
                type: 'image',
                src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D'
            };

            this.player.addManifestData(data);
            this.player.load(function() {
                var images = this.player._ns.images;

                assert.equal(images[data.id].src, data.src);
                done();
            }.bind(this));
        });
        it('should get api object', function(done) {
            this.player.load(function() {
                this.player.play();
                var api = this.player.getApi();

                assert.equal(typeof api, 'object');
                done();
            }.bind(this));
        });
        it('should get movieclip', function(done) {
            this.player.load(function() {
                this.player.play();

                var rootMc = this.player.getMovieClip('/');
                var mc = this.player.getMovieClip('/sample_mc');

                assert(rootMc.__proto__ instanceof createjs.MovieClip);
                assert(mc.__proto__ instanceof createjs.MovieClip);
                done();
            }.bind(this));
        });
        it('should modified manifest', function(done) {
            var src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D';

            this.player.setManifestData('hoge', src, 'image');
            this.player.load(function() {
                var images = this.player._ns.images;

                assert.equal(images.hoge.src, src);
                done();
            }.bind(this));
        });
    });

    describe('exception', function() {
        it('should throw error when undefined canvas', function() {
            assert.throws(function() {
                new FlCjsPlayer('dameleon', TEST_CJS_LIB_NAME);
            }, /Element with the QuerySelector "dameleon" does not exist/);
            assert.throws(function() {
                new FlCjsPlayer(1, TEST_CJS_LIB_NAME);
            }, /Argument type error/);
            assert.throws(function() {
                new FlCjsPlayer(null, TEST_CJS_LIB_NAME);
            });
        })
        it('should throw error when undefined namespace', function() {
            assert.throws(function() {
                new FlCjsPlayer('#canvas', TEST_CJS_LIB_NAME, {
                    namespaces: {
                        lib: 'dameleon'
                    }
                });
            }, /Namespace "dameleon" does not exist in global object/);
        });
        it('should throw error when call getMovieClip with wrong argument', function(done) {
            var player = new FlCjsPlayer('#canvas', TEST_CJS_LIB_NAME, {
                autostart: true,
                onload: function() {
                    assert.throws(function() {
                        player.getMovieClip();
                    }, /Missing argument error/);
                    assert.throws(function() {
                        player.getMovieClip(1);
                    }, /Argument type error/);
                    done();
                }
            });
        });
        it('should throw error when call getApi with undefined movieclip', function(done) {
            var player = new FlCjsPlayer('#canvas', TEST_CJS_LIB_NAME, {
                autostart: true,
                onload: function() {
                    assert.throws(function() {
                        player.getApi('api', '/hoge/fuga/piyo');
                    }, /Undefined MovieClip/);
                    done();
                }
            });
        });
        it('should throw error when call setManifestData with wrong argument', function(done) {
            var player = new FlCjsPlayer('#canvas', TEST_CJS_LIB_NAME, {
                autostart: true,
                onload: function() {
                    assert.throws(function() {
                        player.setManifestData();
                    }, /Missing arguments/);
                    assert.throws(function() {
                        player.setManifestData([], []);
                    }, /Argument type error/);
                    done();
                }
            });
        });
        it('should throw error when missing root movieclip', function() {
            assert.throws(function() {
                var player = new FlCjsPlayer('#canvas', 'hogefugapiyo', {
                    autostart: true,
                });
            }, /Missing object error/);
        });
    });

});
