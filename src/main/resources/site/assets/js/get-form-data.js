// Load and store all data from selected form to Session Storage.
// All different types of input fields need to have unique names
// or else the script won't work.

function easyContactForm(formSelector){
	
	function log(str) {
		var logPrefix = "Simple contact form app:";
		if (str)
			console.log( logPrefix + ' ' + str );
		else
			console.log( logPrefix );
	}

	function getFormData(){
		var formData = formContainer.querySelectorAll("*");
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

	function addListenersToForm(){
		
		// Submit
		form.addEventListener('submit', function(event){
			event.preventDefault();
			if (this.checkValidity()) {
				ajaxRequest();
			}
		});

		// Reset - is this one needed?
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
			storageFunctions.store();
		});
	}

	var storageFunctions = {
		// Functions to use with sessionStorage when data is entered to the form
		restore: function(){
			function restoreFormData(obj){
				var element = formContainer.querySelector('*[name="'+ obj.name +'"]');
				element.value = obj.value;
			}

			var loadedFormData = sessionStorage.getItem(formContainer.id);
			if (loadedFormData != "undefined" ){
				var loadedFormObject = JSON.parse(loadedFormData);
				log("Restored form data from sessionStorage");
				for (var key in loadedFormObject) {
					var value = loadedFormObject[key];
					restoreFormData({name: key, value: value});
				}
			}
			else log("Nothing to restore from sessionStorage");
		},
		store: function(json){
			var formData = getFormData();
			var jsonString = JSON.stringify(formData);
			var storedFormData = sessionStorage.setItem(formContainer.id, jsonString);
			log("Writing form data to sessionStorage");
		},
		reset: function(json){
			form.reset();
			sessionStorage.removeItem(formContainer.id);
			log("Form reset");
		},
	};

	function ajaxRequest() {
		var url = form.action;
		log("Preparing XMLHttpRequest");
		var xhttp    = new XMLHttpRequest();
		var formData = getFormData();
		var dataObj  = {
			data: formData,
			ajax: true
		};

		var dataObjString = JSON.stringify(dataObj);
		form.classList.add("blur");
		formStatusMessage.classList.remove("hidden");
		xhttp.open("POST", url, true);
		xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				var response = xhttp.responseText;
				log("XMLHttpRequest response: " + response);
				storageFunctions.reset();
			}
			form.classList.remove("blur");
			formStatusMessage.classList.add("hidden");

		};
		xhttp.send(dataObjString);
	}

	log("Initializing form functions");
	
	var formContainer = document.querySelector(formSelector);
	var form = formContainer.querySelector('form');
	var formStatusMessage = formContainer.querySelector('.status-message');
	
	addListenersToForm();
	storageFunctions.restore();

}
