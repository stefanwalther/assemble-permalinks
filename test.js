'use strict';

require('mocha');
var assert = require('assert');
var rimraf = require('rimraf');
var assemble = require('assemble-core');
var permalink = require('./');
var app;

describe('permalinks', function() {
  beforeEach(function() {
    app = assemble();
  });

  it('should support passing the plugin to the app instance:', function() {
    app.use(permalink());
    app.create('pages');

    var page = app.page('a/b/c.txt', {content: '...'})
      .permalink(':name.html');

    assert(typeof page.permalink === 'function');
    assert(page.data.permalink === 'c.html');
  });

  it('should emit the plugin on `app`', function(cb) {
    app.on('plugin', function(plugin) {
      assert(plugin === 'permalinks');
      cb();
    });
    app.use(permalink());
  });

  it('should emit the plugin instance', function(cb) {
    app.on('plugin', function(plugin, appInst) {
      assert(appInst.isApp);
      cb();
    });
    app.use(permalink());
  });

  it('should support passing the plugin to a collection instance:', function() {
    app.create('posts')
      .use(permalink());

    app.posts('a/b/aaa.txt', {content: '...'});

    var post = app.posts.getView('a/b/aaa.txt')
      .permalink(':name.html');

    assert(typeof post.permalink === 'function');
    assert(post.data.permalink === 'aaa.html');
  });

  it('should support passing the plugin to a view:', function() {
    app.create('posts');

    app.post('a/b/aaa.txt', {content: '...'});
    app.post('a/b/bbb.txt', {content: '...'});
    app.post('a/b/ccc.txt', {content: '...'});

    var post = app.posts.getView('a/b/aaa.txt')
      .use(permalink())
      .permalink(':name.html');

    assert(typeof post.permalink === 'function');
    assert(post.data.permalink === 'aaa.html');
  });

  it('should support passing the pattern to the plugin', function() {
    app.create('posts')
      .use(permalink('foo/:name.html'));

    app.post('a/b/aaa.txt', {content: '...'});
    app.post('a/b/bbb.txt', {content: '...'});
    app.post('a/b/ccc.txt', {content: '...'});

    var post = app.posts.getView('a/b/aaa.txt');

    assert(typeof post.permalink === 'function');
    assert(post.data.permalink === 'foo/aaa.html');
  });

  it('should expose a `permalink` method on `app`', function() {
    app.use(permalink());
    assert(typeof app.permalink === 'function');
  });

  it('should use `app.permalink()` as a pipeline plugin', function(cb) {
    app.use(permalink());

    app.task('site', function() {
      return app.src('*.js')
        .pipe(app.permalink('actual/:name/index.html'))
        .pipe(app.dest('.'));
    });

    app.build('site', function(err) {
      if (err) return cb(err);
      rimraf('actual', cb);
    });
  });

  it('should append permalink to dest path', function(cb) {
    app.use(permalink());

    app.task('site', function() {
      return app.src('*.js')
        .pipe(app.permalink(':name/index.html'))
        .pipe(app.dest('actual/'));
    });

    app.build('site', function(err) {
      if (err) return cb(err);
      rimraf('actual', cb);
    });
  });

  it('should expose a `permalink` method on a collection', function() {
    app.create('posts')
      .use(permalink('foo/:name.html'));

    assert(typeof app.posts.permalink === 'function');
  });

  it('should use the permalink pattern passed to the collection plugin', function(cb) {
    var posts = app.create('posts')
      .use(permalink('actual/:name/index.html'));

    app.task('site', function() {
      return posts.src('*.js')
        .pipe(posts.permalink())
        .pipe(posts.dest('.'));
    });

    app.build('site', function(err) {
      if (err) return cb(err);
      rimraf('actual/', cb);
    });
  });

  it('should append the plugin pattern to the dest path', function(cb) {
    var posts = app.create('posts')
      .use(permalink(':name/index.html'));

    app.task('site', function() {
      return posts.src('*.js')
        .pipe(posts.permalink())
        .pipe(posts.dest('actual/'));
    });

    app.build('site', function(err) {
      if (err) return cb(err);
      rimraf('actual/', cb);
    });
  });

  it('should use permalink locals', function() {
    app.create('posts')
      .use(permalink());

    var post = app.post('a/b/aaa.txt', {content: '...'})
      .permalink(':dirname/:foo/:baz.html', {
        foo: 'bar',
        baz: 'qux'
      });

    assert(typeof post.permalink === 'function');
    assert(post.data.permalink === 'a/b/bar/qux.html');
  });
});
