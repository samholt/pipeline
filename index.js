var fs = require("fs"),
	jsdom = require("jsdom").jsdom;

var markup = fs.readFileSync("index.html", "utf8");
var doc = jsdom(markup);