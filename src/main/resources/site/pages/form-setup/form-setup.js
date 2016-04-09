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
		// var language;
		// switch (content.language) {
		// 	case 'sv':
		// 	case 'sv-SE':
		// 	case 'no':
		// 	case 'nn-NO':
		// 	case 'no-NO':
		// 	language = 'en';
		// 	break;
		// 	default:
		// 	language = 'en';
		// }
		// model = { language: language };
		view = resolve("form-documentation.html");
		documentation = thymeleaf.render(view);
	}
	// log(content);
	var rendered_form;
	if (data.show_preview) {
		var renderForm = require('/lib/render-form');
		rendered_form = renderForm.get(req, content._id).body;
	}

	var mainRegion = content.page.regions.main;
	view = resolve('form-setup.html');
	model = {
		content: content,
		mainRegion: mainRegion,
		data: data,
		documentation: documentation,
		preview: rendered_form,
	};
	
	var body = thymeleaf.render(view, model);
	var builder_style = '<link rel="stylesheet" href="' + assetUrl({path: '/css/form-builder-style.css'}) + '">';
	var style = '<link rel="stylesheet" href="' + assetUrl({path: '/css/style.css'}) + '">';
	return {
		body: body,
		contentType: 'text/html',
		pageContributions: {
				"headEnd": [
				style,
				builder_style
				],
			}
	};
};

// Handles a POST request
exports.post = function(req) {};

function assetUrl(url){
	return portalLib.assetUrl(url);
}
