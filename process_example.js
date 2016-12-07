var fs = require("fs"),
	jsdom = require("jsdom").jsdom;

var markup = fs.readFileSync("data/index.html", "utf8");
var doc = jsdom(markup);

process(doc, {});

console.log(doc.documentElement.innerHTML);

function process(doc, data) {

}
