var inputField  = require('/lib/contact-form-setup-fields');

exports.get = function(request) {
	return inputField.field('custom-helper');
};

exports.post = function(request) {
};
