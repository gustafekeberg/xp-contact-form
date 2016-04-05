var portalLib   = require('/lib/xp/portal');
var thymeleaf   = require('/lib/xp/thymeleaf');
// var contentLib  = require('/lib/xp/content');
// var mailLib     = require('/lib/xp/mail');
// var utilDataLib = require('/lib/enonic/util/data');
// var i18nLib     = require('/lib/xp/i18n');

exports.field = function(type){
	var component = portalLib.getComponent();
	var config = component.config;
	// var form = portalLib.getContent();
	// var formData = form.data;
	// var id = formData.id;
	// if (!id) formData.id = form._id;
	var model = {
		config: config,
		input_type: type,
	};
	var view = resolve("contact-form-setup-fields.html");
	var body = thymeleaf.render(view, model);
	var style = '<link rel="stylesheet" href="' + assetUrl({path: '/css/form-builder-style.css'}) + '">';
	return {
		body: body,
		contentType: 'text/html',
		"pageContributions": {
			"headEnd": [
			style
			],
		}
	};
};
// function handlePost(request) {

// }


// function localize(key) {
// 	return i18nLib.localize({key: key});
// }

// function log( string ) {
// 	var util = require('/lib/enonic/util/util');
// 	util.log(string);
// }

function assetUrl(url){
	return portalLib.assetUrl(url);
}
