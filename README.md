# FlashCC CreateJS Player

本プロダクトは以下の機能を提供します。

- FlCjsPlayer

    - FlashCC からパブリッシュした CreateJS ファイルに対する下記の動作

        - 読み込み
        - 再生
        - 停止
        - ポーズ
        - レジューム  
        - 破棄

    - Retina (高解像度) 向けの画質調整対応
    - フルスクリーン、画面回転時の描画サイズ調整対応
    - 簡易的な UserAgent 判定 (`FlCjsPlayer.env`)

- CjsPlayer.AssetLoader 

    - lib.properties.manifest に記載されたアセットの読み込み
    - base64 ソースへの対応

- CjsPlayer.Q

    - 複数のコールバックハンドリング


## Files

```
# Minify & Concat されたファイル群
dist
├── cjs-player.all.js         // CreateJS Player, CreateJS Extensions をひとまとめにしたもの
├── cjs-player.combined.js    // CreateJS Player クラス群を concat したもの
└── cjs.extensions.js         // src/extensions/ 以下を concat したもの
src
├── cjs-player.js             // CreateJS Player のソース
├── cjs-player.AssetLoader.js // CreateJS Player AssetLoader のソース
└── cjs-player.Q.js           // CreateJS Player Q のソース
```

通常、使用するだけであれば dist/cjs-player.all.js を読み込んでください。


## Usage

詳細なドキュメントは [API Documentation](http://dameleon.github.io/fl-cjs-player/) で確認できます。

### CreateJS Player

#### 一番簡単な使い方

```javascript
var player = new CjsPlayer(
    // 描画を行う canvas へのクエリセレクタ、もしくは HTMLCanvasElement を渡す
    '#target_canvas',    // or document.getElementById('target_canvas')
    // FlashCC でパブリッシュした CreateJS のルートのムービークリップ名(大体は fla ファイルと同一の名前)を指定
    'cjs_root_mc_name',
    // オプション設定のためのオブジェクトを渡す
    {
        autostart: true
    }
);

// autostart: true なので読み込み終了後、再生が始まります
```

- 詳細なオプションは [ここ](http://dameleon.github.io/fl-cjs-player/#!/api/FlCjsPlayer) にあります


###  CreateJS Player AssetLoader

CreateJS の manifest は、通常 CjsPlayer の `load()` 時に自動的に解決されますが、自身で独自に manifest データを処理したい場合は以下のような使い方ができます。

```javascript

var loader = new CjsPlayer.AssetLoader();

// fileLoaded: ファイル1つずつの読み込み完了時に呼ばれるイベント
loader.on('fileLoaded', function(ev) {
    // result プロパティに Image インスタンスが付いてきます
    var result = ev.result; 
});

// manifestsLoaded: manifest 全体の読み込みで呼ばれるイベント
loader.on('manifestsLoaded', function(ev) {
    // result プロパティに manifest データで指定された Image インスタンスを入れた配列が付いてきます 
    var result = ev.result;
});

// loadWithManifests へ manifest データの入った配列を渡すと読み込みが開始します
loader.loadWithManifests([
    { id: 'hoge', src: 'path/to/image' }
]);
```

### CreateJS Player Q

複数のコールバックを管理する場合に便利なクラスオブジェクトです。アニメーションや非同期読み込みの処理完了を待って次の処理を開始するような場面でお使いください。

※ Task.js や Promise 、 本家の Q などが存在する環境ではそちらを使った方がよいと思います

```javascript
// 例えば2つの非同期処理を待ったあとにコールバックを実行するとして
var q = new CjsPlayer.Q(function() {
        // 完了時にここが呼ばれる    
});

// 2つの setTimeout 完了時に、ハンドラが呼ばれる
setTimeout(q.ing(), 1000);
setTimeout(q.ing(), 500);


// q.ing() を使わずに、手で管理することもできる
var q = new CjsPlayer.Q(function() {});

// キューを追加
q.add();

setTimeout(function() {
    // キューの完了
    q.tick();    
});
```

## Changelog

CreateJS のバージョンは、常に最新のもので確認しています。

- 0.1.0:

    * EaselJS 0.7.1 released
    * TweenJS 0.5.1 released
    * PreloadJS 0.4.1 released

    まで確認済み


## For contributor

### setup the development environment

```shell
$ npm run setup-dev
$ npm install
$ bower install
```

### test

```shell
$ npm test # or gulp test
```

### release and create document

```shell
# release
$ gulp

# create document
$ gulp document
```


## License

MIT License


## Author

[@dameleon](https://twitter.com/damele0n)
