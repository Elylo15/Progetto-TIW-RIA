/**
 * Login and Registration management
 */

(function() { // avoid variables ending up in the global scope

	document.getElementById("loginbutton").addEventListener('click', (e) => {
		var form = e.target.closest("form");
		//console.log(form);

		if (form.checkValidity()) {
			makeCall("POST", 'CheckLogin', form,
				function(x) {
					if (x.readyState == XMLHttpRequest.DONE) {
						var message = x.responseText;
						switch (x.status) {
							case 200:
								sessionStorage.setItem('username', message);
								console.log("login ok");
								window.location.href = "HomePageRIA.html";
								break;
							case 400: // bad request
							case 401: // unauthorized
							case 500: // server error
								document.getElementById("error").textContent = message;
								break;
						}
					}
				}
			);
		} else {
			form.reportValidity();
		}
	});


	//per la registrazione
	document.getElementById("registrationbutton").addEventListener('click', (e) => {
		var form = e.target.closest("form");

		if (form.checkValidity()&& validateEmail() && validatePassword()) {
			makeCall("POST", 'CheckRegistration', form,
				function(x) {
					if (x.readyState == XMLHttpRequest.DONE) {
						var message = x.responseText;
						switch (x.status) {
							case 200:
								sessionStorage.setItem('username', message);
								window.location.href = "HomePageRIA.html";
								break;
							case 400: // bad request
							case 401: // unauthorized
							case 500: // server error
								document.getElementById("error").textContent = message;
								break;
						}
					}
				}
			);
		} else {
			form.reportValidity();
		}
	});

	// showLogin
	document.getElementById('showLogin').addEventListener('click', function() {
		document.getElementById('loginForm').classList.remove('hidden');
		document.getElementById('registrationForm').classList.add('hidden');
	});

	// showRegistration      
	document.getElementById('showRegistration').addEventListener('click', function() {
		document.getElementById('registrationForm').classList.remove('hidden');
		document.getElementById('loginForm').classList.add('hidden');
	});

	// verifica email
	document.getElementById('emailR').addEventListener('input', validateEmail);

	//verifica password e la visibilità	della password di registrazione
	document.getElementById('pwdR').addEventListener('input', () => {
		validatePassword();
	});

	//verifica password e la visibilità	della repeat password di registrazione
	document.getElementById('repeatpwdR').addEventListener('input', () => {
		validatePassword();
	});



	//verifica email    
	function validateEmail() {
		var email = document.getElementById('emailR').value;
		var error = document.getElementById('error');
		var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

		if (!emailPattern.test(email)) {
			error.textContent = "Indirizzo email non valido";
			return false;
		} else {
			error.textContent = "";
			return true;

		}
	}

	function validatePassword() {
		var password = document.getElementById('pwdR').value;
		var repeatPassword = document.getElementById('repeatpwdR').value;
		var error = document.getElementById('error');

		if (password !== repeatPassword) {
			error.textContent = "Le password non corrispondono";
			return false;
		} else {
			// Resetta il messaggio di errore se le password corrispondono
			error.textContent = "";
			return true;
		}
	}
})();