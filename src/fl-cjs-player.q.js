;(function(global, undefined) {
'use strict';

if (!global.FlCjsPlayer) {
    throw new Error('"FlCjsPlayer" does not exist in global');
}

var qid = 0;

/**
 * キューの発行、完了を管理する
 *
 * @class FlCjsPlayer.Q
 * @param {Function} callback
 *      インスタンス化時に渡すコールバックハンドラ
 */
function Q(callback) {
    this.id = qid++;
    this.length = 0;
    this.listeners = [];
    if (callback) {
        this.addHandler(callback);
    }
}

Q.prototype = {
    constructor: Q,
    add        : _add,
    addHandler : _addHandler,
    fire       : _fire,
    ing        : _ing,
    tick       : _tick
};

/**
 * コールバックハンドラを登録する
 *
 * @method addHandler
 * @member FlCjsPlayer.Q
 * @param {Function} callback
 *      登録するコールバック関数
 */
function _addHandler(callback) {
    if (typeof callback !== 'function') {
        throw new Error('Argument type error. First argument must be Function');
    }
    this.listeners.push(callback);
}

/**
 * 待機キューを発行し、コールバック用の関数を返す。命名の由来は Queueing
 *
 * @method ing
 * @member FlCjsPlayer.Q
 * @param {Function} [callback]
 *      コールバック用の関数が発火した際に呼ぶオプショナルなコールバック関数
 */
function _ing(callback) {
    var that = this;

    this.length++;
    return function() {
        var args = arguments;

        that.length--;
        callback && callback.apply(null, args);
        if (that.length < 1) {
            that.fire.apply(that, args);
        }
    };
}

/**
 * 全てのコールバックハンドラを発火する
 *
 * @method fire
 * @member FlCjsPlayer.Q
 * @param {Any} args
 *      コールバックハンドラへ渡す引数。複数指定可能。
 */
function _fire() {
    var args = arguments;
    var listeners = this.listeners;
    var listener;

    while (!!(listener = listeners.shift())) {
        listener.apply(null, args);
    }
}

/**
 * キューを進める
 *
 * @method tick
 * @member FlCjsPlayer.Q
 * @param {Any} args
 *      キューが発火する場合に、コールバックハンドラへ渡す引数。複数指定可能。
 */
function _tick() {
    this.length--;
    if (this.length < 1) {
        this.fire.apply(this, arguments);
    }
}

/**
 * キューを発行する
 *
 * @method add
 * @member FlCjsPlayer.Q
 */
function _add() {
    this.length++;
}


// export
global.FlCjsPlayer.Q = Q;


})(this.self || global, void 0);
