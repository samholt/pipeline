var fs = require("fs"),
	jsdom = require("jsdom").jsdom;

var metaTags = require("./processMetaTags.js");

var transforms = [metaTags];

var markup = fs.readFileSync("data/index.html", "utf8");
var dom = jsdom(markup);
var data = [];

// Send the DOM through each transform
transforms.forEach(function(fn) {
	fn.call(this, dom, data);
});

// Log the transformed html
console.log(dom.documentElement.innerHTML);