var portalLib   = require('/lib/xp/portal');
var contentLib  = require('/lib/xp/content');
var renderForm = require('/lib/render-form');

exports.get = function(request) {
	var component = portalLib.getComponent();
	var config = component.config;
	var selectedFormID = config.selectedForm;
	var rendered_form = renderForm.get(request, selectedFormID);
	var title = config.title;
	
	if (title.display) // If we should display a heading for the form, find out what it should be
	{
		if (!title.text) // If no custom text is set, use displayName for form
		{
			var form = contentLib.get({key: selectedFormID});
			title.text = form.displayName;
		}

		// Render new view with form in section with heading
		var thymeleaf   = require('/lib/xp/thymeleaf');
		var model = {
			form_body: rendered_form.body,
			title: title,
		};
		var view = resolve('display-with-title.html');
		rendered_form.body = thymeleaf.render(view, model);
	}
	return rendered_form;
};

exports.post = function(request) {
	var component = portalLib.getComponent();
	var config = component.config;
	var selectedFormID = config.selectedForm;
	var rendered_form = renderForm.post(request, selectedFormID);
	return rendered_form;
};
