const functions = require('firebase-functions');
const request = require('request');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.githubWebhook = functions.https.onRequest((req, resp) => {
  console.log("Handling a webhook from github.");

  const isPush = req.body.repository && req.body.commits
  if (isPush) {
    const repo = req.body.repository;
    console.log("We are seeing a push to '" + repo.name + "'.");

    const isPost = repo.name.startsWith('post--');
    const isToMaster = req.body.ref.endsWith('master');
    if ( isPost && isToMaster ) {
      console.log("Push is to a post & to master branch; triggering a build of pipeline.");

      // TODO: decide when to build staging instead
      const repositoryToBuild = encodeURIComponent("distill/pipeline");
      const options = {
        method: 'POST',
        json: true,
        body: {
          "request": {
            "branch":"master"
          }
        },
        url: "https://api.travis-ci.org/repo/" + repositoryToBuild + "/requests",
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
          console.log("Debug Info: " + error, travisResponse, body);
        }
      });

    } else {
      console.log("Push was not to a post; doing nothing.");
    }
  }

  resp.send("OK");
});
