/**
 * AJAX call management
 */
// method = GET, POST
// url = nme della servlet chiamata
// form = mandi tutto il form
// cback = funzione da chiamare se la request ha successo
	function makeCall(method, url, formElement, cback, reset = true) {
	    var req = new XMLHttpRequest(); 
	    
	    req.onreadystatechange = function() {
	      cback(req)
	    }; 
	    
	    req.open(method, url);
	    if (formElement == null) {
	      req.send();
	    } else {
	      req.send(new FormData(formElement));
	    }
	    if (formElement !== null && reset === true) {
	      formElement.reset();
	    }
	  }
