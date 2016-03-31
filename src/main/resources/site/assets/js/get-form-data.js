// Load and store all data from selected form to Session Storage.
// All different types of input fields need to have unique names
// or else the script won't work.

function easyContactForm(phrases){
	var formSelector          = '.easy-contact-form';
	var sessionStorageKeyName = 'Easy Contact Form - Data ';
	
	function log(str) {
		var logPrefix = "Simple contact form app:";
		if (str)
			console.log( logPrefix + ' ' + str );
		else
			console.log( logPrefix );
	}


	function getFormData(formContainer){
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

	function initForm(formContainer){

		// Store status of form.ajaxRequest to prevent triggering of multiple requests
		formContainer.ajaxRequest = false;

		// Restore form data
		storageFunctions.restore(formContainer);

		//Add listeners
		var form = formContainer.querySelector('form');
		// Submit
		form.addEventListener('submit', function(event){
			event.preventDefault();
			if (this.checkValidity()) {
				ajaxRequest(formContainer);
			}
		});

		// Reset - is this one needed?
		var clearButton = form.querySelector('button[type="reset"]');
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
			storageFunctions.store(formContainer);
		});
	}

	var storageFunctions = {
		// Functions to use with sessionStorage when data is entered to the form
		restore: function(formContainer){
			function restoreFormData(obj){
				var element = formContainer.querySelector('*[name="'+ obj.name +'"]');
				element.value = obj.value;
			}

			var loadedFormData = sessionStorage.getItem(formContainer.sessionStorageKey);
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
		store: function(formContainer){
			var formData = getFormData(formContainer);
			var jsonString = JSON.stringify(formData);
			var storedFormData = sessionStorage.setItem(formContainer.sessionStorageKey, jsonString);
			log("Writing form data to sessionStorage");
		},
		reset: function(formContainer){
			var form = formContainer.querySelector('form');
			form.reset();
			sessionStorage.removeItem(formContainer.sessionStorageKey);
			log("Form reset");
		},
	};

	function ajaxRequest(formContainer) {
		var form = formContainer.querySelector('form');
		if (formContainer.ajaxRequest === false)
		{		
			formContainer.ajaxRequest = true;
			var url = form.action;
			log("Preparing XMLHttpRequest");
			var xhttp    = new XMLHttpRequest();
			var formData = getFormData(formContainer);
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
					log("XMLHttpRequest: " + response.status);

					status.done(formContainer, response);
				}
				else
					status.error();
				formContainer.ajaxRequest = false;
			};
			xhttp.send(dataObjString);
		}
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
		getContainer: function(formContainer){
			var container = statusEl.querySelector('.container');
			return container;
		},
		getPanel: function(){
			var panel = statusEl.querySelector('.panel');
			return panel;
		},
		newPanel: function(obj){
			var panelClass = 'panel-default';
			if (obj.type == 'danger') panelClass = 'panel-danger';
			if (obj.type == 'warning') panelClass = 'panel-warning';
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
			statusEl.classList.add("in");			
		},
		remove: function(formContainer){
			var panelParent = status.getPanel().parentNode;
			while (panelParent.firstChild) {
				panelParent.removeChild(panelParent.firstChild);
			}
			status.getContainer(formContainer).parentNode.classList.remove("in");
		},
		sending: function(formContainer){

			var title   = phrases.sending.title;
			var message = phrases.sending.message;

			var container   = newElement({element: 'div'});
			var content     = newElement({element: 'p', content: message});
			var progress    = newElement({element: 'div', class: ['progress'] });
			var progressBar = newElement({element: 'div', class: ['progress-bar','progress-bar-striped','active'],attr: {"role": "progressbar","style": "width: 100%" }});
			progress.appendChild(progressBar);
			container.appendChild(content);
			container.appendChild(progress);

			var panel = status.newPanel({title: title, content: container});
			status.getContainer(formContainer).appendChild(panel);
			panel.focus();
			status.show();
		},
		done: function(formContainer, statusObj){
			
			var stat = statusObj.status;
			var message = phrases[stat].message;
			var title = phrases[stat].title;

			if (stat == 'error' || stat == 'warning')
			{
				var errLoc = statusObj.errorLocations;
				var error = "Error in response: " + errLoc.join(', ');
				log(error, "error");
			}
			var confirm = phrases.confirm;

			var btnDynClass = 'btn-success';
			if (stat == 'danger') btnDynClass = 'btn-danger';
			else if (stat == 'warning') btnDynClass = 'btn-warning';

			var container = newElement({element: 'div'});
			var content = newElement({element: 'p', content: message});
			var button = newElement({element: 'button', type: 'button', class: ['btn', btnDynClass, 'center-block'], content: confirm});
			
			button.addEventListener('click', function(event){
				event.preventDefault();
				status.remove();
				if (stat == 'success')
					storageFunctions.reset(formContainer);
			});
			
			container.appendChild(content);
			container.appendChild(button);
			var panel = status.newPanel({title: title, content: container, type: stat});
			if (status.getPanel())
				status.getContainer(formContainer).replaceChild(panel, status.getPanel());
			else
				status.getContainer(formContainer).appendChild(panel);
			panel.focus();
			status.show();
		},
		error: function() {
			status.done(formContainer, { status: 'danger' });
		},
		
	};

	log("Initializing form functions");
	var formContainer = document.querySelector(formSelector);
	// var form = formContainer.querySelector('form');
	var statusEl = formContainer.querySelector('.status-message');

	// Check if form variables is set, else use default values.
	if (!phrases) phrases = {
		sending: {
			title: 'Sending',
			message: 'Processing your message.',
		},
		success: {
			title: 'Success!',
			message: 'Your message was sent!',
			status: 'success'
		},
		danger: {
			title: 'Error!',
			message: 'Your message could not be sent. Please try again later.',
			status: 'error'
		},
		warning: {
			title: 'Warning!',
			message: 'There were some errors when processing your message. Please try again later.',
			status: 'warning',
		},
		confirm: 'OK',
	};

	// Find all forms in document and initialize form functions

	var formsInDocument = document.querySelectorAll(formSelector);
	for (var i = 0, len = formsInDocument.length; i < len; i ++ ) {
		var currentForm = formsInDocument[i];
		currentForm.sessionStorageKey = sessionStorageKeyName + i;
		initForm(currentForm);
	}
}
