// Load and store all data from selected form to Session Storage.
// All different types of input fields need to have unique names
// or else the script won't work.

function easyContactForm(formSelector, formResponse){
	
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
		status.sending();
		xhttp.open("POST", url, true);
		xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				var response = JSON.parse(xhttp.responseText);
				var errors = 0, success = 0;

				// Count server responses false = form not sent, true = form sent.
				for (var i = 0, len = response.status.length; i < len; i ++) {
					var current = response.status[i];
					if (current === false)
						errors += 1;
					else
						success += 1;
				}
				log("XMLHttpRequest succes: " + success + ", errors: " + errors);
				// Display corresponding status message.
				if (errors === 0 && success > 0)
					status.done();
				else
					status.error();
			}
			else
				status.error();
		};
		xhttp.send(dataObjString);
	}

	function newElement(obj){
		// obj = {content: "", type: "", class: [], attr: {key: attr}}

		var el = document.createElement(obj.element);
		if (obj.content) {
			var text = document.createTextNode(obj.content);
			el.appendChild(text);
		}
		if (obj.type) {
			el.type = obj.type;
		}
		if (obj.class) {
			for (var i = 0, len = obj.class.length; i < len; i ++ ) {
				var item = obj.class[i];
				el.classList.add(item);
			}
			if (obj.attr) {
				for (var key in obj.attr) {
					el.setAttribute(key, obj.attr[key]);
				}
			}
		}
		return el;
	}

	var status = {
		getContainer: function(){
			var container = statusEl.querySelector('.container');
			return container;
		},
		getPanel: function(){
			var panel = statusEl.querySelector('.panel');
			return panel;
		},
		newPanel: function(obj){
			var panelClass = 'panel-default';
			if (obj.type == 'error') panelClass = 'panel-danger';
			var panel        = newElement({element: 'div', class: ['panel', panelClass]});
			var panelHeading = newElement({element: 'div', class: ['panel-heading']});
			var panelTitle   = newElement({element: 'h3', class: ['panel-title'], content: obj.title});
			var panelBody    = newElement({element: 'div', class: ['panel-body']});
			panelBody.appendChild(obj.content);
			panelHeading.appendChild(panelTitle);
			panel.appendChild(panelHeading);
			panel.appendChild(panelBody);
			return panel;
		},
		show: function(){
			form.classList.add("blur");
			statusEl.classList.remove("hidden");			
		},
		sending: function(){
			status.show();
			var progress     = newElement({element: 'div', class: ['progress'] });
			var progressBar  = newElement({element: 'div', class: ['progress-bar','progress-bar-striped','active'],attr: {"role": "progressbar","style": "width: 100%" }});
			progress.appendChild(progressBar);
			var panel = status.newPanel({title: formResponse.sendingTitle, content: progress});
			status.getContainer().replaceChild(panel, status.getPanel());
		},
		done: function(){
			status.show();
			var button = newElement({element: 'button', type: 'button', class: ['btn', 'btn-success', 'center-block'], content: formResponse.confirm});
			button.addEventListener('click', function(event){
				event.preventDefault();
				status.remove();
				storageFunctions.reset();
			});
			var panel = status.newPanel({title: formResponse.doneTitle, content: button});
			status.getContainer().replaceChild(panel, status.getPanel());
		},
		error: function(){
			status.show();
			var container = newElement({element: 'div'});
			var content = newElement({element: 'p', content: formResponse.errorBody});
			var button = newElement({element: 'button', type: 'button', class: ['btn', 'btn-danger', 'center-block'], content: formResponse.confirm});
			button.addEventListener('click', function(event){
				event.preventDefault();
				status.remove();
			});
			container.appendChild(content);
			container.appendChild(button);
			var panel = status.newPanel({title: formResponse.errorTitle, content: container, type: 'error'});
			status.getContainer().replaceChild(panel, status.getPanel());
		},
		remove: function(){
			var panel = status.getPanel();
			while (panel.firstChild) {
				panel.removeChild(panel.firstChild);
			}
			status.getContainer().parentNode.classList.add("hidden");
			form.classList.remove("blur");
		},
		
	};

	log("Initializing form functions");
	var formContainer = document.querySelector(formSelector);
	var form = formContainer.querySelector('form');
	var statusEl = formContainer.querySelector('.status-message');

	// Check if form variables is set, else populate with default values.
	var defaultFormResponse = {
		sendingTitle: "Sending message",
		doneTitle: "Message sent",
		confirm: "OK",
		errorTitle: "Error",
		errorBody: "Your message could not be sent! Please try again later.",
	};
	if (formResponse === undefined) formResponse = defaultFormResponse;
	else
		for (var key in defaultFormResponse) {
			if (formResponse[key] === undefined)
				formResponse[key] = defaultFormResponse[key];
		}

		addListenersToForm();
		storageFunctions.restore();
	}
