/**
 * Login management
 */

(function() { // avoid variables ending up in the global scope

  document.getElementById("loginbutton").addEventListener('click', (e) => {
    var form = e.target.closest("form");
    
    if (form.checkValidity()) {
      makeCall("POST", 'CheckLogin', e.target.closest("form"),
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

})();