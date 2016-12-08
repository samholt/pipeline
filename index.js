
"use strict";

var fs = require("fs"),
    jsdom = require("jsdom").jsdom,
    serializeDocument = require("jsdom").serializeDocument,
    beautify = require("js-beautify").html;

var transforms = [
	require("./transforms/meta.js"),
	require("./transforms/analytics.js")
];

var markup = fs.readFileSync("data/index.html", "utf8");
var dom = jsdom(markup, {features: {ProcessExternalResources: false, FetchExternalResources: false}});
var data = JSON.parse(fs.readFileSync("data/package.json", "utf8"));

transforms.forEach((fn) => {
	fn.call(this, dom, data);
});

process.stdout.write(beautify(serializeDocument(dom), {
  indent_size: 2, 
  wrap_line_length: 0, 
  preserve_newlines: false, 
  unformatted: ["code", "pre", "span", "d-cite"]
}));
