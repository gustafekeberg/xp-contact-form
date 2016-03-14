var portalLib = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var mailLib   = require('/lib/xp/mail');
var utilDataLib  = require('/lib/enonic/util/data');

function log( string ) {
	var util = require('/lib/enonic/util/util');
	util.log(string);
}

function assetUrl(url){
	return portalLib.assetUrl(url);
}

exports.get = function(request) {
	return handleGet(request);
};

exports.post = function(request) {

	var body = JSON.parse(request.body);

	if (body.ajax === true)
	{
		return handleAjax(request);
	}

	else
		return handlePost(request);
};

function handleGet(request) {

	var component       = portalLib.getComponent();
	var content         = portalLib.getContent();
	var config          = component.config;
	var placeholders    = {title: config.title};
	var processedString = "", documentation, view, body;
	var formAction      = portalLib.componentUrl({component: component.path});

	var ID = config.formId || "";

	var form = {
		ID: ID,
		action: formAction,
		inputFields: utilDataLib.forceArray(config.inputField)
	};

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
	var getFormDataInit = '<script>window.addEventListener("load", easyContactForm("#' + form.ID + '"));</script>';
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
	var config = portalLib.getComponent().config;
	var body = JSON.parse(request.body);
	var data = body.data;
	// var response = {
	// 	"receiver": config.templates.receiver.response,
	// 	"sender": config.templates.sender.response,
	// };
	var response = utilDataLib.forceArray(config.response);
	var mailStatus = [], status;

	function processResponseFields(fieldObj){
		// Replace placeholders in all keys of response object, return processed object.
		var item, obj = {};
		for (var key in fieldObj) {
			item = fieldObj[key];
			obj[key] = replacePlaceholders(item, data);
		}
		return obj;
	}

	for (var i = 0, len = response.length; i < len; i ++) {
		var item = processResponseFields(response[i]);
		log(item);
		status = sendMail(item);
		mailStatus.push(status);
	}

	return {
		body: mailStatus,
		contentType: 'application/json'
	};
}

function sendMail(mailObj) {
	if (mailObj.subject && mailObj.from && mailObj.to && mailObj.body)
		return mailLib.send({
			from: mailObj.from,
			to: mailObj.to,
			cc: mailObj.cc,
			bcc: mailObj.bcc,
			replyTo: mailObj.replyTo,
			subject: mailObj.subject,
			body: mailObj.body,
		});
	else
		return false;
}

function replacePlaceholders(string, placeholderObj){

	var rePart = "";
	var processedString = "";
	var key;
	
	// Pick placeholder keys to build rePart
	for (key in placeholderObj) {
		if (rePart === "")
			rePart += key;
		else
			rePart += '|' + key;
	}
	
	// Split string in placeholderObj keys or by character,
	// then replace placeholderObj and rebuild string.
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
			processedString += placeholderObj[key];
		}
		else if (matches[i][0])
			processedString += matches[i][0];
	}
	return processedString;
}
