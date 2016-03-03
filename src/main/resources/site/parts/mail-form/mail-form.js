var portal     = require('/lib/xp/portal');
var thymeleaf  = require('/lib/xp/thymeleaf');
var mail       = require('/lib/xp/mail');
var utilData       = require('/lib/enonic/util/data');

function log( string ) {
	var util = require('/lib/enonic/util/util');
	util.log(string);
}

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

exports.get = function(request) {

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
		model = {language: language};
		view = resolve("mail-form-doc.html");
		documentation = thymeleaf.render(view, model);
	}
	var model = {
		form: form,
		config: config,
		documentation: documentation
	};
	view = resolve("mail-form.html");
	body = thymeleaf.render(view, model);

	return {
		body: body,
		cotentType: 'text/html',
	};
};

exports.post = function(request) {

	var body = "<h1>Mail form - post</h1>";

	return {
		body: body,
		contentType: 'text/html'
	};
};
