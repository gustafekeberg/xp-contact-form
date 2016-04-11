var inputField  = require('/lib/setup-fields');

exports.get = function(request) {
	return inputField.field('helper-text');
};

exports.post = function(request) {
};
