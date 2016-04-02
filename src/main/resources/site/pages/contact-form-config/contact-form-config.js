var thymeleaf = require('/lib/xp/thymeleaf');
var portalLib   = require('/lib/xp/portal');
var utilDataLib = require('/lib/enonic/util/data');

function log( string ) {
	var util = require('/lib/enonic/util/util');
	util.log(string);
}

// Handles a GET request
exports.get = function(req) {

	var content = portalLib.getContent();
	var regions = content.page.regions;
	for (var key in regions) {
		var current = regions[key];
		var components = current.components;
		for (var i = 0, len = components.length; i < len; i ++ ) {
			var item = components[i];
			// log(item.name);
		}
	}
	
	var mainRegion = content.page.regions.main;
	// log("mainRegion");
	var view = resolve('contact-form-config.html');
	var model = {mainRegion: mainRegion};
	var body = thymeleaf.render(view, model);

	return {
		body: body,
		contentType: 'text/html',
	};
};

// Handles a POST request
exports.post = function(req) {};
