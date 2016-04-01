var portalLib   = require('/lib/xp/portal');
var contentLib  = require('/lib/xp/content');
var thymeleaf   = require('/lib/xp/thymeleaf');
var mailLib     = require('/lib/xp/mail');
var utilDataLib = require('/lib/enonic/util/data');
var i18nLib     = require('/lib/xp/i18n');

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
	// var component       = portalLib.getComponent();
	var selectedForm = portalLib.getComponent().config.selectedForm;
	if (!selectedForm)
		selectedForm = portalLib.getContent()._id;
	var component = contentLib.get({key: selectedForm});
	component.config = component.data;
	var content         = portalLib.getContent();
	var config          = component.config;
	var siteConfig      = portalLib.getSiteConfig();
	var placeholders    = {title: config.title};
	var processedString = "", documentation, view, body, model;
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
	var fieldsetClass = "col-sm-6";
	if (config.layout == '3') fieldsetClass = "col-md-4";

	var customPhrases = siteConfig.phrases;
	var phrases = {
		sending: {
			title: customPhrases.sending.title ? customPhrases.sending.title : localize('sending_title'),
			message: customPhrases.sending.message ? customPhrases.sending.message : localize('sending_message'),
		},
		success: {
			title: customPhrases.success.title ? customPhrases.success.title : localize('success_title'),
			message: customPhrases.success.message ? customPhrases.success.message : localize('success_message'),
			status: 'success'
		},
		danger: {
			title: customPhrases.danger.title ? customPhrases.danger.title : localize('danger_title'),
			message: customPhrases.danger.message ? customPhrases.danger.message : localize('danger_message'),
			status: 'error'
		},
		warning: {
			title: customPhrases.warning.title ? customPhrases.warning.title : localize('warning_title'),
			message: customPhrases.warning.message ? customPhrases.warning.message : localize('warning_message'),
			status: 'warning',
		},
		confirm: customPhrases.confirm ? customPhrases.confirm : localize('confirm'),
		submit: customPhrases.submit ? customPhrases.submit : localize('submit'),
		required_field: {
			marker: customPhrases.required_field.marker ? customPhrases.required_field.marker : localize('required_field_marker'),
			note: customPhrases.required_field.note ? customPhrases.required_field.note : localize('required_field_note'),
		},
	};
	model = {
		form: form,
		config: config,
		documentation: documentation,
		message: config.message,
		sender: config.sender,
		fieldsetClass: fieldsetClass,
		siteConfig: siteConfig,
		phrases: phrases,
	};
	view                = resolve("mail-form.html");
	body                = thymeleaf.render(view, model);

	var style           = '<link rel="stylesheet" href="' + assetUrl({path: '/css/style.css'}) + '">';
	var getFormDataJS   = '<script src="' + assetUrl({path: '/js/get-form-data.js'}) +'"></script>';
	// var getFormDataInit = '<script>var phrases = ' + JSON.stringify(phrases) + '; window.addEventListener("load", easyContactForm(phrases));</script>';
	var getFormDataInit = '<script>var phrases = ' + JSON.stringify(phrases) + '; easyContactForm(phrases);</script>';
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
	var body = "<h1>Mail form - POST - no AJAX - no message sent</h1>";

	return {
		body: body,
		contentType: 'text/html'
	};
}

function handleAjax(request) {
	var selectedForm = portalLib.getComponent().config.selectedForm;
	var component = contentLib.get({key: selectedForm});
	// component.config = component.data;
	// log(component);
	// var content         = portalLib.getContent();
	var config          = component.data;

	// var config = portalLib.getComponent().config;
	var body = JSON.parse(request.body);
	var data = body.data;

	var response = utilDataLib.forceArray(config.response);

	function processResponseFields(fieldObj){
		// Replace placeholders in all keys of response object, return processed object.
		var item, obj = {};
		for (var key in fieldObj) {
			item = fieldObj[key];
			obj[key] = replacePlaceholders(item, data);
		}
		return obj;
	}

	// Process all response-templates and send, sum up different statuses of sent mails.
	var mailStatus = [], status;
	var error = 0, success = 0, errorLocations = [];
	for (var i = 0, len = response.length; i < len; i ++) {
		var item = processResponseFields(response[i]);
		// log(item);
		status = sendMail(item);
		mailStatus.push(status);
		if (status === false)
		{
			error += 1;
			errorLocations.push(i);
		}
		else
			success += 1;
	}
	// Prepare status message and return
	var statusMessage = {
		errorLocations: errorLocations,
		status: 'danger'
	};
	if (error === 0 && success > 0)
		statusMessage.status = 'success';
	else if (error > 0 && success > 0)
		statusMessage.status = 'warning';
	
	return {
		body: statusMessage,
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

function localize(key) {
	return i18nLib.localize({key: key});
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
