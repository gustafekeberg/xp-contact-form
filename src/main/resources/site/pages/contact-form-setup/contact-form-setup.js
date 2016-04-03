var thymeleaf = require('/lib/xp/thymeleaf');
var portalLib   = require('/lib/xp/portal');

function log( string ) {
	var util = require('/lib/enonic/util/util');
	util.log(string);
}

function assetUrl(url){
	return portalLib.assetUrl(url);
}

// Handles a GET request
exports.get = function(req) {

	var content = portalLib.getContent();
	var regions = content.page.regions;	

	var mainRegion = content.page.regions.main;
	var view = resolve('contact-form-setup.html');
	var model = {
		content: content,
		mainRegion: mainRegion
	};
	
	var body = thymeleaf.render(view, model);
	var style           = '<link rel="stylesheet" href="' + assetUrl({path: '/css/style.css'}) + '">';	
	return {
		body: body,
		contentType: 'text/html',
		pageContributions: {
				"headEnd": [
				style
				],
			}
	};
};

// Handles a POST request
exports.post = function(req) {};
