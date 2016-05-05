var portalLib   = require('/lib/xp/portal');
var contentLib  = require('/lib/xp/content');
var renderForm = require('/lib/render-form');
var thymeleaf   = require('/lib/xp/thymeleaf');

exports.get = function(request) {
	var component = portalLib.getComponent();
	var config = component.config;
	var selectedFormID = config.selectedForm;
	var rendered_form = renderForm.get({request: request, formId: selectedFormID});
	var title = config.title;
	var title_display = title.display;
	var title_text = title.text;
	var title_heading = title.heading_level;
	var container_id = config.container_id;
	
	if (!title_text && title_display) // If title should be displayed and no custom text is set, use displayName for form
	{
		var form = contentLib.get({key: selectedFormID});
		title_text = form.displayName;
	}		

	// Render new view with form inside section element with optional heading and/or title
	var model = {
		form_body: rendered_form.body,
		title_text: title_text,
		title_heading: title_heading,
		container_id: container_id,
	};
	var view = resolve('display-with-title.html');
	rendered_form.body = thymeleaf.render(view, model);

	return rendered_form;
};

exports.post = function(request) {
	var component = portalLib.getComponent();
	var config = component.config;
	var selectedFormID = config.selectedForm;
	var rendered_form = renderForm.post({request: request, formId: selectedFormID});
	return rendered_form;
};
