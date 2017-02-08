var gulp = require("gulp");
var webserver = require("gulp-webserver");
var mustache = require("gulp-mustache");
var distill = require("./bin/gulp-distill.js");
var analytics = require("./bin/analytics");
var replace = require("gulp-replace");
// var del = require("del");

// clean
// gulp.task("clean", function() {
//   return del(["public"]);
// });

// // html
// gulp.task("html", ["clean"], function() {
//   return gulp.src("*.html")
//       .pipe(gulp.dest("public"));
// });


//pages
gulp.task("pages", function() {
  return gulp.src("pages/**/*.html")
    .pipe(mustache({}))
    .pipe(distill({}))
    .pipe(replace("</body></html>", analytics + "</body></html>"))
    .pipe(gulp.dest("./build"))
});

// serve
gulp.task("serve", ["pages"], function() {

  gulp.watch("pages/**/*.html", ["pages"]);

  gulp.src("build")
    .pipe(webserver({
      livereload: true,
      directoryListing: true,
      open: false
    }));
});



// // default
// gulp.task("default", ["html"]);