;(function(global, undefined) {
'use strict';

var document = global.document;

if (!global.FLCjsPlayer) {
    throw new Error('"FLCjsPlayer" does not exist in global');
}

var defaults = {
    basePath: ''
};

/**
 * 汎用的なアセットローダ(仮)
 *
 * @class FLCjsPlayer.AssetLoader
 * @param {Object} option
 *      オプション設定のためのオブジェクト
 * @param {String} [option.basePath='']
 *      アセットをロードするためのベースパスを設定
 */
function AssetLoader(option) {
    this.setting = FLCjsPlayer.extend({}, defaults, option);
    this.listeners = {
        // EVENT: []
    };
    this.queue = {
        // qid: Q
    };
    this.tmpFiles = {
        // qid: [ file ,...]
    };
}

AssetLoader.prototype = {
    constructor              : AssetLoader,
    handleEvent              : _handleEvent,
    handleManifestLoaded     : _handleManifestLoaded,
    loadWithManifests        : _loadWithManifests,
    off                      : _off,
    on                       : _on,
    _fire                    : _fire,
    _getListenerListByType   : _getListenerListByType,
    _loadItem                : _loadItem,
    _pushToTemporaryFileList : _pushToTemporaryFileList,
    _tickQueue               : _tickQueue,
};


/**
 * Image インスタンスに対するイベントハンドラ
 * 現状 load or error を受け取って処理する
 *
 * @method handleEvent
 * @member FLCjsPlayer.AssetLoader
 * @param {Object} ev
 *      イベントオブジェクト
 */
function _handleEvent(ev) {
    var target = ev.target;

    target.removeEventListener('load', this);
    target.removeEventListener('error', this);

    switch (ev.type) {
        case 'load':
            var qid = target.__qid;

            this._fire('fileLoaded', target);
            this._pushToTemporaryFileList(qid, target);
            this._tickQueue(qid);
            break;
        case 'error':
            this._fire('error', target);
            break;
    }
}

/**
 * Flash for HTML5 の CreateJS に付加される manifest 情報を元に、アセット群を読み込む
 *
 * @method loadWithManifests
 * @member FLCjsPlayer.AssetLoader
 * @param {Array} manifests
 *      manifest 情報が入った Array
 */
function _loadWithManifests(manifests) {
    if (!Array.isArray(manifests)) {
        throw new Error('Argument type error. First argument must be Array');
    } else if (manifests.length < 1) {
        console.warn('Passed through empty manifests');
        this._fire('manifestLoaded');
        return;
    }
    var that = this;
    var qid;
    var q = new FLCjsPlayer.Q(function() {
        that.handleManifestLoaded(qid);
    });

    qid = q.id;
    this.queue[qid] = q;
    for (var i = 0, manifest; manifest = manifests[i]; i++) {
        q.add();
        this._loadItem(qid, manifest);
    }
}

/**
 * QueueID と1つの manifest 情報から Image インスタンスを生成し、イベントと読み込みの処理を行う
 *
 * @method _loadItem
 * @member FLCjsPlayer.AssetLoader
 * @private
 * @param {Number} qid
 *      読み込みを行う Queue ハンドラの ID
 * @param {Object} manifest
 *      読み込む manifest のデータ
 */
function _loadItem(qid, manifest) {
    var tag = new Image();
    var src = (this.setting.basePath || '') + manifest.src;

    tag.addEventListener('load', this);
    tag.addEventListener('error', this);
    tag.id = manifest.id;
    tag.__qid = qid;
    tag.src = src;
}

/**
 * manifests の読み込み完了処理を行う
 *
 * @method _handleManifestLoaded
 * @member FLCjsPlayer.AssetLoader
 * @private
 * @param {Number} qid
 *      完了処理を行う QueueID
 */
function _handleManifestLoaded(qid) {
    var tmpFileList = this.tmpFiles[qid];

    this.tmpFiles[qid] = null;
    delete this.tmpFiles[qid];
    this.queue[qid] = null;
    delete this.queue[qid];
    this._fire('manifestsLoaded', tmpFileList);
}

/**
 * イベントハンドラの登録を行う
 *
 * @method on
 * @member FLCjsPlayer.AssetLoader
 * @param {String} type
 *      イベント名
 * @param {Function} listener
 *      イベントハンドラ
 */
function _on(type, listener) {
    var listenerList = this._getListenerListByType(type);

    listenerList.push(listener);
}

/**
 * イベントハンドラの登録解除を行う
 *
 * @method off
 * @member FLCjsPlayer.AssetLoader
 * @param {String} type
 *      イベント名
 * @param {Function} listener
 *      イベントハンドラ
 */
function _off(type, listener) {
    var listenerList = this._getListenerListByType(type);
    var index = listenerList.indexOf(listener);

    if (listenerList.length < 1 || index < 0) {
        return;
    }
    listenerList.splice(index, 1);
}

/**
 * イベントを発火する
 *
 * @method _fire
 * @member FLCjsPlayer.AssetLoader
 * @private
 * @param {String} type
 *      発火するイベント名
 * @param {Any} [argument]
 *      イベントオブジェクトの .result プロパティに紐付けるデータ
 */
function _fire() {
    var args = [].slice.call(arguments);
    var type = args.shift();
    var listenerList = this._getListenerListByType(type);

    if (listenerList.length < 1) {
        return;
    }
    var ev = __createEvent(type);

    ev.result = (args.length > 1) ? args : args[0];
    for (var i = 0, listener; listener = listenerList[i]; i++) {
        listener.call(null, ev);
    }
}

/**
 * イベントハンドラをもつ配列を取得する
 *
 * @method _getListenerListByType
 * @member FLCjsPlayer.AssetLoader
 * @private
 * @param {String} type
 *      取得するイベントの名前
 * @return {Array}
 *      イベントハンドラを持つ配列
 */
function _getListenerListByType(type) {
    return (Array.isArray(this.listeners[type])) ? this.listeners[type] : (this.listeners[type] = []);
}

/**
 * 読み込みが完了したファイルを QueueID を元に一時的な配列へ保存する
 *
 * @method _pushToTemporaryFileList
 * @member FLCjsPlayer.AssetLoader
 * @private
 * @param {Number} qid
 *      保存先の QueueID
 * @param {Object} file
 *      保存するファイルのオブジェクトデータ
 *
 */
function _pushToTemporaryFileList(qid, file) {
    var list = (Array.isArray(this.tmpFiles[qid])) ? this.tmpFiles[qid] : (this.tmpFiles[qid] = []);

    list[list.length] = file;
}

/**
 * QueueID を元に Queue を進める
 *
 * @method _tickQueue
 * @member FLCjsPlayer.AssetLoader
 * @private
 * @param {Number} qid
 *      対象の QueueID
 */
function _tickQueue(qid) {
    this.queue[qid].tick();
}


// private methods
/**
 * イベントオブジェクトを生成する
 *
 * @method __createEvent
 * @member FLCjsPlayer.AssetLoader
 * @private
 * @param {String} type
 *      生成するイベントのタイプ
 */
function __createEvent(type) {
    var event = document.createEvent('Event');

    event.initEvent(type, true, true);
    return event;
}

// export
global.FLCjsPlayer.AssetLoader = AssetLoader;


})(this.self || global, void 0);
