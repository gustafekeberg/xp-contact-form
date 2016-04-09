var inputField  = require('/lib/setup-fields');

exports.get = function(request) {
	return inputField.field('required-helper');
};

exports.post = function(request) {
};
