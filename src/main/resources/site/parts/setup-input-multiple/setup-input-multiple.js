var inputField  = require('/lib/setup-fields');

exports.get = function(request) {
	return inputField.field('input-multiple');
};

exports.post = function(request) {
};
