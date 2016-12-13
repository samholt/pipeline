
"use strict";

var fs = require("fs"),
    jsdom = require("jsdom").jsdom,
    serializeDocument = require("jsdom").serializeDocument,
    beautify = require("js-beautify").html,
    preprocess_data = require("./preprocess_data.js");

var transforms = [
	require("./transforms/meta.js"),
	require("./transforms/analytics.js")
];

var JSON_load = path =>  JSON.parse(fs.readFileSync(path, "utf8"));
var DOM_load = path => jsdom(fs.readFileSync(path, "utf8"),
  {features: {ProcessExternalResources: false, FetchExternalResources: false}});


var dom = DOM_load("data/index.html")
var full_data = JSON_load("data/package.json");
var data = full_data.distill;
data.name = full_data.name;
data.journal = JSON_load("data/distill.json");
preprocess_data(data)

transforms.forEach((fn) => {
	fn.call(this, dom, data);
});

process.stdout.write(beautify(serializeDocument(dom), {
  indent_size: 2,
  wrap_line_length: 0,
  preserve_newlines: false,
  unformatted: ["code", "pre", "span", "d-cite"]
}));
