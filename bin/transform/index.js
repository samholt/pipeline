var fs = require("fs"),
    jsdom = require("jsdom").jsdom,
    serializeDocument = require("jsdom").serializeDocument,
    beautify = require("js-beautify").html;

var transforms = [
	require("./meta.js"),
	require("./analytics.js")
];

module.exports = (htmlString, packageData) => {
  var dom = jsdom(htmlString, {features: {ProcessExternalResources: false, FetchExternalResources: false}});
  transforms.forEach((fn) => {
    fn.call(this, dom, packageData);
  });
  return beautify(serializeDocument(dom), {
    indent_size: 2,
    wrap_line_length: 0,
    preserve_newlines: false,
    unformatted: ["code", "pre", "span", "d-cite"]
  });
}
