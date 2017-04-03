var gulp = require('gulp');
var rollup = require('rollup');
var tscWrapped = require('@angular/tsc-wrapped');
var runSequence = require('run-sequence');
var fs = require('fs');
var ts = require('typescript');
var uglify = require('uglify-js');
var path = require('path');

var ROLLUP_GLOBALS = {
  '@angular/core': 'ng.core'
};
var LICENSE_BANNER = '/**\n'
  + ' * @license AJF v1.0.0\n'
  + ' * Copyright (c) 2017 Gnucoop scarl. https://www.gnucoop.com/'
  + ' * License: MIT'
  + ' */';
var entryFile = 'dist/packages/ngx-dnd/index.js';
var fesm2015File = 'dist/bundles/ngx-dnd.js';
var es5File = 'dist/bundles/ngx-dnd.es5.js';
var umdFile = 'dist/bundles/ngx-dnd.umd.js';
var umdMinFile = 'dist/bundles/ngx-dnd.umd.min.js';
var srcDir = 'src/lib';
var bundlesDir = 'dist/bundles';
var distDir = 'dist/packages/ngx-dnd';
var releaseDir = 'dist/release';

function createRollupBundle(config) {
  var bundleOptions = {
    context: 'this',
    external: Object.keys(ROLLUP_GLOBALS),
    entry: config.entry
  }

  var writeOptions = {
    moduleId: '',
    moduleName: 'ngx-dnd',
    banner: LICENSE_BANNER,
    format: config.format,
    dest: config.dest,
    globals: ROLLUP_GLOBALS
  }

  return rollup.rollup(bundleOptions).then((bundle) => bundle.write(writeOptions));
}

function createTypingFile() {
  fs.writeFileSync(path.join(releaseDir, `ngx-dnd.d.ts`),
    LICENSE_BANNER + '\nexport * from "./typings/index";'
  );
}

gulp.task('build:esm', function() {
  return tscWrapped.main('src/lib/tsconfig-build.json', {basePath: 'src/lib'});
});

gulp.task('build:fesm2015', function() {
  return createRollupBundle({
    entry: entryFile,
    dest: fesm2015File,
    format: 'es'
  });
});

gulp.task('build:es5', function(done) {
  var inputFile = fs.readFileSync(fesm2015File, 'utf-8');
  var transpiled = ts.transpileModule(inputFile, {
    compilerOptions: {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.ES2015,
      allowJs: true
    }
  });
  fs.writeFileSync(es5File, transpiled.outputText);
  done();
});

gulp.task('build:umd', function() {
  return createRollupBundle({
    entry: es5File,
    dest: umdFile,
    format: 'umd'
  });
});

gulp.task('minify:umd', function(done) {
  var minified = uglify.minify(umdFile, { preserveComments: 'license' }).code;
  fs.writeFileSync(umdMinFile, minified);
  done();
});

gulp.task('build', function(done) {
  runSequence(
    'build:esm',
    'build:fesm2015',
    'build:es5',
    'build:umd',
    'minify:umd',
    done
  )
});

gulp.task(':package:typings', function() {
  return gulp.src(path.join(distDir, '**/*.+(d.ts|metadata.json)'))
    .pipe(gulp.dest(path.join(releaseDir, 'typings')))
    .on('end', function() { createTypingFile(); });
});

gulp.task(':package:umd', function() {
  return gulp.src(path.join(bundlesDir, '*.umd.*'))
    .pipe(gulp.dest(path.join(releaseDir, 'bundles')));
});

gulp.task(':package:fesm', function() {
  return gulp.src([path.join(bundlesDir, 'ngx-dnd.js'), path.join(bundlesDir, 'ngx-dnd.es5.js')])
    .pipe(gulp.dest(path.join(releaseDir, 'ngx-dnd')));
});

gulp.task(':package:assets', function() {
  return gulp.src(path.join(srcDir, '+(package.json|README.md|style.css)'))
    .pipe(gulp.dest(releaseDir));
});

gulp.task(':package:metadata', function() {
  var metadataReExport = '{"__symbolic":"module","version":3,"metadata":{},'
    + '"exports":[{"from":"./typings/index"}]}';
  fs.writeFileSync(path.join(distDir, `ngx-dnd.metadata.json`), metadataReExport, 'utf-8');
});

gulp.task('package:release', function(done) {
  runSequence(
    [':package:typings', ':package:umd', ':package:fesm', ':package:assets'],
    ':package:metadata',
    done
  )
});

gulp.task('build:release', function(done) {
  runSequence('build', 'package:release', done);
});
