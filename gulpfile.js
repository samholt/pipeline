//
// Imports
//

// var webserver = require("gulp-webserver");
var gulp = require("gulp");
var del = require("del");
var rename = require("gulp-rename");
var through = require("through2");

let fs = require("fs"),
    path = require("path"),
    exec = require("child_process").execSync,
    mustache = require("mustache"),
    distill = require("./distill-template/dist/template.js"),
    inlineAssets = require("./bin/inline-assets"),
    analytics = require("./bin/analytics");

// d3
let d3 = Object.assign({},
    require("d3-time-format"),
    require("d3-collection")
);

let jsdom = require("jsdom").jsdom,
    serializeDocument = require("jsdom").serializeDocument;

let RFC = d3.timeFormat("%a, %d %b %Y %H:%M:%S %Z");

let data = {
  now: Date.now(),
  nowRFC: RFC(Date.now())
}

const paths = {
  dest: "docs/"
};

//
// Tasks
//

//
gulp.task("clean", function() { return del([paths.dest]); });

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

// Merge the journal.json data and the posts data
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
gulp.task("posts", gulp.series(addPostTasks));

function addPostTasks(done) {
  data.posts.forEach((post, i) => {
    console.log("Building post " + (i + 1) + " of " + data.posts.length + ": " + post.githubPath);
    let repoPath = path.join("posts", post.githubPath);
    exec("mkdir -p " + path.join(paths.dest, post.distillPath));

    // TODO: alert if we don't have a thumbnail?

    // Copy the contents of the repo's public folder to the new location.
    let publishedPath = path.join(paths.dest, post.distillPath);
    let originalPath = path.join(repoPath, "public/");
    try {
      exec("cp -r " + originalPath + " " + publishedPath);
    } catch (e) {
      console.error("No public folder for " + repoPath);
    }

    //Transform and rewrite all the html files that are direct children of public/
    fs.readdirSync(originalPath).forEach((f) => {
      if (path.extname(f) === ".html") {
        let htmlString = fs.readFileSync(path.join(originalPath, f), "utf8");
        var dom = jsdom(htmlString, {features: {ProcessExternalResources: false, FetchExternalResources: false}});
        distill.render(dom, post);
        distill.distillify(dom, post);
        let transformedHtml = serializeDocument(dom).replace("</body></html>", analytics + "</body></html>");
        fs.writeFileSync(path.join(publishedPath, f), transformedHtml, "utf8");
        // write out an archive page
        inlineAssets(dom, "img[src]", "src", publishedPath);
        inlineAssets(dom, 'link[rel="stylesheet"][href]', "href", publishedPath);
        inlineAssets(dom, "script[src]", "src", publishedPath);
        inlineAssets(dom, "video[src]", "src", publishedPath);
        inlineAssets(dom, "video > source[src]", "src", publishedPath);
        inlineAssets(dom, "audio[src]", "src", publishedPath);
        inlineAssets(dom, "audio > source[src]", "src", publishedPath);
        let archiveHtml = serializeDocument(dom)
        fs.writeFileSync(path.join(publishedPath, f.replace(".html", ".archive.html")), archiveHtml, "utf8");
      }
    });

    // Generate crossref
    let crossrefXml = distill.generateCrossref(post);
    fs.writeFileSync(path.join(publishedPath, "crossref.xml"), crossrefXml, "utf8");

  });
  done();
}

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
gulp.task("feeds", function(done) {
  fs.writeFileSync(paths.dest + "rss.xml", mustache.render(fs.readFileSync("pages/rss.xml", "utf8"), data));
  done();
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