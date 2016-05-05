var portalLib   = require('/lib/xp/portal');
var contentLib  = require('/lib/xp/content');
var thymeleaf   = require('/lib/xp/thymeleaf');
var mailLib     = require('/lib/xp/mail');
var utilLibData = require('/lib/enonic/util/data');
var i18nLib     = require('/lib/xp/i18n');

exports.get = function(o) {
	return handleGet(o);
};

exports.post = function(o) {

	var request = o.request;
	var body = JSON.parse(request.body);

	if (body.ajax === true)
	{
		return handleAjax(o);
	}

	else
		return handlePost(o);
};

function handleGet(o) {

	var request = o.request;
	var selectedFormID = o.formId;
	
	// If no selected form ID, exit execution with undefined return
	if (!selectedFormID)
	{
		var msg = 'No form is selected.';
		log.warning(msg);
		var body = "<h3>" + msg + "</h3>";
		return {
			body: body,
	    	cotentType: 'text/html',
		};
	}
	
	var selectedComponent = contentLib.get({key: selectedFormID});
	var content           = portalLib.getContent();
	var config            = selectedComponent.data;
	var siteConfig        = portalLib.getSiteConfig();
	var formActionURL     = portalLib.componentUrl({component: selectedComponent.path});
	var language          = content.language;
	var inputFields       = utilLibData.forceArray(config.inputField);


	var formAttributes = {
		id: selectedFormID,
		action: formActionURL,
		inputFields: inputFields,
	};

	// Prepare phrases for status messages
	var customPhrases = siteConfig.phrases;
	var phrases = {
		sending: {
			title: customPhrases.sending.title ? customPhrases.sending.title : localize('messages.sending_title'),
			message: customPhrases.sending.message ? customPhrases.sending.message : localize('messages.sending_message'),
		},
		success: {
			title: customPhrases.success.title ? customPhrases.success.title : localize('messages.success_title'),
			message: customPhrases.success.message ? customPhrases.success.message : localize('messages.success_message'),
			status: 'success'
		},
		danger: {
			title: customPhrases.danger.title ? customPhrases.danger.title : localize('messages.danger_title'),
			message: customPhrases.danger.message ? customPhrases.danger.message : localize('messages.danger_message'),
			status: 'error'
		},
		warning: {
			title: customPhrases.warning.title ? customPhrases.warning.title : localize('messages.warning_title'),
			message: customPhrases.warning.message ? customPhrases.warning.message : localize('messages.warning_message'),
			status: 'warning',
		},
		button:
		{
			confirm: customPhrases.confirm ? customPhrases.confirm : localize('button.confirm'),
			submit: customPhrases.submit ? customPhrases.submit : localize('button.submit'),
		},
		required_field: {
			marker: customPhrases.required_field.marker ? customPhrases.required_field.marker : localize('required_field_marker'),
			note: customPhrases.required_field.note ? customPhrases.required_field.note : localize('required_field_note'),
		},
	};
	// Get form components for selected form
	var selectetFormContent = contentLib.get({key: selectedFormID});
	var formComponents = selectetFormContent.page.regions.main.components;

	// Render form with thymeleaf
	var model = {
		formAttributes: formAttributes,
		siteConfig: siteConfig,
		phrases: phrases,
		formComponents: formComponents,
		language: language,
		config: config,
	};
	var view = resolve('render-form.html');
	var body = thymeleaf.render(view, model);

	// Config webshim for use with bootstrap
	var webshimConfig = {
		iVal: {
			sel: '.ws-validate',
            handleBubble: 'hide', // hide error bubble
            //add bootstrap specific classes
            errorMessageClass: 'help-block',
            successWrapperClass: 'has-success',
            errorWrapperClass: 'has-error',
            //add config to find right wrapper
            fieldWrapper: '.form-group'
        }
    };

    var style                = '<link rel="stylesheet" href="' + assetUrl({path: '/css/style.css'}) + '">';
    var getFormDataJS        = '<script src="' + assetUrl({path: '/js/get-form-data.js'}) +'"></script>';
    var getFormDataInit      = '<script>var phrases = ' + JSON.stringify(phrases) + '; easyContactForm(phrases);</script>';
    var webshimJS            = '<script src="' + assetUrl({path: '/js-webshim/minified/polyfiller.js'}) + '"></script>';
    var webshimContributions = '<script>webshim.setOptions("forms", ' + JSON.stringify(webshimConfig) + '); webshim.polyfill("forms");</script>';

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
    		webshimContributions,
    		]
    	}
    };
}

function handlePost(o) {
	log.warning('Post data not supported.');
	return;
}

function handleAjax(o) {
	var request           = o.request;
	var selectedFormID    = o.formId;
	var component         = contentLib.get({key: selectedFormID});
	var config            = component.data;
	var body              = JSON.parse(request.body);
	var data              = body.data;	
	var responseTemplates = utilLibData.forceArray(config.response); // Get configured response-templates

	function processResponseFields(fieldObj){
		// Replace placeholders in all keys of response object, return processed object.
		var item, obj = {};
		for (var key in fieldObj) {
			item = fieldObj[key];
			obj[key] = replacePlaceholders(item, data);
		}
		return obj;
	}

	// Process all response-templates and send + sum up different statuses of sent mails.
	var mailStatus = [], status;
	var error = 0, success = 0, errorLocations = [];
	for (var i = 0, len = responseTemplates.length; i < len; i ++) {
		var item = processResponseFields(responseTemplates[i]);
		status = sendMail(item);
		mailStatus.push(status);
		if (status === false) // Count error/success
		{
			error += 1;
			errorLocations.push(i);
		}
		else
			success += 1;
	}
	// Prepare status message and return
	var ajaxStatus = {
		errorLocations: errorLocations,
		status: 'danger' // danger is default status
	};
	if (error === 0 && success > 0)
		ajaxStatus.status = 'success';
	else if (error > 0 && success > 0)
		ajaxStatus.status = 'warning';
	
	return {
		body: ajaxStatus,
		contentType: 'application/json'
	};
}

function sendMail( o ) {
	if ( o.subject && o.from && o.to && o.body ) // Subject, from, to and body must be present to send mail
		return mailLib.send({
			from: o.from,
			to: o.to,
			cc: o.cc,
			bcc: o.bcc,
			replyTo: o.replyTo,
			subject: o.subject,
			body: o.body,
		});
	else
		return false;
}

function localize(key) {
	return i18nLib.localize({key: key});
}

function replacePlaceholders(string, placeholderObj){

	var RegExpPart = "";
	var processedString = "";
	var key;
	
	// Construct part to Regular Expression from placeholder keys
	for (key in placeholderObj) {
		if (RegExpPart === "")
			RegExpPart += key;
		else
			RegExpPart += '|' + key;
	}
	
	var re = new RegExp("\\{{2}(" + RegExpPart + ")\\}{2}|([\\n\\r\\t\\0\\s\\S]{1,}?)", "gmi");
	
	// Split string with RegExp from keys in placeholderObj
	// then replace matches with value of placeholderObj and rebuild string.
	var match, matches = [];
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

function assetUrl(url){
	return portalLib.assetUrl(url);
}
