var portalLib   = require('/lib/xp/portal');
var thymeleaf   = require('/lib/xp/thymeleaf');

exports.field = function(type){
	var component = portalLib.getComponent();
	var config = component.config;
	var model = {
		config: config,
		input_type: type,
	};
	var view = resolve('setup-fields.html');
	var body = thymeleaf.render(view, model);
	return {
		body: body,
		contentType: 'text/html',
	};
};
