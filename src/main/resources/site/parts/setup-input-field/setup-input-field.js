var inputField  = require('/lib/setup-fields');

exports.get = function(request) {
	return inputField.field('input-field');
};

exports.post = function(request) {
};
