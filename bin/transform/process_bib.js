var fs = require("fs"),
	jsdom = require("jsdom").jsdom,
  bibtexParse = require('bibtex-parse-js');

  /*var fetch = require('node-fetch'),
      uris = require("querystring").stringify;
  console.log("http://search.labs.crossref.org/dois?" + uris({q: "Olah Concrete Problems in AI safety"}))
  fetch("http://search.labs.crossref.org/dois?" + uris({q: "+Risk +Automation"}) )
    .then(resp => resp.text())
    .then(body => console.log(body))*/

var markup = fs.readFileSync("data/index.html", "utf8");
var doc = jsdom(markup);

var raw_bib = fs.readFileSync("data/test.bib", "utf8");
var bib = {};
bibtexParse.toJSON(raw_bib).forEach(e => {
  bib[e.citationKey] = e.entryTags;
  bib[e.citationKey].type = e.entryType;
});


process(doc, {});

console.log(doc.documentElement.innerHTML);

function inline_cite(key){
  if (key in bib){
    var ent = bib[key];
    var names = ent.author.split(" and ");
    names = names.map(name => name.split(",")[0].trim())
    var year = ent.year;
    if (names.length == 1) return names[0] + ", " + year;
    if (names.length == 2) return names[0] + " & " + names[1] + ", " + year;
    if (names.length  > 2) return names[0] + ", et al., " + year;
  } else {
    return "?";
  }
}

function bibliography_cite(key){
  if (key in bib){
    var ent = bib[key];
    var names = ent.author.split(" and ");
    var cite = "";
    name_strings = names.map(name => {
      var last = name.split(",")[0].trim();
      var firsts = name.split(",")[1];
      if (firsts != undefined) {
        var initials = firsts.trim().split(" ").map(s => s.trim()[0]);
        return last + ", " + initials.join(".")+".";
      }
      return last;
    });
    if (names.length > 1) {
      cite += name_strings.slice(0, names.length-1).join(", ");
      cite += " and " + name_strings[names.length-1];
    } else {
      cite += name_strings[0]
    }
    cite += ", " + ent.year + ". "
    cite += ent.title + ". "
    cite += (ent.journal || ent.booktitle || "")
    if ("volume" in ent){
      var issue = ent.issue || ent.number;
      issue = (issue != undefined)? "("+issue+")" : "";
      cite += ", Vol " + ent.volume + issue;
    }
    if ("pages" in ent){
      cite += ", pp. " + ent.pages
    }
    cite += ". "
    return cite
  } else {
    return "?";
  }
}

function process(doc, data) {

  // Handle cite tags!
  var cite_tags = doc.defaultView.document.getElementsByTagName("d-cite");
  cite_tags = Object.keys(cite_tags).map(i => cite_tags[i]);
  data.citations = data.citations || [];
  cite_tags.forEach(cite_tag => {
    var keys = cite_tag.innerHTML.split(",");
    keys.forEach(key => data.citations.push(key) );
    var cite_string = keys.map(inline_cite).join(", ");
    cite_tag.innerHTML = cite_string;
  })


  var bibliography = doc.defaultView.document.getElementsByTagName("d-bibliography")[0];
  bibliography_string = "\n";
  data.citations.sort().forEach(key => bibliography_string += bibliography_cite(key) + "\n")
  bibliography.innerHTML = bibliography_string;
}
