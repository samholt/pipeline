const functions = require('firebase-functions');
const request = require('request');

function requestBuild(repo) {
  const repositoryToBuild = encodeURIComponent(repo);
  const url =  "https://api.travis-ci.org/repo/" + repositoryToBuild + "/requests";
  const options = {
    method: 'POST',
    json: true,
    body: {
      "request": {
        "branch":"master"
      }
    },
    url: url,
    headers: {
      'User-Agent': 'request',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Travis-API-Version': "3",
      'Authorization': "token " + functions.config().travis.token
    }
  };
  request(options, (error, travisResponse, body) => {
    const accepted = 202;
    if (travisResponse.statusCode == accepted){
      console.log("Triggered build successfully.");
    } else {
      console.log("Triggering build failed!");
      console.log("Status Code: " + travisResponse.statusCode);
      console.log("Debug Info: " + error, body);
    }
  });
}

exports.githubWebhook = functions.https.onRequest((req, resp) => {
  console.log("Handling a webhook from github.");

  const isPush = req.body.repository && req.body.commits;
  const isRelease = req.body.action && req.body.action == "published";
  
  if (isPush) {
    const repo = req.body.repository;
    console.log("We are seeing a push to '" + repo.name + "'.");

    const isPost = repo.name.startsWith('post--');
    const isPublic = !repo.private;
    const isToMaster = req.body.ref.endsWith('master');
    if ( isPost && isToMaster && isPublic ) {
      console.log("Push is to master branch of a public post repo; triggering a build of /pipeline.");
      // TODO: decide when to build staging instead
      requestBuild("distillpub/pipeline");
    } else {
      console.log("Push was not to master branch of a public post repo; doing nothing.");
    }
  }
  
  if (isRelease) {
    const repo = req.body.repository;
    console.log("We are seeing a release on '" + repo.name + "'.");
    
    const isOnTemplate = repo.name = "template";
    if (isOnTemplate) {
      console.log("Release was on template; triggering a build of /pipeline to deploy that new version on the distill website.");
      requestBuild("distillpub/pipeline");
    } else {
      console.log("Release was not on a repo we care about; doing nothing.");
    }
  }

  resp.send("OK");
});


exports.githubDraftsWebhook = functions.https.onRequest((req, resp) => {
  console.log("Handling a drafts webhook from github.");
  const isPush = req.body.repository && req.body.commits;
  if (isPush) {
    const repo = req.body.repository;
    console.log("We are seeing a push to '" + repo.name + "'. Requesting drafts rebuild.");
    requestBuild("distillpub/drafts");
  }
  resp.send("OK");
});
