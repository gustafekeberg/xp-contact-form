var portal     = require('/lib/xp/portal');
var thymeleaf  = require('/lib/xp/thymeleaf');
var mail       = require('/lib/xp/mail');
var utilData       = require('/lib/enonic/util/data');

function log( string ) {
	var util = require('/lib/enonic/util/util');
	util.log(string);
}

exports.get = function(request) {
	return handleGet(request);
};

exports.post = function(request) {

	var body = JSON.parse(request.body);
	log(body);

	if (body.ajax === true)
	{
		return handleAjax(request);
	}

	else
		return handlePost(request);
};

function replacePlaceholder(string, placeholders){

	var rePart = "";
	var processedString = "";
	var key;
	
	// Pick placeholder keys to build rePart
	for (key in placeholders) {
		if (rePart === "")
			rePart += key;
		else
			rePart += '|' + key;
	}
	
	// Split string in placeholders keys or by character,
	// then replace placeholders and rebuild string.
	var re = new RegExp("\\{{2}(" + rePart + ")\\}{2}|([\\n\\r\\t\\0\\s\\S]{1,}?)", "gmi");
	var match;
	var matches = [];
	
	while ((match = re.exec(string)) !== null) {
		matches.push(match);
	}
	for (var i = 0, len = matches.length; i < len; i ++){
		if (matches[i][1] !== undefined)
		{
			key = matches[i][1];
			processedString += placeholders[key];
		}
		else if (matches[i][0])
			processedString += matches[i][0];
	}
	return processedString;
}

function assetUrl(url){
	return portal.assetUrl(url);
}

function handleGet(request) {

	var component   = portal.getComponent();
	var content = portal.getContent();
	var config = component.config;
	var placeholders = {title: config.title};
	var processedString = "", documentation, view, body;
	var formAction = portal.componentUrl({component: component.path});

	// if (config.textArea !== undefined)
	// 	processedString = replacePlaceholder(config.textArea, placeholders);

	var ID = config.formId || "";

	var form = {
		ID: ID,
		action: formAction,
		customFields: utilData.forceArray(config.customField)
	};
	// log(form);

	if (config.showDoc === true && request.mode == 'edit') {

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
		view = resolve("mail-form-documentation.html");
		documentation = thymeleaf.render(view, model);
	}
	var model = {
		form: form,
		config: config,
		documentation: documentation,
		message: config.message,
		sender: config.sender,
	};
	view                = resolve("mail-form.html");
	body                = thymeleaf.render(view, model);
	var style           = '<link rel="stylesheet" href="' + assetUrl({path: '/css/style.css'}) + '">';
	var getFormDataJS   = '<script src="' + assetUrl({path: '/js/get-form-data.js'}) +'"></script>';
	var getFormDataInit = '<script>window.addEventListener("load", contactFormInit("#' + form.ID + '"));</script>';
	var webshimJS       = '<script src="' + assetUrl({path: '/js-webshim/minified/polyfiller.js'}) + '"></script>';
	var webshimInit     = "<script>webshim.polyfill('forms');</script>";
	return {
		body: body,
		cotentType: 'text/html',
		"pageContributions": {
			"headEnd": [
			style
			],
			"bodyEnd": [
			getFormDataJS,
			getFormDataInit,
			webshimJS,
			webshimInit
			]
		}
	};
}
function handlePost(request) {
	var body = "<h1>Mail form - POST - no AJAX</h1>";

	return {
		body: body,
		contentType: 'text/html'
	};
}

function handleAjax(request) {
	var jsonObj = {
		msg: "Ajax req success"
	};
	jsonObj = JSON.parse(request.body);
	return {
		body: jsonObj.data,
		contentType: 'application/json'
	};
}
