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




process(doc, {});

console.log(doc.documentElement.innerHTML);

function process(doc, data) {

}


if(typeof exports !== 'undefined') {
	if(typeof module !== 'undefined' && module.exports) {
	  exports = module.exports = mymodule;
	}
	exports.mymodule = mymodule
} 
else {
	root.mymodule = mymodule
}