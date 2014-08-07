# CreateJS Player for FlashCC.

本プロダクトは以下の機能を提供します。

- FlashCC からパブリッシュした CreateJS の再生支援
    - アセットの読み込み
    - 再生
    - 停止
    - ポーズ
    - レジューム  

- Retina (高解像度) 向けの画質調整対応
- フルスクリーン、画面回転時の描画サイズ調整対応
- 簡易的な UserAgent 判定
- CjsPlayer.AssetLoader による manifest に記述されたアセットの読み込み
- CjsPlayer.Q による、複数個のコールバックを管理しながら全ての完了を管理するキューイングの仕組み
- CreateJS を拡張し、オリジナルメソッドの追加

    - MovieClip.gotoAndPlayWithCallback

        特定フレーム間を play し、callback を呼ぶ
    
    - Container.cloneWithSharingCache

        Container (もしくは Container を継承したオブジェクト) を clone する際に、cache している内部の canvas を使い回す

    - Container._getObjectsUnderPoint

        Container (もしくは Container を継承したオブジェクト) の hitTest を改善する


## ファイル構成

```
# Minify & Concat されたファイル群
dist
├── cjs-player.all.js         // CreateJS Player, CreateJS Extensions をひとまとめにしたもの
├── cjs-player.combined.js    // CreateJS Player クラス群を concat したもの
└── cjs.extensions.js         // src/extensions/ 以下を concat したもの
src
├── cjs-player.js             // CreateJS Player のソース
├── cjs-player.AssetLoader.js // CreateJS Player AssetLoader のソース
├── cjs-player.Q.js           // CreateJS Player Q のソース
└── extensions                // CreateJS を拡張する機能のソースを入れたディレクトリ
        └── *.js              // CreateJS を拡張する機能のソースたち。
                                 // ファイル名の規則は cjs.{TARGET_OBJECT}.{METHOD_NAME}.js とする
```

通常、使用するだけであれば dist/cjs-player.all.js を読み込んでください。

**注意**

- Extensions を使用する場合、必ず CreateJS 本体のファイル群が読み込まれたあとで Extensions のファイルを読み込んでください。.all.js を使用する場合も同様です。(あらかじめ concat して minify してしまうのがおすすめです)


## Usage

詳細なドキュメントは [API Documentation](https://github.dena.jp/pages/takahashi-kei/createjs-player/) で確認できます。

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

- 詳細なオプションは [ここ](https://github.dena.jp/pages/takahashi-kei/createjs-player/#!/api/CjsPlayer) にあります


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

### Extensions

#### createjs.MovieClip.gotoAndPlayWithCallback

命名規則に従った特定のラベル間を再生し、終了ラベル到達時に callback を発火します。

命名規則は、 **終了ラベルにおいて {再生ラベル}_end となるように _end をつけておく** これだけです。

[ドキュメント](https://github.dena.jp/pages/takahashi-kei/createjs-player/#!/api/createjs.MovieClip)

**注意**

- createjs.MovieClip オブジェクトを拡張するので、Container 等には上記のメソッドは生えません

```javascript
// someMC には play, play_end というラベル名が付いているとする 
someMC.gotoAndPlayWithCallback('play', function() {
    // play_end に到達した瞬間に実行される    
});
```


#### createjs.Container.cloneWithSharingCache

シンボルを clone する際に、対象のシンボルのキャッシュ情報を引き継いだシンボルを生成します。

これにより、同一のシンボルでもキャッシュが別、というようなことが起こりづらくなるため、より省メモリにシンボルを生成することができます。

[ドキュメント](https://github.dena.jp/pages/takahashi-kei/createjs-player/#!/api/createjs.Container)

**注意**

- createjs.Container オブジェクトを拡張するので、 Container オブジェクトから拡張される MovieClip などでもメソッドが使用できます 
- キャッシュ情報を共有しているシンボルのいずれかでキャッシュの更新を行うと、全てのシンボルの描画情報が更新されます

```javascript
var newMC = someMC.cloneWithSharingCache();

// キャッシュ情報は同一なので true となる
console.log(newMC.cacheID === someMC.cache);
```


#### createjs.Container._getObjectsUnderPoint

[この記事](http://qiita.com/damele0n/items/e9c36524e18b0f38a079) の通り、iOS7 on iPhone4 では hitArea に対する hitTest が上手く動作しません。

このコードで修正は可能ですが、下記のリスクを抱えるので注意してください

- hitArea が何らかの方法で変形されてる(scale がかかってる)とうまくいかないかもしれない
- 矩形の範囲しか指定できない = hitTest が全部矩形で判断されてしまう

この方法以外では、現状は逃げ道がありません。

iOS7 on iPhone4 のサポートを切ることも視野に入れてください。



## サポート情報

CreateJS のバージョンは、常に最新のもので確認しています。

- 0.2.0:

    * EaselJS 0.7.1 released
    * TweenJS 0.5.1 released
    * PreloadJS 0.4.1 released

    までサポート

## contribute

#### 準備

まず開発に必要な npm と bower たちを入れます
```shell
$ npm run develop
...
$ npm install
... 
$ bower install
```


#### テスト

```shell
$ npm test # or gulp test
```

#### ドキュメント生成

```shell
$ gulp document
```

ドキュメントは docs/ 以下に生成されます。

docs/ 以下は gh-pages の submodule となっているため、まず docs/ の更新を push したのち、親のブランチに add し、push してください。

#### リリース

```shell
$ gulp
... # dist/ 以下にファイルがはき出される
```


## License

来世は外部で公開したい


## Author

Kei Takahashi [kei.takahashi@dena.com](kei.takahashi@dena.com)

kei@irc
