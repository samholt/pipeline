"use strict";

(function() {
	if(typeof require !== "undefined") {
		var fs = require("fs"),
				jsdom = require("jsdom").jsdom;
	}

	var sample = function(doc, data) {

	}

	if(typeof module !== "undefined" && module.exports ) {
    module.exports = sample;
  }


})();



var markup = fs.readFileSync("data/index.html", "utf8");
var doc = jsdom(markup);

process(doc, {});

console.log(doc.documentElement.innerHTML);

function process(doc, data) {

}

