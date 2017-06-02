const analytics = require("./bin/analytics");
const del = require("del");
const distill = require("./distill-template/dist/template.js");
const exec = require("child_process").execSync;
const fs = require("fs");
const fse = require("fs-extra");
const gulp = require("gulp");
const inlineAssets = require("./bin/inline-assets");
const jsd = require("jsdom");
const mustache = require("mustache");
const path = require("path");
const rename = require("gulp-rename");
const through = require("through2");
const webserver = require("gulp-webserver");

const d3 = Object.assign({},
    require("d3-time-format"),
    require("d3-collection")
);

const serializeDocument = jsd.serializeDocument;
const jsdom = jsd.jsdom;
const RFC = d3.timeFormat("%a, %d %b %Y %H:%M:%S %Z");

const paths = {
  dest: "docs/"
};


//
// This is our global data object.
//
let data = {
  now: Date.now(),
  nowRFC: RFC(Date.now())
}


//
// Delete entire build folder
//
gulp.task("clean", function() { return del([paths.dest]); });


//
// Copy the distill template javascript file so it is publically available
//
gulp.task("copyTemplate", function() {
  return gulp.src(["distill-template/dist/template.js", "distill-template/dist/template.js.map"])
    .pipe(rename(path => {
      let b = path.basename.split(".")
      b.splice(1, 0, "v1");
      path.basename = b.join(".");
    }))
    .pipe(gulp.dest(paths.dest));
});


//
// Suck in the journal.json data and the posts.json data
//
gulp.task("beforePostData", gulp.series(loadJournalData, loadPostsData));
function loadJournalData(done) {
  fs.readFile("journal.json", (err, fileData) => {
    if (err) done(err);
    data.journal = JSON.parse(fileData);
    done();
  });
}
function loadPostsData(done) {
  fs.readFile("posts/posts.json", (err, fileData) => {
    if (err) done(err);
    data.posts = JSON.parse(fileData);
    data.posts.forEach(p => {
      p.publishedDate = new Date(p.publishedDate);
      p.updatedDate = new Date(p.updatedDate);
      p.journal = data.journal;
      if (p.doiSuffix >= 1e5) console.error("DOI suffix overflow ", p.doiSuffix);
      p.doi = data.journal.doi + "." + ("000000" + p.doiSuffix).slice(-5);
    });
    data.posts.sort((a, b) => { return b.publishedDate - a.publishedDate; });
    done();
  });
}


//
// Copy and render all the posts, including archive versions and crossref files.
//
gulp.task("posts", gulp.series(copyPosts, renderPosts, renderArchive, renderCrossref));

function copyPosts(done) {
  data.posts.forEach((post, i) => {
    // TODO: alert if we don't have a thumbnail?
    let repoPath = path.join("posts", post.githubPath);
    let originalPath = path.join(repoPath, "public/");
    let publishedPath = path.join(paths.dest, post.distillPath);
    try {
      fse.copySync(originalPath, publishedPath)
    } catch (e) {
      console.error("No public folder for " + repoPath);
    }
  });
  done();
}

function renderPosts() {
  return gulp.src("docs/+([0-9])/*/index.html")
    .pipe(through.obj(function (file, enc, cb) {
      if (file.isStream()) console.error("No streams in renderPosts");
      let post = data.posts.find(p => file.path.includes(p.distillPath));
      console.log(post.distillPath)
      let htmlString = String(file.contents);
      var dom = jsdom(htmlString, {features: {ProcessExternalResources: false, FetchExternalResources: false}});
      distill.render(dom, post);
      distill.distillify(dom, post);
      let transformedHtml = serializeDocument(dom).replace("</body></html>", analytics + "</body></html>");
      file.contents = Buffer(transformedHtml);
      cb(null, file);
    }))
    .pipe(gulp.dest("docs/"));
}

function renderCrossref(done) {
  data.posts.forEach(post => {
    let publishedPath = path.join(paths.dest, post.distillPath);
    let crossrefXml = distill.generateCrossref(post);
    fs.writeFile(path.join(publishedPath, "crossref.xml"), crossrefXml, error => {
      if (error) done(error);
      done()
    });
  });
}

