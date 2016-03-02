var portal     = require('/lib/xp/portal');
var thymeleaf  = require('/lib/xp/thymeleaf');
var util       = require('/lib/enonic/util/util');
var data       = require('/lib/enonic/util/data');
var mail       = require('/lib/xp/mail');

function findRecipient (listOfRecipients, which) {
	// which = 'default' or 'selected'
	var recipientID;
	if (!listOfRecipients) return;

	// Search for default recipient, choose first occurrence
	for ( var i = 0; i < listOfRecipients.length; i++ )
	{
		// If a default recipient exists set variable true
		if ( listOfRecipients[i][which] === true )
		{
			recipientID = i;
			break;
		}
	}
	return recipientID;
}

exports.get = function(request) {

	var component         = portal.getComponent();
	var config            = component.config;
	var recipients        = config.recipients;
	var selectedRecipient = findRecipient(recipients, 'selected');
	var componentUrl      = portal.componentUrl({'component': component.path });

	var content   = portal.getContent();
	// var url = portal.componentUrl({
	// 	component: 'main/0'
	// });

	var form = {
		action: componentUrl,
		method: 'post'
	};

	var model = {
		form: form,
		config: config,
		selectedRecipient: selectedRecipient
	};

	var view = resolve('mail-form.html');
	var body = thymeleaf.render(view, model);

	// Page contributions
	var jQuery         = '<script src="//code.jquery.com/jquery-1.11.3.min.js"></script>';
	var jQueryMigrate  = '<script src="//code.jquery.com/jquery-migrate-1.2.1.min.js"></script>';
	
	var assetsUrl      = portal.assetUrl({path: '/'});
	var stylesheet = '<link href="' + assetsUrl + '/stylesheets/mail-form.css" rel="stylesheet" />';

	return {
		body: body,
		cotentType: 'text/html',
		"pageContributions": {
			"headEnd": [
			jQuery, jQueryMigrate, stylesheet
			]
		}
	};
};

exports.post = function(request) {

	util.log(request);


	var component = portal.getComponent();
	var config    = component.config;

	var recipients = config.recipients;
	var defaultRecipient = findRecipient(recipients, 'default');

	var p = request.params;
	var mailRecipient, copyMessage, statusMessage;
	
	// Check for selected recipient,
	// if it's undefined use default recipient,
	// if no default recipient is choosen use mail-form default value	
	if (!p.recipients)
		mailRecipient = config.recipients[defaultRecipient];
	else
		mailRecipient = config.recipients[p.recipients];

	// Send message to selected receiver
	var sendFrom = mailRecipient.name + '<' + mailRecipient.from + '>';

	var sendResultHtml = mail.send({
		from: sendFrom,
		replyTo: p.email,
		to: mailRecipient.mail,
		subject: mailRecipient.subject,
		body: p.message,
		contentType: 'text/html; charset="UTF-8"'
	});

	// Send copy to sender / auto-reply
	var autoReply = config.autoReply;
	if (autoReply.sendCopy)
	{
		if (!autoReply.message) autoReply.message = 'Thank you for sending a message to us, we will reply as soon as possible.';
		if (!autoReply.copyMessage) autoReply.copyMessage = 'Below is a copy of your message';

		copyMessage = autoReply.message + '<br/><br/>';
		var copyMessageDivider = autoReply.copyMessage + '<br/>---<br/><br/>';
		copyMessage += copyMessageDivider + '<em>' + p.message + '</em>';
		
		var sendResultHtmlCopy = mail.send({
			from: sendFrom,
			to: p.email,
			subject: mailRecipient.subject,
			body: copyMessage,
			contentType: 'text/html; charset="UTF-8"'		
		});
	}

	var sendStatus = sendResultHtml;

	if (sendStatus === true) 
	{
		statusMessage = {
			text: 'Your message was sent.',
			srText: 'Success!',
			cssClass: 'success',
		};
	}
	else 
	{
		statusMessage = {
			text: 'Your message could not be sent.',
			srText: 'Error!',
			cssClass: 'danger',
		};
	}

	// Return depends on mode (ajax/html)

	if (p.ajaxpost) {

		body = {
			sendStatus: sendStatus,
			statusMessage: statusMessage
		};

		return {
			body: body,
			contentType: 'application/json'
		};
	}

	else {

	var body = statusMessage;

		return {
			body: body,
			contentType: 'text/html'
		};
	}
};
