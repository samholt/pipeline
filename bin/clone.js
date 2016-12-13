var fs = require("fs"),
    program = require("commander"),
    path = require('path'),
    exec = require('child_process').execSync;

program
    .version("0.0.1")
    .option("-p, --package [path]", "Path to [package.json]", "package.json")
    .parse(process.argv);

var pathToPackage = program.package;
var posts = JSON.parse(fs.readFileSync(pathToPackage, "utf8")).posts;

try {
  fs.mkdirSync("build");
} catch (e) {
  // build folder already exists
}

posts.forEach(function(post) {
  var repoPath = "build/" + post.githubRepo;
  try {
    // If repo already exists, just pull it
    fs.accessSync(repoPath, fs.F_OK);
    console.log("Pulling " + post.githubRepo);
    exec("git -C " + repoPath + " pull")
  } catch (e) {
    // Repo doesn't exist locally, so let's clone it
    exec("git clone --depth 1 " + "https://github.com/" + post.githubRepo + ".git" + " " + repoPath);
  }

});
