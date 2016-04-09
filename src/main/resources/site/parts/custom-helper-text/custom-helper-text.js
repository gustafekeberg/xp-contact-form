var inputField  = require('/lib/setup-fields');

exports.get = function(request) {
	return inputField.field('custom-helper');
};

exports.post = function(request) {
};
