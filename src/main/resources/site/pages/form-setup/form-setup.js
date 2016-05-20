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
		view = resolve("form-documentation.html");
		documentation = thymeleaf.render(view);
	}

	var render_form_preview;
	if (data.show_preview) {
		var renderForm = require('/lib/render-form');
		try {
			render_form_preview = renderForm.get({request: req, formId: content._id}).body;
		}
		catch (error) {
			render_form_preview = "<p>" + error + "</p>";
		}
	}

	var mainRegion = content.page.regions.main;
	view = resolve('form-setup.html');
	model = {
		content: content,
		mainRegion: mainRegion,
		data: data,
		documentation: documentation,
		preview: render_form_preview,
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
