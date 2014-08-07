(function (lib, img, cjs) {

var p; // shortcut to reference prototypes

// library properties:
lib.properties = {
	width: 550,
	height: 400,
	fps: 24,
	color: "#FFFFFF",
	manifest: [
        { id: 'hoge', type: 'image', src: 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=' },
        { id: 'fuga', type: 'image', src: 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=' }
    ]
};

(lib.sample_mc = function() {
	this.initialize();
}).prototype = p = new cjs.MovieClip();
p.nominalBounds = null;

// stage content:
(lib.sample_cjs = function() {
	this.initialize();

    this.api = {
        hoge: function() {}
    };
    this.another_api = {
        hoge: function() {}
    };

    this.sample_mc = new lib.sample_mc();

    this.timeline.addTween(cjs.Tween.get(this.sample_mc).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = null;

})(lib = lib||{}, images = images||{}, createjs = createjs||{});
var lib, images, createjs;
