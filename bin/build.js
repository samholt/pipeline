var fs = require("fs"),
    path = require("path"),
    exec = require("child_process").execSync,
    transformHtml = require("./transform/index.js"),
    mergePackageData = require("./transform/merge-package-data.js"),
    generateRss = require("./generate/rss.js");
    // generateCrossref = require("./generate/crossref.js");

let data = JSON.parse(fs.readFileSync("data.json", "utf8"));
let posts = data.posts;

// create build folder if it doesn't already exist
try { fs.mkdirSync("build"); } catch (e) { }

// create docs folder if it doesn't already exist
try { fs.mkdirSync("docs"); } catch (e) { }

posts
  .forEach((post, i) => {
    console.log("Building post #" + i + ": " + post.githubRepo);
    var repoPath = "build/" + post.githubRepo;
    exec("mkdir -p " + path.join("docs", post.publishPath));

    // TODO: what if we don't have a thumbnail?

    // Copy the contents of the repo's public folder to the new location.
    let publishedPath = path.join("docs", post.publishPath)
    try {
      exec("cp -r " + path.join(repoPath, "public/") + " " + publishedPath);
    } catch (e) {
      console.error("No public folder for " + repoPath);
    }

    // Load up the package.json for the post and process the post data
    try {
      var postPackageData = JSON.parse(fs.readFileSync(path.join(repoPath, "package.json"), "utf8"));
      mergedPostData = mergePackageData(post, postPackageData);
    } catch(e) {
      console.error("No package.json file found for " + repoPath);
    }

    //Transform and rewrite all the html files that are direct children of public/
    fs.readdirSync(publishedPath).forEach((f) => {
      if (path.extname(f) === ".html") {
        let transformedHtml = transformHtml(fs.readFileSync(path.join(publishedPath, f), "utf8"), mergedPostData)
        fs.writeFileSync(path.join(publishedPath, f), transformedHtml, "utf8");
      }
    });

    // Generate crossref
    // let crossrefXml = generateCrossref(index.html, post.distillData)
    // fs.writeFileSync(path.join(publishedPath, "crossref.xml"), crossrefXml, "utf8");

  });

fs.writeFileSync("docs/rss.xml", generateRss(posts.filter((d) => !d["no-homepage"])), "utf8");
exec("cp favicon.png docs/");
exec("cp CNAME docs/");

// TODO transform and render index.html
// posts.filter((d) => !d["no-homepage"])
