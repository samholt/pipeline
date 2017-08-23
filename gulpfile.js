const analytics = require("./bin/analytics");
const del = require("del");
const distill = require("./build/distill-template/dist/template.js");
const execSync = require("child_process").execSync;
const exec = require("child_process").exec;
const fs = require("fs");
const fse = require("fs-extra");
const gulp = require("gulp");
const jsd = require("jsdom");
const mustache = require("mustache");
const path = require("path");
const rename = require("gulp-rename");
const through = require("through2");
const webserver = require("gulp-webserver");
const merge = require('merge-stream');

const d3 = Object.assign({},
    require("d3-time-format"),
    require("d3-collection"),
    require("d3-dsv"),
    require("d3-queue")
);

const serializeDocument = jsd.serializeDocument;
const jsdom = jsd.jsdom;
const RFC = d3.timeFormat("%a, %d %b %Y %H:%M:%S %Z");

const paths = {
  dest: "docs/",
  thirdParty: "docs/third-party/"
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
gulp.task("clean", function() { 
  const folders = Object.values(paths);
  return del(folders); 
});


//
// Copy the distill template javascript file so it is publically available
//
gulp.task("copyTemplate", function() {
  return gulp.src(["build/distill-template/dist/template.js", "build/distill-template/dist/template.js.map"])
    .pipe(rename(path => {
      let b = path.basename.split(".")
      b.splice(1, 0, "v1");
      path.basename = b.join(".");
    }))
    .pipe(gulp.dest(paths.dest));
});

gulp.task("copyThirdParty", function() {
  const katex = gulp.src("./node_modules/katex/dist/*")
    .pipe(gulp.dest(paths.thirdParty + 'katex/'));
  const webcomponents = gulp.src("./node_modules/@webcomponents/webcomponentsjs/webcomponents-lite.js*")
    .pipe(gulp.dest(paths.thirdParty + 'polyfills/'));
  const intersection = gulp.src("./node_modules/intersection-observer/intersection-observer.js*")
    .pipe(gulp.dest(paths.thirdParty + 'polyfills/'));
  return merge(katex, webcomponents, intersection);
});
//
// Suck in the journal.json data and the posts.json data
//
gulp.task("beforePostData", gulp.series(loadJournalData, loadPostsData));
function loadJournalData(done) {
  fs.readFile("journal.json", "utf-8", (err, fileData) => {
    if (err) done(err);
    let journal = JSON.parse(fileData);
      // Adding an id field to all people in masthead
    let toID = function(p) {
      p.id = p.name.toLowerCase().replace(" ", "-")
    }
    journal.editors.forEach(toID);
    journal.committee.forEach(toID);
    data.journal = journal;
    fs.writeFileSync("build/journal.json", JSON.stringify(journal, null, 2));
    done();
  });
}
function loadPostsData(done) {
  fs.readFile("journal.json", "utf-8", (err, fileData) => {
    if (err) done(err);
    let journal = JSON.parse(fileData, (key, value) => {
      if (key == "publishedDate") {
          return d3.timeParse("%Y-%m-%d")(value);
      } else {
          return value;
      }
    });
    let posts = journal.articles;
    posts.forEach(p => {
      p.updatedDate = execSync("git -C build/posts/" + p.distillPath + " log -1 --pretty=format:%cI").toString("utf8");
      p.updatedDate = new Date(p.updatedDate);
      p.journal = data.journal;
      if (p.doiSuffix >= 1e5) console.error("DOI suffix overflow ", p.doiSuffix);
      p.doi = data.journal.doi + "." + ("000000" + p.doiSuffix).slice(-5);

      // If we have a FIRST_PUBLISHED tag in git, use it
      if(execSync("git -C build/posts/" + p.distillPath + " tag -l FIRST_PUBLISHED").toString("utf8")) {
        var tagDate = execSync("git -C build/posts/" + p.distillPath + " show --quiet --pretty=format:%cI FIRST_PUBLISHED -n 1").toString("utf8");
        var pubSha = execSync("git -C build/posts/" + p.distillPath + " show --quiet --format=format:%H FIRST_PUBLISHED -n 1").toString("utf8");
        var headSha = execSync("git -C build/posts/" + p.distillPath + " show --quiet --format=format:%H HEAD -n 1").toString("utf8");
        p.githubCompareUpdatesUrl = "https://github.com/" + p.githubPath + "/compare/" + pubSha + "..." + headSha;
      }

    });
    posts.sort((a, b) => { return b.publishedDate - a.publishedDate; });
    data.posts = posts;
    fs.writeFileSync("build/beforePostData.json", JSON.stringify(posts, null, 2));
    data.posts.forEach(post => {
      fse.ensureDirSync("build/data/" + post.distillPath);
      fs.writeFileSync("build/data/" + post.distillPath + ".json", JSON.stringify(post, null, 2));
    })
    done();
  });
}


//
// Copy and render all the posts, including archive versions and crossref files.
//
gulp.task("posts", gulp.series(copyPosts, renderPosts, renderArchive));

function copyPosts(done) {
  data.posts.forEach((post, i) => {
    // TODO: alert if we don't have a thumbnail?
    let repoPath = path.join("build", "posts", post.distillPath);
    let originalPath = path.join(repoPath, "public/");
    let publishedPath = path.join(paths.dest, post.distillPath);
    try {
      fse.copySync(originalPath, publishedPath);
    } catch (e) {
      console.error("No public folder for " + repoPath);
    }
  });
  done();
}

function renderPosts(done) {
  const concurrency = 4;
  let q = d3.queue(concurrency);
  data.posts.forEach(post => {
    let htmlPath = "build/posts/" + post.distillPath + "/public/index.html";
    let dataPath = "build/data/" + post.distillPath + ".json";
    let htmlWritePath = "docs/" + post.distillPath + "/index.html";
    q.defer(render, dataPath, htmlPath, htmlWritePath);
  });
  function render(dataPath, htmlPath, htmlWritePath, cb) {
    console.log("Rendering: " + htmlWritePath);
    exec("./bin/render " + dataPath + " " + htmlPath + " " + htmlWritePath, (error, stdout) => {
      if (error) throw error;
      cb();
    });
  }
  q.awaitAll(function(error) {
    if (error) throw error;
    done();
  });
}

function renderCrossref(done) {
  data.posts.forEach(post => {
    let publishedPath = path.join(paths.dest, post.distillPath);
    let crossrefXml = distill.generateCrossref(post);
    fs.writeFile(path.join(publishedPath, "crossref.xml"), crossrefXml, error => {
      if (error) done(error);
      done();
    });
  });
}

function renderArchive(done) {
  const concurrency = 4;
  let q = d3.queue(concurrency);
  data.posts.forEach(post => {
    let htmlPath = "docs/" + post.distillPath + "/index.html";
    let htmlWritePath = "docs/" + post.distillPath + "/index.archive.html";
    q.defer(render, htmlPath, htmlWritePath);
  });
  function render(htmlPath, htmlWritePath, cb) {
    let command = "./bin/inline " + htmlPath + " " + htmlWritePath;
    console.log("Rendering archive: " + command);
    exec(command, (error, stdout) => {
      if (error) throw error;
      cb();
    });
  }
  q.awaitAll(function(error) {
    if (error) throw error;
    done();
  });
}


//
// Cleanup the data after we've rendered all the posts.
//
gulp.task("afterPostData", function(done) {
  // Commentary
  let newPosts = [];
  data.posts.forEach(function(post) {
    let postJson = fs.readFileSync("build/data/" + post.distillPath + ".json", "utf8");
    let newPost = JSON.parse(postJson)
    newPost.publishedDate = new Date(newPost.publishedDate);
    newPost.updatedDate = new Date(newPost.updatedDate);
    newPosts.push(newPost);
  });
  data.posts = newPosts;
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
  fs.writeFileSync("build/afterPostData.json", JSON.stringify(data, null, 2));
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
        distillPath: file.relative.replace("index.html", ""),
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
  "copyThirdParty",
  "beforePostData",
  "posts",
  "afterPostData",
  "pages",
  "feeds"
))
