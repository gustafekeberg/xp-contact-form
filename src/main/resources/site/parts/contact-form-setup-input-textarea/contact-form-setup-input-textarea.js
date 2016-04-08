var inputField  = require('/lib/contact-form-setup-fields');

exports.get = function(request) {
	return inputField.field('input-textarea');
};

exports.post = function(request) {
};
