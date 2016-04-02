var portalLib   = require('/lib/xp/portal');
var contentLib  = require('/lib/xp/content');
var thymeleaf   = require('/lib/xp/thymeleaf');
var mailLib     = require('/lib/xp/mail');
var utilDataLib = require('/lib/enonic/util/data');
var i18nLib     = require('/lib/xp/i18n');

function log( string ) {
	var util = require('/lib/enonic/util/util');
	util.log(string);
}

function assetUrl(url){
	return portalLib.assetUrl(url);
}

exports.get = function(request) {
	return handleGet(request);
};

exports.post = function(request) {

	var body = JSON.parse(request.body);

	if (body.ajax === true)
	{
		return handleAjax(request);
	}

	else
		return handlePost(request);
};

function handleGet(request) {
	return {body: '<div class="form-group"><input class="form-control" placeholder="Input field" /></div>'};

}
function handlePost(request) {

}


function localize(key) {
	return i18nLib.localize({key: key});
}

function replacePlaceholders(string, placeholderObj){

	var rePart = "";
	var processedString = "";
	var key;
	
	// Pick placeholder keys to build rePart
	for (key in placeholderObj) {
		if (rePart === "")
			rePart += key;
		else
			rePart += '|' + key;
	}
	
	// Split string in placeholderObj keys or by character,
	// then replace placeholderObj and rebuild string.
	var re = new RegExp("\\{{2}(" + rePart + ")\\}{2}|([\\n\\r\\t\\0\\s\\S]{1,}?)", "gmi");
	var match;
	var matches = [];
	
	while ((match = re.exec(string)) !== null) {
		matches.push(match);
	}
	for (var i = 0, len = matches.length; i < len; i ++){
		if (matches[i][1] !== undefined)
		{
			key = matches[i][1];
			processedString += placeholderObj[key];
		}
		else if (matches[i][0])
			processedString += matches[i][0];
	}
	return processedString;
}
