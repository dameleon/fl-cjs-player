;(function(global, undefined) {
'use strict';

var STATES = {
    INITIALIZE : 'initialize',
    LOADING    : 'loading',
    LOADED     : 'loaded',
    PLAYING    : 'playing',
    STOPED     : 'stoped',
    PAUSED     : 'paused',
    DESTROYED  : 'destroyed'
};
var defaults = {
    apiKeyName     : 'api',
    assetEndpoint  : '',
    autostart      : false,
    dpr            : 1,
    fullscreen     : false,
    hd             : null,
    maxConnections : 5,
    namespaces: {
        lib        : 'lib',
        images     : 'images',
        createjs   : 'createjs'
    },
    onload         : null,
    properties     : null,
};
var env = __getEnvData(global.navigator.userAgent);


/**
 * Flash CC からパブリッシュした CreateJS ファイルの再生支援を行います
 *
 * @class FLCjsPlayer
 * @param {String|Object} canvas
 *      描画を行う canvas のクエリセレクタもしくは HTMLCanvasElement
 * @param {String} rootMcName
 *      パブリッシュされた CreateJS ファイル内のルートシンボルの名前
 * @param {Object} [option]
 *      オプション設定のためのオブジェクト
 * @param {Boolean} [option.fullscreen=false]
 *      フルスクリーンモード切替のフラグ
 * @param {Boolean} [option.hd=null]
 *      高画質モード切替のフラグ。true: 高画質, false: 低画質 のように再生画質を固定する。null の場合は自動判定を行う
 * @param {Number} [option.dpr=2]
 *      設定する Device Pixel Ratio 。例えば dpr: 2 の場合で表示サイズが 320 x 416 とすると、CreateJS コンテンツの制作サイズは 640 x 832 となる
 * @param {Boolean} [option.autostart=false]
 *      オートスタートのフラグ。true の場合、コンストラクタを初期化した時点で読み込みが開始し、再生がスタートする
 * @param {Object} [option.properties=null]
 *      パブリッシュされた CreateJS ファイルの lib.properties を上書きするための値を指定する
 * @param {String} [option.assetEndpoint]
 *      アセットを読み込む URL のエンドポイントを指定。createjs.LoadQueue の第2引数に渡されます
 * @param {Number} [option.maxConnections=5]
 *      アセットを読み込む際の同時リクエスト数を指定
 * @param {String} [option.apiKeyName='api']
 *      getApi メソッドで検索する API のキー名、例えば 'api' であれば、getApi() は stage.api という場所を検査して、結果を返す
 * @param {Function} [option.onload=null]
 *      読み込み完了時のコールバック関数を指定
 * @param {Object} [option.namespaces={ lib: 'lib', images: 'images', createjs: 'createjs' }]
 *      FlashCC で指定した各ネームスペースの値を設定する
 */
function FLCjsPlayer(canvas, rootMcName, option) {
    if (!(this instanceof FLCjsPlayer)) {
        return (new FLCjsPlayer(canvas, rootMcName, option));
    }
    var setting;

    this.state = STATES.INITIALIZE;
    this.setting = setting = __getSetting(defaults, option);
    this.rootMcName = rootMcName;
    this.mc = {};

    // namespaces のチェックと設定
    this._ns = __getNamespaces(setting.namespaces);
    // properties のチェックと設定
    this.properties = __getProperties(this._ns.lib.properties, setting.properties);
    // canvas のチェックと設定
    this.canvas = __getCanvas(canvas);

    // 再生クオリティの決定
    // setting.hd が設定されている場合、再生クオリティはそれに従う
    if (typeof setting.hd === 'boolean') {
        this.isHdMode = setting.hd;
        this.isSdMode = !!setting.hd;
    }
    // setting.hd が設定されていないので、自動でクオリティを設定する
    else {
        this.isHdMode = env.isHighSpec;
        this.isSdMode = !env.isHighSpec;
    }

    // オートスタートフラグが立ってたら、ここでロードしてスタートする
    if (setting.autostart) {
        this.load();
    }
}


////// Static member variables

/**
 * FLCjsPlayer 内部で用いる state を入れたオブジェクト
 *
 * @member FLCjsPlayer
 * @property {Object} STATES
 * @static
 */
FLCjsPlayer.STATES = STATES;

/**
 * UserAgent から判定した環境設定情報
 *
 * @member FLCjsPlayer
 * @property {Object} env
 * @static
 */
FLCjsPlayer.env = env;

/**
 * Object, Array の deep extend を行う
 *
 * @memver FLCjsPlayer
 * @method extend
 * @static
 */
FLCjsPlayer.extend = __extend;


////// Prototypes

FLCjsPlayer.prototype = {
    constructor     : FLCjsPlayer,
    addManifestData : _addManifestData,
    destroy         : _destroy,
    getApi          : _getApi,
    getMovieClip    : _getMovieClip,
    initViewer      : _initViewer,
    load            : _load,
    loadManifests   : _loadManifests,
    pause           : _pause,
    play            : _play,
    resume          : _resume,
    setManifestData : _setManifestData,
    stop            : _stop,
};

////// Exports
global.FLCjsPlayer = FLCjsPlayer;


////// member methods

/**
 * アセットと、ルートムービークリップのロードと初期化を行う
 * アセット読み込みがない場合は、即座にルートムービークリップの初期化のみ行う
 * アセットは非同期、ムービークリップは同期で走るが、ルートのムービークリップは初期化コストが高いので処理の終了後に読み込み完了としている
 *
 * @member FLCjsPlayer
 * @method load
 * @param {Function} [callback]
 *      ロード完了時のコールバック。 option.onload よりあとに呼ばれる。
 */
function _load(callback) {
    if (this.state !== STATES.INITIALIZE) {
        return;
    }
    var that = this;
    var setting = this.setting;
    var properties = this.properties;
    var RootMcObj = this._ns.lib[this.rootMcName];
    var q = new FlCjsPlayer.Q(function() {
        var cb = setting.onload;

        that.stage = new that._ns.createjs.Stage(that.canvas);
        that.rootMc = that.mc['/'] = new RootMcObj();
        that.state = STATES.LOADED;
        if (setting.autostart) {
            that.play();
        }
        cb && cb();
        callback && callback();
    });

    if (!RootMcObj) {
        throw new Error('Missing object error. Movieclip "' + that.rootMcName + '" does not exist in namespace "' + setting.namespaces.lib + '".');
    }

    this.state = STATES.LOADING;
    this.loadManifests(properties.manifest, q.ing());
    this.initViewer(q.ing());
}

/**
 * Canvas のサイズ設定、フルスクリーンの処理を行う
 *
 * @member FlCjsPlayer
 * @method initViewer
 * @private
 * @param {Function} callback
 *      設定完了時のコールバック
 */
function _initViewer(callback) {
    var setting = this.setting;
    var properties = this.properties;
    var canvas = this.canvas;
    var width, height, styleWidth, styleHeight;

    if (this.isHdMode) {
        width = properties.width;
        height = properties.height;
        styleWidth = width / setting.dpr;
        styleWidth = height / setting.dpr;
    } else {
        width = styleWidth = properties.width / setting.dpr;
        height = styleHeight = properties.height / setting.dpr;
    }

    canvas.width = width;
    canvas.height = height;
    // fullscreen 指定時は、navigation bar の巻き上げと window, canvas サイズを調整する
    if (setting.fullscreen) {
        __adjustFullscreen(canvas, properties.width, properties.height, callback);
    }
    // 未指定時は、そのまま style で大きさをセットして callback を呼ぶ
    else {
        canvas.style.width = styleWidth + 'px';
        canvas.style.height = styleHeight + 'px';
        callback();
    }
}

/**
 * 対象の CreateJS ファイルが持つ prototypes.manifest に記述されたファイル群をロードする
 *
 * @member FLCjsPlayer
 * @private
 * @method loadManifests
 * @param {Array} manifests
 *      CreateJS ファイルの properties.manifest 形式の配列
 * @param {Function} callback
 *      読み込み完了時に発火するコールバック
 */
function _loadManifests(manifests, callback) {
    var setting = this.setting;
    var images = this._ns.images;

    if (!manifests || manifests.length < 1) {
        callback();
        return;
    }
    var loader = new FLCjsPlayer.AssetLoader({
        basePath: setting.assetEndpoint
    });

    loader.on('manifestsLoaded', function(ev) {
        var result = ev.result;

        for (var i = 0, res; res = result[i]; i++) {
            images[res.id] = res;
        }
        callback();
    });
    loader.loadWithManifests(manifests);
}

/**
 * 描画 Canvas への各種描画設定、フルスクリーン処理、CreateJS の再生開始を行う
 *
 * @member FLCjsPlayer
 * @method play
 */
function _play() {
    if (this.state !== STATES.LOADED) {
        return;
    }
    var that = this;
    var setting = this.setting;
    var properties = this.properties;
    var stage = this.stage;
    var rootMc = this.rootMc;
    var ticker = this._ns.createjs.Ticker;

    if (!this.isHdMode) {
        stage.scaleX = stage.scaleY = 1 / setting.dpr;
    }
    stage.addChild(rootMc);
    stage.update();
    ticker.setFPS(properties.fps);
    ticker.addEventListener('tick', stage);
    this.state = STATES.PLAYING;
}

/**
 * CreateJS の停止処理を行う
 *
 * @member FLCjsPlayer
 * @method stop
 */
function _stop() {
    this.state = STATES.STOPED;
    if (this.stage) {
        this._ns.createjs.Ticker.removeEventListener('tick', this.stage);
        this.stage.clear();
    }
}

/**
 * CreateJS が再生中の場合、CreateJS のポーズ処理を行う
 *
 * @member FLCjsPlayer
 * @method pause
 */
function _pause() {
    if (this.state !== STATES.PLAYING) {
        return;
    }
    this.state = STATES.PAUSED;
    this._ns.createjs.Ticker.removeEventListener('tick', this.stage);
}

/**
 * CreateJS がポーズ中の場合、レジュームの処理を行う
 *
 * @member FLCjsPlayer
 * @method resume
 */
function _resume() {
    if (this.state !== STATES.PAUSED) {
        return;
    }
    this.state = STATES.PLAYING;
    this._ns.createjs.Ticker.addEventListener('tick', this.stage);
}

/**
 * 指定したパスのムービークリップを取得する
 *
 * @member FLCjsPlayer
 * @method getMovieClip
 * @param {String} path
 *      取得するムービークリップへのルートムービークリップからの絶対パス
 *      ex. '/path/to/target/mc' のようにスラッシュ区切りで指定
 * @param {Boolean} [cache=false]
 *      取得したムービークリップをローカルにキャッシュするかどうかのフラグ
 *      true の場合、渡されたパスに対して取得したムービークリップをキャッシュするので
 *      次回のアクセスが早くなりますが、ムービークリップが差し替わった場合に、新しいムービークリップへアクセスできなくなります
 * @return {Object|null}
 *      取得したムービークリップ
 *      MC が見つからなかった場合、console.warn を出したのち、null を返します。
 */
function _getMovieClip(path, cache) {
    var st = this.state;

    if (st === STATES.INITIALIZE || st === STATES.PAUSED) {
        return null;
    } else if (path === undefined) {
        throw new Error('Missing argument error. First argument is required');
    } else if (typeof path !== 'string') {
        throw new TypeError('Argument type error. First argument must be String');
    } else if (this.mc[path]) {
        return this.mc[path];
    }
    var delimiter = '/';
    var pathList = path.split(delimiter);
    var mc = this.mc[delimiter];

    if (path[0] === delimiter) {
        pathList.shift();
    } else {
        path = delimiter + path;
    }
    for (var i = 0, p; p = pathList[i]; i++) {
        mc = mc[p];
        if (!mc) {
            console.warn('Undefined movieclip. [Path, Target movieclip, Target path]: ', path, mc, p);
            return null;
        }
    }
    if (cache) {
        this.mc[path] = mc;
    }
    return mc;
}

/**
 * API を取得する
 * 引数のパスから取得した MC 、もしくはステージオブジェクトから、引数 name もしくは setting.apiKeyName をキーにして、API オブジェクトを取得する
 *
 * @member FLCjsPlayer
 * @method getApi
 * @param {String} [name=setting.apiKeyName]
 *      取得する API が設定されているオブジェクトのキー名
 *      指定無しの場合は setting.apiKeyName を参照する
 * @param {String} [path='/']
 *      API を取得するターゲットとなるムービークリップへのパスをスラッシュ区切りで指定
 *      ex. 'path/to/target/mc'
 * @return {Object|null}
 *      取得した API
 *      API が見つからなかった場合、console.warn を出したのち、null を返します。
 */
function _getApi(name, path) {
    path = path || '/';
    var mc = this.getMovieClip(path);
    var api;

    if (!mc) {
        throw new Error('Undefined MovieClip [name, path]: "' + name + '", "' + path + '"');
    }
    name = name || this.setting.apiKeyName;
    api = mc[name];
    if (!api) {
        // FIXME: エラー投げた方が良い？
        console.warn('Undefined api [Target movieclip, Api key name]', mc, name);
        return null;
    }
    return api;
}

/**
 * id を元に properties.manifest に存在する manifest のデータを書き換える
 * id が存在しない場合は、新たに manifest オブジェクトを生成し、manifest へ追加する
 *
 * @member FLCjsPlayer
 * @method setManifestData
 * @param {String|Number} id
 *      manifest のデータを設定する対象の id
 * @param {String|Number} src
 *      設定するアセットデータへの URL、もしくは base64 String
 * @param {String} [type]
 *      設定する manifest データのタイプを指定。 src に base64 String を指定した場合は必須
 *      指定するのは createjs.LoadQueue 以下の各タイプ
 */
function _setManifestData(id, src, type) {
    var manifestList = this.properties.manifest;
    var typeRe = /string|number/;
    var target;

    if (!id || !src) {
        throw new Error('Missing arguments error. First and second argument is required');
    } else if (!typeRe.test(typeof id) || !typeRe.test(typeof src)) {
        throw new Error('Argument type error, arguments must be String or Number');
    }

    for (var i = 0, manifest; manifest = manifestList[i]; i++) {
        if (id === manifest.id) {
            target = manifest;
            break;
        }
    }
    if (!target) {
        target = { id: id };
        manifestList.push(target);
    }
    target.src = src;
    if (type) {
        target.type = type;
    }
}

/**
 * 現在の properties.manifest に新しい manifest データを追加する
 *
 * @member FLCjsPlayer
 * @method addManifestData
 * @param {Object} manifest マニフェストデータ、引数を追加することで複数指定可能
 * @param {String|Number} manifest.id
 *      manifest のデータを設定する対象の id
 * @param {String|Number} manifest.src
 *      設定するアセットデータへの URL、もしくは base64 String
 * @param {String} [manifest.type]
 *      設定する manifest データのタイプを指定。 src に base64 String を指定した場合は必須
 *      指定するのは createjs.LoadQueue 以下の各タイプ
 */
function _addManifestData() {
    if (!this.properties.manifest) {
        this.properties.manifest = [];
    }
    var args = [].slice.call(arguments);
    var manifest = this.properties.manifest;

    for (var i = 0, arg; arg = args[i]; i++) {
        manifest[manifest.length] = arg;
    }
}

/**
 * インスタンスが持つプロパティやデータを全て破棄する
 * 実行後は、本インスタンスは利用不可能になるので注意
 *
 * @member FLCjsPlayer
 * @method destroy
 */
function _destroy() {
    this.stop();
    this.state = STATES.DESTROYED;

    var images = this._ns.images;
    var manifests = this.properties.manifest;
    var keys = Object.keys(this);
    var i, manifest, key;

    for (i = 0; manifest = manifests[i]; i++) {
        images[manifest.id] = null;
        delete images[manifest.id];
    }
    for (i = 0; key = keys[i]; i++) {
        if (key === 'state') {
            continue;
        }
        this[key] = null;
        delete this[key];
    }
}



////// private methods

function __adjustFullscreen(canvas, width, height, callback) {
    // viewer size of mobile safari in iOS7 on iPhone4(s)
    var MIN_SCREEN_HEIGHT = 372;
    var M = global.Math;
    var scale = height / width;
    var cb = function() {
        // the callbacks called only once
        cb = null;
        callback && callback();
    };

    global.addEventListener('orientationchange', function() {
        setTimeout(exec, 150);
    });

    exec();

    function exec() {
        var body = global.document.body;
        var bodyStyle = body.style;
        var screen = global.screen;
        var screenHeight = M.max(screen.availHeight, screen.availWidth);
        var lastBodyHeight = bodyStyle.height;

        // 一旦タッチを全部殺す
        body.addEventListener('touchstart', disableScroll);
        // body の高さを screen の高さに
        bodyStyle.height = screenHeight + 'px';
        // 巻き上げ
        global.scrollTo(0, 1);
        setTimeout(function() {
            var canvasStyle = canvas.style;
            var innerWidth = global.innerWidth;
            var innerHeight = global.innerHeight;
            var isPortrait = innerWidth < innerHeight;
            var scaledHeight = innerWidth * scale;
            var settingHeight;

            // タッチ抑制を解除
            body.removeEventListener('touchstart', disableScroll);
            // 取っといた body.height のスタイルを戻る
            bodyStyle.height = lastBodyHeight;
            // 盾持ち、かつ画面の大きさがコンテンツより大きい場合
            if (isPortrait &&
                innerHeight > MIN_SCREEN_HEIGHT &&
                innerHeight > scaledHeight) {
                    // 横全体の大きさにしてもコンテンツの縦は表示できるので、scaledHeight を突っ込んでおく
                    settingHeight = scaledHeight;
            } else {
                // 縦のサイズが足りないので、現在の縦幅を突っ込む
                settingHeight = innerHeight;
            }
            // canvas に大きさを設定
            canvasStyle.width = (settingHeight / scale) + 'px';
            canvasStyle.height = settingHeight + 'px';
            cb && cb();
        }, 200);
    }

    function disableScroll(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    }
}


/**
 * UserAgent から、簡易的な環境データを生成する
 *
 * @member FLCjsPlayer
 * @method __getEnvData
 * @private
 * @param {Object} ua ユーザーエージェント文字列
 * @return {Object}
 *      判定結果のオブジェクト
 *      {
 *          isAndroid        : {Boolean}, // Android かどうか
 *          isios            : {Boolean}, // iOS かどうか
 *          isChrome         : {Boolean}, // Chrome かどうか
 *          isAndroidBrowser : {Boolean}, // Android 標準ブラウザかどうか
 *          isMobileSafari   : {Boolean}, // Mobile Safari かどうか
 *          isHighSpec       : {Boolean}, // ハイスペック機種 (Android4.2 以上、もしくは iOS 端末で画面サイズが 416 (iPhone4相当)以上)
 *          versionString    : {String},  // ドット区切りのバージョン番号 ex. '4.2.2' '7.0'
 *          version          : {Number[]} // バージョン番号が一桁ずつ入った配列 ex. [4, 2, 2] [7, 0]
 *      }
 */
function __getEnvData(ua) {
    var res = {};
    var version;

    ua = ua.toLowerCase();
    res.isAndroid = /android/.test(ua);
    res.isIos = /ip(hone|od|ad)/.test(ua);
    res.isChrome = /(chrome|crios)/.test(ua);
    res.isAndroidBrowser = !res.chrome && res.android && /applewebkit/.test(ua);
    res.isMobileSafari = !res.chrome && res.ios && /applewebkit/.test(ua);

    res.versionString =
        (res.androidBrowser || res.android && res.chrome) ? ua.match(/android\s(\S.*?)\;/) :
        (res.mobileSafari || res.ios && res.chrome) ? ua.match(/os\s(\S.*?)\s/) :
        null;
    res.versionString = res.versionString ?
        // iOS だったら、_ を . に直す
        (res.ios ? res.versionString[1].replace('_', '.') : res.versionString[1]) :
        null;
    res.version = version = res.versionString ? res.versionString.split('.') : null;
    res.isHighSpec = false;

    if (version) {
        for (var i = 0, iz = version.length; i < iz; i++) {
            version[i] = version[i]|0;
        }
        var majorVersion = version[0];
        var minorVersion = version[1];

        // 4.2 以上だったら ishighspec true;
        if (res.android && (majorVersion === 4 && minorVersion > 2)) {
            res.isHighSpec = true;
        }
        else if (res.ios) {
            var screen = global.screen;

            // 画面サイズが 416 以上 (iPhone4(s)以上) だったら
            if (Math.max(screen.width, screen.height) > 416) {
                res.isHighSpec = true;
            }
        }
    }
    return res;
}

/**
 * FlashCC からはき出した CreateJS ファイルの lib.properties の内容を option.properties で上書きして、新しいオブジェクトを返す
 *
 * @member FLCjsPlayer
 * @method __getProperties
 * @private
 * @param {Object} properties
 *      出力された、生の lib.properties
 * @param {Object} option
 *      option で設定された properties
 */
function __getProperties(properties, option) {
    var res = {};
    var keys = Object.keys(properties);

    option = option || {};
    for (var i = 0, key; key = keys[i]; i++) {
        res[key] = (option[key] !== undefined) ? option[key] : properties[key];
    }
    return res;
}

/**
 * クエリセレクタから DOM を検索して HTMLCanvasElement を返す
 *
 * @member FLCjsPlayer
 * @method __getCanvas
 * @private
 * @param {String|Object} canvas
 *      canvas を検索するクエリセレクタ、もしくは HTMLCanvasElement
 * @return {Object} HTMLCanvasElement
 */
function __getCanvas(canvas) {
    var res;

    if (canvas) {
        if (typeof canvas === 'string') {
            res = global.document.querySelector(canvas);
            if (!res) {
                throw new Error('Element with the QuerySelector "' + canvas + '" does not exist');
            }
        } else if (canvas.tagName && canvas.tagName.toLowerCase() === 'canvas') {
            res = canvas;
        } else {
            throw new TypeError('Argument type error. First Argument must be String or HTMLCanvasElement. ' + (Object.prototype.toString.call(canvas)) + ' given.');
        }
    } else {
        throw new Error('Missing argument error. First argument is required');
    }
    return res;
}

/**
 * 設定された namespaces の情報を元に、グローバルオブジェクトからネームスペースの実体を取得して返す
 *
 * @member FLCjsPlayer
 * @method __getNamespaces
 * @private
 * @param {Object} ns
 *      設定された namespaces オブジェクト
 * @return {Object}
 *      取得した namespaces の各実体を入れたオブジェクト
 *      {
 *          lib      : {Object},
 *          images   : {Object},
 *          createjs : {Object}
 *      }
 */
function __getNamespaces(ns) {
    var keys = Object.keys(ns);
    var res = {};

    for (var i = 0, key; key = keys[i]; i++) {
        if (global[ns[key]] === undefined) {
            throw new Error('Namespace "' + ns[key] + '" does not exist in global object');
        }
        res[key] = global[ns[key]];
    }
    return res;
}

/**
 * デフォルトの設定を option の設定で上書きして、新しいオブジェクトを返す
 *
 * @member FLCjsPlayer
 * @method __getSetting
 * @private
 * @param {Object} defaults
 *      デフォルトの設定オブジェクト
 * @param {Object} option
 *      オプションで指定されたオブジェクト
 * @return {Object}
 *      マージ済みの設定オブジェクト
 */
function __getSetting(defaults, option) {
    return FLCjsPlayer.extend({}, defaults, option);
}

/**
 * シンプルな Object.extend
 *
 * @member FLCjsPlayer
 * @property {Function} extend
 * @static
 * @param {Object} target object
 * @param {Object} domor object
 * @return extened object
 */
function __extend() {
    if (arguments.length < 2) {
        return arguments[0];
    }
    var deepTargetRe = /(object|array)/;
    var args = [].slice.call(arguments);
    var res = args.shift();
    var i = 0, arg;

    while ((arg = args[i])) {
        var j = 0;

        switch (typeof arg) {
            case 'array':
                for (var jz = arg.length; j < jz; j++) {
                    _extend(j, res, arg);
                }
                break;
            case 'object':
                var donorKeys = Object.keys(arg);

                for (var key; key = donorKeys[j]; j++) {
                    _extend(key, res, arg);
                }
                break;
        }
        i++;
    }

    return res;

    function _extend(key, target, donor) {
        var val = donor[key];
        var targetVal = target[key];
        var donorValType = (val && typeof val) || '';
        var targetValType = (targetVal && typeof targetVal) || '';

        if (deepTargetRe.test(donorValType)) {
            if (targetValType !== donorValType) {
                target[key] = (donorValType === 'object') ? {} : [];
            }
            __extend(target[key], val);
        } else {
            target[key] = val;
        }
    }
}

})(this.self || global, void 0);
