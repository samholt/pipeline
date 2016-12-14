"use strict";

module.exports = function preprocess_data(data){
  set_volume_issue(data);
  handle_dois(data);
}

function set_volume_issue(data){
  var date = new Date(data.firstPublished);
  data.volume = date.getFullYear()-2015;
  data.issue = date.getMonth();
}

function handle_dois(data) {
  var dois = [];
  data.journal.posts.forEach(post => {
    var name = post.publishPath.split("/")[1];
    if (post.doi_suffix != undefined){
      // Is the DOI a duplicate?
      if (dois.indexOf(post.doi_suffix) != -1)
        throw Error("Duplicate DOI suffix: " + post.doi_suffix);
      dois.push(post.doi_suffix);
      // Save DOI if for this post
      if (name == data.name)
        data.doi = data.journal.doi + "." + ("0000" + post.doi_suffix).slice(-5);
    }
  });
}
