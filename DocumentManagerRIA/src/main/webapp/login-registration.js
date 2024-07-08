/**
 * Login and Registration management
 */

(function() { // avoid variables ending up in the global scope

  document.getElementById("loginbutton").addEventListener('click', (e) => {
    var form = e.target.closest("form");
    console.log(form);
    
    if (form.checkValidity()) {
      makeCall("POST", 'CheckLogin', e.target.closest("form"),
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
                document.getElementById("error").textContent = message;
                break;
              case 401: // unauthorized
                  document.getElementById("error").textContent = message;
                  break;
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
    
    if (form.checkValidity()) {
      makeCall("POST", 'CheckRegistration', e.target.closest("form"),
        function(x) {
          if (x.readyState == XMLHttpRequest.DONE) {
            var message = x.responseText;
            switch (x.status) {
              case 200:
            	sessionStorage.setItem('username', message);
                window.location.href = "HomePage.html";
                break;
              case 400: // bad request
                document.getElementById("error").textContent = message;
                break;
              case 401: // unauthorized
                  document.getElementById("error").textContent = message;
                  break;
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
  
  // Chiama la funzione di validazione quando cambia il contenuto dell'input email
  	document.getElementById('emailR').addEventListener('input', function() {
    validateEmail(); 
	});
	
	document.getElementById('pwdR').addEventListener('input', function() {
    validatePassword();
    togglePasswordVisibility('pwdR');
    });
    
    document.getElementById('pwd').addEventListener('input', function() {
    togglePasswordVisibility('pwd');
    });
    
    document.getElementById('repeatpwdR').addEventListener('input', function() {
    togglePasswordVisibility('repeatpwdR');
    });
    
    
     
  //verifica email    
  function validateEmail() {
            var email = document.getElementById('emailR').value;
            var error = document.getElementById('errorEmail');
            var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!emailPattern.test(email)) {
                error.textContent = "Indirizzo email non valido";
                return false;
            } else {
                error.textContent = "";
                
            }
        }
  
   function togglePasswordVisibility(pwdId) {
	    var pwdInput = document.getElementById(pwdId);
	    var showPasswordCheckbox;
	
	    if (pwdId === 'pwd') {
	        showPasswordCheckbox = document.getElementById('showPasswordLogin');
	    } else if (pwdId === 'pwdR') {
	        showPasswordCheckbox = document.getElementById('showPasswordRegister');
	    } else if (pwdId === 'repeatpwdR') {
	        showPasswordCheckbox = document.getElementById('showRepeaterPasswordRegister');
	    }
	
	    if (showPasswordCheckbox.checked) {
	        pwdInput.type = 'text';
	    } else {
	        pwdInput.type = 'password';
	    }
	}
	
	function validatePassword() {
	    var password = document.getElementById("pwdR").value;
	    var repeatPassword = document.getElementById("repeatpwdR").value;
	    var error = document.getElementById("errorPassword");
	
	    if (password !== repeatPassword) {
	        error.textContent = "Le password non corrispondono";
	        return false;
	    } else {
	        // Resetta il messaggio di errore se le password corrispondono
	        error.textContent = "";
	        // Puoi procedere con l'invio del form o con altre operazioni necessarie
	        // Esempio: makeCall("POST", 'CheckRegistration', document.getElementById('registrationForm'), ...);
	    }
	}
  


})();