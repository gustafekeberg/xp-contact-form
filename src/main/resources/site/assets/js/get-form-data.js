// Load and store all data from selected form to Session Storage.
// All different types of input fields need to have unique names
// or else the script won't work.

function logJSON(json){
	var string = JSON.stringify(json);
	log();
	console.log(string);
}

function log(str) {
	var logPrefix = "Simple contact form app:";
	if (str)
		console.log( logPrefix + ' ' + str );
	else
		console.log( logPrefix );
}

function getFormData(container){
	var formData = container.querySelectorAll("*");
	var data = {};

	for ( var i = 0, len = formData.length; i < len; i ++ ){
		var item  = formData[i];
		var name  = item.name;
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
		if (this.checkValidity()) {
			var actionUrl = this.action;
			ajaxRequest(formContainer, actionUrl);
		}
	});
	
	// reset
	clearButton = form.querySelector('button[type="reset"]');
	if ( clearButton )
	{
		clearButton.addEventListener('click', function(event){
			event.preventDefault();
			if (confirm("Are you sure?")) {
				storageFunctions.reset(formContainer);
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
	reset: function(element, json){
		var form = element.querySelector('form');
		form.reset();
		sessionStorage.removeItem(element.id);
		log("Form reset");
	},
};

function ajaxRequest (container, url) {
	log("Preparing XMLHttpRequest");
	var xhttp    = new XMLHttpRequest();
	var formData = getFormData(container);
	var dataObj  = {
		data: formData,
		ajax: true
	};

	var dataObjString = JSON.stringify(dataObj);

	xhttp.open("POST", url, true);
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var response = xhttp.responseText;
			log("XMLHttpRequest response: " + response);
			storageFunctions.reset(container);
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
