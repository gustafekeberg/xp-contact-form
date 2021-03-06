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
	var data = content.data;
	var regions = content.page.regions;	
	var documentation, model, view;

	if (data.show_help) {
		// Set language for documentation depending on selected language for content.
		var language;
		switch (content.language) {
			case 'sv':
			case 'sv-SE':
			case 'no':
			case 'nn-NO':
			case 'no-NO':
			language = 'en';
			break;
			default:
			language = 'en';
		}
		model = { language: language };
		view = resolve("contact-form-documentation.html");
		documentation = thymeleaf.render(view, model);
	}
	// log(content);
	var preview;
	if (data.show_preview) {
		var displayForm = require('/lib/contact-form-display');
		preview = displayForm.get(req, content._id).body;
	}

	var mainRegion = content.page.regions.main;
	view = resolve('contact-form-setup.html');
	model = {
		content: content,
		mainRegion: mainRegion,
		data: data,
		documentation: documentation,
		preview: preview,
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
