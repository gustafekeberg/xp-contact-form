// Load and store all data from selected form to Session Storage.
// All different types of input fields need to have unique names
// or else the script won't work.

var logPrefix = "Form app: ";
function logJSON(json){
	var string = JSON.stringify(json);
	log();
	console.log(string);
}

function log(str) {
	if (str)
		console.log( logPrefix + str );
}

function getFormData(element){
	var formData = element.querySelectorAll("*");
	var data = {};

	for ( var i = 0, len = formData.length; i < len; i ++ ){
		var item = formData[i];
		var name = item.name;
		var value = item.value;
		if (name !== "" && name !== undefined)
			data[name] = value;
	}
	return data;
}

function addListenersToForm(formContainer){
	var form = formContainer.querySelector('form');

	// Submit
	form.addEventListener('submit', function(event){
		event.preventDefault();
		var actionUrl = this.action;
		var formData = getFormData(this);
		ajaxRequest(formData, actionUrl);

		storageFunctions.clear(formContainer);
	});
	
	// Clear
	clearButton = form.querySelector('button[type="clear"]');
	if ( clearButton )
	{
		clearButton.addEventListener('click', function(event){
			event.preventDefault();
			if (confirm("Are you sure?")) {
				storageFunctions.clear(formContainer);
			}
		});
	}
	
	// Input
	form.addEventListener('input', function(event){
		var formData = getFormData(form);
		storageFunctions.store(formContainer, formData);
	});
}

var storageFunctions = {
	// Functions to use with sessionStorage when data is entered to the form
	restore: function(element){
		function restoreFormData(obj, element){
			var e = element.querySelector('*[name="'+ obj.name +'"]');
			e.value = obj.value;
		}
		
		var loadedFormData = sessionStorage.getItem(element.id);
		if (loadedFormData != "undefined" ){
			var loadedFormObject = JSON.parse(loadedFormData);
			log("Restored form data from sessionStorage");
			for (var key in loadedFormObject) {
				var value = loadedFormObject[key];
				restoreFormData({name: key, value: value}, element);
			}
		}
		else log("Nothing to restore from sessionStorage");
	},
	store: function(element, json){
		var jsonString = JSON.stringify(json);
		var storedFormData = sessionStorage.setItem(element.id, jsonString);
		log("Writing form data to sessionStorage");
	},
	clear: function(element, json){
		// log("Form not cleared, function is disabled!");
		var elements = element.querySelectorAll('*[name]');
		for (var i = 0, len = elements.length; i < len ; i ++) {
			elements[i].value = '';
		}
		sessionStorage.removeItem(element.id);
		log("Form cleared");
	},
};

function ajaxRequest (data, url) {
	log("Preparing XMLHttpRequest");
	var xhttp = new XMLHttpRequest();
	var dataObj = {
		data: data,
		ajax: true
	};
		
	var dataObjString = JSON.stringify(dataObj);

	xhttp.open("POST", url, true);
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var response = xhttp.responseText;
			log("XMLHttpRequest response: " + response);
		}
	};
		xhttp.send(dataObjString);
}

function contactFormInit(selector, configObj) {
	log("Initializing form");
	var formContainer = document.querySelector(selector);
	addListenersToForm(formContainer);
	storageFunctions.restore(formContainer);
}

// window.addEventListener("load", contactFormInit('#contact_form'));
