var portalLib   = require('/lib/xp/portal');
var renderForm = require('/lib/render-form');

function log( string ) {
	var util = require('/lib/enonic/util/util');
	util.log(string);
}

exports.get = function(request) {
	var component = portalLib.getComponent();
	var selectedForm = component.config.selectedForm;
	var rendered_form = renderForm.get(request, selectedForm);
	return rendered_form;
};

exports.post = function(request) {
	var component = portalLib.getComponent();
	var selectedForm = component.config.selectedForm;
	return displayForm.post(request, selectedForm);
};

