module.exports = function(config) {
  config.set({
    basePath: '',
    exclude: [
    ],
    reporters: ['progress', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: true,
    frameworks: ['mocha', 'browserify'],
    files: [
      // CreateJS が必要なので bower で引っ張ってきて読み込む
      'bower_components/createjs-preloadjs/lib/preloadjs-0.4.1.min.js',
      'bower_components/createjs-tweenjs/lib/tweenjs-0.5.1.min.js',
      'bower_components/easeljs/lib/easeljs-0.7.1.min.js',
      'bower_components/easeljs/lib/movieclip-0.7.1.min.js',
      // テストしたい対象のファイル
      'dist/fl-cjs-player.combined.js',
      // テスト用の CreateJS ファイルを読み込む
      'test/fixtures/sample_cjs.js',
    ],

    preprocessors: {
        // browserify
        '/**/*.browserify': ['browserify'],
        // coverage
        'dist/fl-cjs-player.combined.js': ['coverage']
    },
    browserify: {
      debug: true,
      files: [
        'test/**/*.test.js'
      ],
      transform: [
        // 変換の処理に espowerify を追加する
        'espowerify',
      ]
    }
  });
};

