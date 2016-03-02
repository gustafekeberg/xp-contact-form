// Load and store all data from selected form to Session Storage.
// All different types of input fields need to have unique names
// or else the script won't work.

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

function logJSON(json){
	var string = JSON.stringify(json);
	console.log(string);
}

function addListenersToForm(form){
	// Submit
	form.addEventListener('submit', function(event){
		event.preventDefault();
		var formData = getFormData(this);

		// Create ajax-request from collected form data,
		// show wating message,
		// update status,
		// then clear form
			storageFunctions.clear(form);
	});
	
	// Clear
	clearButton = form.querySelector('button[type="clear"]');
	clearButton.addEventListener('click', function(event){
		event.preventDefault();
		if (confirm("Are you sure?")) {
			storageFunctions.clear(form);
			storageFunctions.store(form);
		}
	});
	
	// Input
	form.addEventListener('input', function(event){
		var formData = getFormData(form);
		storageFunctions.store(this, formData);
	});
}

var storageFunctions = {
	restore: function(element){
		function restoreFormData(obj, element){
			var e = element.querySelector('*[name="'+ obj.name +'"]');
			e.value = obj.value;
		}
		
		var loadedFormData = sessionStorage.getItem(element.id);
		if (loadedFormData != "undefined" ){
			var loadedFormObject = JSON.parse(loadedFormData);
			console.log("Restored form data from sessionStorage");
			for (var key in loadedFormObject) {
				var value = loadedFormObject[key];
				restoreFormData({name: key, value: value}, element);
			}
		}
		else console.log("Nothing to restore from sessionStorage");
	},
	store: function(element, json){
		var jsonString = JSON.stringify(json);
		var storedFormData = sessionStorage.setItem(element.id, jsonString);
		console.log("Writing form data to sessionStorage");
	},
	clear: function(element, json){
		var elements = element.querySelectorAll('*[name]');
		for (var i = 0, len = elements.length; i < len ; i ++) {
			elements[i].value = '';
		}
		console.log("Form cleared");
	},
};

function contactFormInit(selector, configObj) {
	var form = document.querySelector(selector);
	addListenersToForm(form);
	storageFunctions.restore(form);
}

window.addEventListener("load", contactFormInit('#myForm'));
