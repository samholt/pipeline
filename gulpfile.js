var gulp = require("gulp");
var webserver = require("gulp-webserver");
// var del = require("del");

// // clean
// gulp.task("clean", function() {
//   return del(["public"]);
// });

// // html
// gulp.task("html", ["clean"], function() {
//   return gulp.src("*.html")
//       .pipe(gulp.dest("public"));
// });

// // serve
// gulp.task("serve", function() {

//   gulp.watch("*.html", ["html"]);

//   gulp.src("public")
//     .pipe(webserver({
//       livereload: true,
//       directoryListing: true,
//       open: false
//     }));
// });

// // default
// gulp.task("default", ["html"]);