function renderArchive(done) {
  return gulp.src("docs/+([0-9])/*/index.html")
    .pipe(through.obj(function (file, enc, cb) {
      if (file.isStream()) console.error("No streams in renderPosts");
      let post = data.posts.find(p => file.path.includes(p.distillPath));
      let publishedPath = path.join(paths.dest, post.distillPath);
      console.log(post.distillPath)
      let htmlString = String(file.contents);
      var dom = jsdom(htmlString, {features: {ProcessExternalResources: false, FetchExternalResources: false}});
      inlineAssets(dom, "img[src]", "src", publishedPath);
      inlineAssets(dom, 'link[rel="stylesheet"][href]', "href", publishedPath);
      inlineAssets(dom, "script[src]", "src", publishedPath);
      inlineAssets(dom, "video[src]", "src", publishedPath);
      inlineAssets(dom, "video > source[src]", "src", publishedPath);
      inlineAssets(dom, "audio[src]", "src", publishedPath);
      inlineAssets(dom, "audio > source[src]", "src", publishedPath);
      let archiveHtml = serializeDocument(dom);
      //Remove analytics
      archiveHtml = archiveHtml.replace(analytics, "");
      file.contents = Buffer(archiveHtml);
      cb(null, file);
    }))
    .pipe(rename({basename: "index.archive"}))
    .pipe(gulp.dest("docs/"));
}


//
// Cleanup the data after we've rendered all the posts.
//
gulp.task("afterPostData", function(done) {
  // Adding an id field to all people in masthead
  let toID = function(p) {
    p.id = p.name.toLowerCase().replace(" ", "-")
  }
  data.journal.editors.forEach(toID);
  data.journal.committee.forEach(toID);

  // Commentary
  data.commentaries = data.posts.filter(p => {
    return p.tags.indexOf("commentary") !== -1;
  });
  data.commentariesLength = data.commentaries.length;

  // Articles
  data.articles = data.posts.filter(p => {
    return p.tags.indexOf("commentary") === -1;
  });
  data.articlesLength = data.articles.length;

  // Nest the articles into volume/issues
  data.issues = d3.nest()
      .key((d) => d.volume * 100 + d.issue)
      .sortKeys((a, b) => a - b)
      .entries(data.posts);

  data.issues.forEach((issue) => {
    issue.volume = issue.values[0].volume;
    issue.issue = issue.values[0].issue;
  });
  done();
});


//
// Copy and render all the static pages for the site.
//
gulp.task("pages", gulp.series(copyPages, renderPages));
function copyPages() {
  return gulp.src("pages/**/*").pipe(gulp.dest(paths.dest));
}
function renderPages() {
  return gulp.src(["pages/index.html", "pages/**/*.html"])
    .pipe(through.obj(function (file, enc, cb) {
      if (file.isStream()) console.error("No streams in renderPages");
      let htmlString = String(file.contents);
      htmlString += analytics;
      let indexString = mustache.render(htmlString, data);
      let indexDom = jsdom(indexString, {features: {ProcessExternalResources: false, FetchExternalResources: false}});
      let pageData = {
        url: "http://distill.pub/" + file.relative.replace("index.html", ""),
        previewURL: "http://distill.pub/preview.jpg"
      };
      distill.render(indexDom, pageData);
      distill.distillify(indexDom, pageData);
      let transformedHtml = serializeDocument(indexDom);
      file.contents = Buffer(transformedHtml);
      cb(null, file);
    }))
    .pipe(gulp.dest(paths.dest));
}


//
// Render all the feeds.
//
gulp.task("feeds", function(done) {
  fs.writeFileSync(paths.dest + "rss.xml", mustache.render(fs.readFileSync("pages/rss.xml", "utf8"), data));
  done();
});


//
// Run a webserver for previewing the site.
//
gulp.task("serve", function() {
  // gulp.watch("pages/**/*.html", gulp.series("default"))
  gulp.src("docs")
    .pipe(webserver({
      directoryListing: false
    }));
});


//
// Default Task
//
gulp.task("default", gulp.series(
  "clean",
  "copyTemplate",
  "beforePostData",
  "posts",
  "afterPostData",
  "pages",
  "feeds"
))