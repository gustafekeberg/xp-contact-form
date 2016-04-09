var inputField  = require('/lib/setup-fields');

exports.get = function(request) {
	return inputField.field('input-textarea');
};

exports.post = function(request) {
};
