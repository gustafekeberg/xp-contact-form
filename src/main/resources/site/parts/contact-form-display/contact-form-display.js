var portalLib   = require('/lib/xp/portal');
var displayForm = require('/lib/contact-form-display');

function log( string ) {
	var util = require('/lib/enonic/util/util');
	util.log(string);
}

exports.get = function(request) {
	var component = portalLib.getComponent();
	var selectedForm = component.config.selectedForm;
	return displayForm.get(request, selectedForm);
};

exports.post = function(request) {
	var component = portalLib.getComponent();
	var selectedForm = component.config.selectedForm;
	return displayForm.post(request, selectedForm);
};

