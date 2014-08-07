/*! fl-cjs-player // @version 0.1.0, @license MIT, @Author dameleon <dameleon@gmail.com> */
!function(t,e){"use strict";function i(t,e,r){if(!(this instanceof i))return new i(t,e,r);var s;this.state=b.INITIALIZE,this.setting=s=E(A,r),this.rootMcName=e,this.mc={},this._ns=w(s.namespaces),this.properties=v(this._ns.lib.properties,s.properties),this.canvas=y(t),"boolean"==typeof s.hd?(this.isHdMode=s.hd,this.isSdMode=!!s.hd):(this.isHdMode=S.isHighSpec,this.isSdMode=!S.isHighSpec),s.autostart&&this.load()}function r(t){if(this.state===b.INITIALIZE){var e=this,r=this.setting,s=this.properties,n=this._ns.lib[this.rootMcName],a=new i.Q(function(){var i=r.onload;e.stage=new e._ns.createjs.Stage(e.canvas),e.rootMc=e.mc["/"]=new n,e.state=b.LOADED,r.autostart&&e.play(),i&&i(),t&&t()});if(!n)throw new Error('Missing object error. Movieclip "'+e.rootMcName+'" does not exist in namespace "'+r.namespaces.lib+'".');this.state=b.LOADING,this.loadManifests(s.manifest,a.ing()),this.initViewer(a.ing())}}function s(t){var e,i,r,s,n=this.setting,a=this.properties,o=this.canvas;this.isHdMode?(e=a.width,i=a.height,r=e/n.dpr,r=i/n.dpr):(e=r=a.width/n.dpr,i=s=a.height/n.dpr),o.width=e,o.height=i,n.fullscreen?g(o,a.width,a.height,t):(o.style.width=r+"px",o.style.height=s+"px",t())}function n(t,e){var r=this.setting,s=this._ns.images;if(!t||t.length<1)return void e();var n=new i.AssetLoader({basePath:r.assetEndpoint});n.on("manifestsLoaded",function(t){for(var i,r=t.result,n=0;i=r[n];n++)s[i.id]=i;e()}),n.loadWithManifests(t)}function a(){if(this.state===b.LOADED){var t=this.setting,e=this.properties,i=this.stage,r=this.rootMc,s=this._ns.createjs.Ticker;this.isHdMode||(i.scaleX=i.scaleY=1/t.dpr),i.addChild(r),i.update(),s.setFPS(e.fps),s.addEventListener("tick",i),this.state=b.PLAYING}}function o(){this.state=b.STOPED,this.stage&&(this._ns.createjs.Ticker.removeEventListener("tick",this.stage),this.stage.clear())}function h(){this.state===b.PLAYING&&(this.state=b.PAUSED,this._ns.createjs.Ticker.removeEventListener("tick",this.stage))}function l(){this.state===b.PAUSED&&(this.state=b.PLAYING,this._ns.createjs.Ticker.addEventListener("tick",this.stage))}function u(t,i){var r=this.state;if(r===b.INITIALIZE||r===b.PAUSED)return null;if(t===e)throw new Error("Missing argument error. First argument is required");if("string"!=typeof t)throw new TypeError("Argument type error. First argument must be String");if(this.mc[t])return this.mc[t];var s="/",n=t.split(s),a=this.mc[s];t[0]===s?n.shift():t=s+t;for(var o,h=0;o=n[h];h++)if(a=a[o],!a)return console.warn("Undefined movieclip. [Path, Target movieclip, Target path]: ",t,a,o),null;return i&&(this.mc[t]=a),a}function c(t,e){e=e||"/";var i,r=this.getMovieClip(e);if(!r)throw new Error('Undefined MovieClip [name, path]: "'+t+'", "'+e+'"');return t=t||this.setting.apiKeyName,i=r[t],i?i:(console.warn("Undefined api [Target movieclip, Api key name]",r,t),null)}function d(t,e,i){var r,s=this.properties.manifest,n=/string|number/;if(!t||!e)throw new Error("Missing arguments error. First and second argument is required");if(!n.test(typeof t)||!n.test(typeof e))throw new Error("Argument type error, arguments must be String or Number");for(var a,o=0;a=s[o];o++)if(t===a.id){r=a;break}r||(r={id:t},s.push(r)),r.src=e,i&&(r.type=i)}function f(){this.properties.manifest||(this.properties.manifest=[]);for(var t,e=[].slice.call(arguments),i=this.properties.manifest,r=0;t=e[r];r++)i[i.length]=t}function p(){this.stop(),this.state=b.DESTROYED;var t,e,i,r=this._ns.images,s=this.properties.manifest,n=Object.keys(this);for(t=0;e=s[t];t++)r[e.id]=null,delete r[e.id];for(t=0;i=n[t];t++)"state"!==i&&(this[i]=null,delete this[i])}function g(e,i,r,s){function n(){var i=t.document.body,r=i.style,s=t.screen,n=h.max(s.availHeight,s.availWidth),c=r.height;i.addEventListener("touchstart",a),r.height=n+"px",t.scrollTo(0,1),setTimeout(function(){var s,n=e.style,h=t.innerWidth,d=t.innerHeight,f=d>h,p=h*l;i.removeEventListener("touchstart",a),r.height=c,s=f&&d>o&&d>p?p:d,n.width=s/l+"px",n.height=s+"px",u&&u()},200)}function a(t){return t.preventDefault(),t.stopPropagation(),!1}var o=372,h=t.Math,l=r/i,u=function(){u=null,s&&s()};t.addEventListener("orientationchange",function(){setTimeout(n,150)}),n()}function m(e){var i,r={};if(e=e.toLowerCase(),r.isAndroid=/android/.test(e),r.isIos=/ip(hone|od|ad)/.test(e),r.isChrome=/(chrome|crios)/.test(e),r.isAndroidBrowser=!r.chrome&&r.android&&/applewebkit/.test(e),r.isMobileSafari=!r.chrome&&r.ios&&/applewebkit/.test(e),r.versionString=r.androidBrowser||r.android&&r.chrome?e.match(/android\s(\S.*?)\;/):r.mobileSafari||r.ios&&r.chrome?e.match(/os\s(\S.*?)\s/):null,r.versionString=r.versionString?r.ios?r.versionString[1].replace("_","."):r.versionString[1]:null,r.version=i=r.versionString?r.versionString.split("."):null,r.isHighSpec=!1,i){for(var s=0,n=i.length;n>s;s++)i[s]=0|i[s];var a=i[0],o=i[1];if(r.android&&4===a&&o>2)r.isHighSpec=!0;else if(r.ios){var h=t.screen;Math.max(h.width,h.height)>416&&(r.isHighSpec=!0)}}return r}function v(t,i){var r={},s=Object.keys(t);i=i||{};for(var n,a=0;n=s[a];a++)r[n]=i[n]!==e?i[n]:t[n];return r}function y(e){var i;if(!e)throw new Error("Missing argument error. First argument is required");if("string"==typeof e){if(i=t.document.querySelector(e),!i)throw new Error('Element with the QuerySelector "'+e+'" does not exist')}else{if(!e.tagName||"canvas"!==e.tagName.toLowerCase())throw new TypeError("Argument type error. First Argument must be String or HTMLCanvasElement. "+Object.prototype.toString.call(e)+" given.");i=e}return i}function w(i){for(var r,s=Object.keys(i),n={},a=0;r=s[a];a++){if(t[i[r]]===e)throw new Error('Namespace "'+i[r]+'" does not exist in global object');n[r]=t[i[r]]}return n}function E(t,e){return i.extend({},t,e)}function L(){function t(t,e,r){var s=r[t],n=e[t],a=s&&typeof s||"",o=n&&typeof n||"";i.test(a)?(o!==a&&(e[t]="object"===a?{}:[]),L(e[t],s)):e[t]=s}if(arguments.length<2)return arguments[0];for(var e,i=/(object|array)/,r=[].slice.call(arguments),s=r.shift(),n=0;e=r[n];){var a=0;switch(typeof e){case"array":for(var o=e.length;o>a;a++)t(a,s,e);break;case"object":for(var h,l=Object.keys(e);h=l[a];a++)t(h,s,e)}n++}return s}var b={INITIALIZE:"initialize",LOADING:"loading",LOADED:"loaded",PLAYING:"playing",STOPED:"stoped",PAUSED:"paused",DESTROYED:"destroyed"},A={apiKeyName:"api",assetEndpoint:"",autostart:!1,dpr:1,fullscreen:!1,hd:null,maxConnections:5,namespaces:{lib:"lib",images:"images",createjs:"createjs"},onload:null,properties:null},S=m(t.navigator.userAgent);i.STATES=b,i.env=S,i.extend=L,i.prototype={constructor:i,addManifestData:f,destroy:p,getApi:c,getMovieClip:u,initViewer:s,load:r,loadManifests:n,pause:h,play:a,resume:l,setManifestData:d,stop:o},t.FlCjsPlayer=i}(this.self||global,void 0),function(t){"use strict";function e(t){this.setting=FlCjsPlayer.extend({},p,t),this.listeners={},this.queue={},this.tmpFiles={}}function i(t){var e=t.target;switch(e.removeEventListener("load",this),e.removeEventListener("error",this),t.type){case"load":var i=e.__qid;this._fire("fileLoaded",e),this._pushToTemporaryFileList(i,e),this._tickQueue(i);break;case"error":this._fire("error",e)}}function r(t){if(!Array.isArray(t))throw new Error("Argument type error. First argument must be Array");if(t.length<1)return console.warn("Passed through empty manifests"),void this._fire("manifestLoaded");var e,i=this,r=new FlCjsPlayer.Q(function(){i.handleManifestLoaded(e)});e=r.id,this.queue[e]=r;for(var s,n=0;s=t[n];n++)r.add(),this._loadItem(e,s)}function s(t,e){var i=new Image,r=(this.setting.basePath||"")+e.src;i.addEventListener("load",this),i.addEventListener("error",this),i.id=e.id,i.__qid=t,i.src=r}function n(t){var e=this.tmpFiles[t];this.tmpFiles[t]=null,delete this.tmpFiles[t],this.queue[t]=null,delete this.queue[t],this._fire("manifestsLoaded",e)}function a(t,e){var i=this._getListenerListByType(t);i.push(e)}function o(t,e){var i=this._getListenerListByType(t),r=i.indexOf(e);i.length<1||0>r||i.splice(r,1)}function h(){var t=[].slice.call(arguments),e=t.shift(),i=this._getListenerListByType(e);if(!(i.length<1)){var r=d(e);r.result=t.length>1?t:t[0];for(var s,n=0;s=i[n];n++)s.call(null,r)}}function l(t){return Array.isArray(this.listeners[t])?this.listeners[t]:this.listeners[t]=[]}function u(t,e){var i=Array.isArray(this.tmpFiles[t])?this.tmpFiles[t]:this.tmpFiles[t]=[];i[i.length]=e}function c(t){this.queue[t].tick()}function d(t){var e=f.createEvent("Event");return e.initEvent(t,!0,!0),e}var f=t.document;if(!t.FlCjsPlayer)throw new Error('"FlCjsPlayer" does not exist in global');var p={basePath:""};e.prototype={constructor:e,handleEvent:i,handleManifestLoaded:n,loadWithManifests:r,off:o,on:a,_fire:h,_getListenerListByType:l,_loadItem:s,_pushToTemporaryFileList:u,_tickQueue:c},t.FlCjsPlayer.AssetLoader=e}(this.self||global,void 0),function(t){"use strict";function e(t){this.id=o++,this.length=0,this.listeners=[],t&&this.addHandler(t)}function i(t){if("function"!=typeof t)throw new Error("Argument type error. First argument must be Function");this.listeners.push(t)}function r(t){var e=this;return this.length++,function(){var i=arguments;e.length--,t&&t.apply(null,i),e.length<1&&e.fire.apply(e,i)}}function s(){for(var t,e=arguments,i=this.listeners;t=i.shift();)t.apply(null,e)}function n(){this.length--,this.length<1&&this.fire.apply(this,arguments)}function a(){this.length++}if(!t.FlCjsPlayer)throw new Error('"FlCjsPlayer" does not exist in global');var o=0;e.prototype={constructor:e,add:a,addHandler:i,fire:s,ing:r,tick:n},t.FlCjsPlayer.Q=e}(this.self||global,void 0);
//# sourceMappingURL=fl-cjs-player.all.js.map