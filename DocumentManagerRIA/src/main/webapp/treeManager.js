{
	// Page components
	let folderTree, documentInfo, pageOrchestrator = new PageOrcherstrator();
	
	// on HomePageRia.html load function
	window.addEventListener("load", () => {
		if (sessionStorage.getItem("username") == null) {
			window.location.href = "index.html";
	    } else {
	    	pageOrchestrator.start(); // initialize the components
	      	pageOrchestrator.refresh();
		} // display initial content
	}, false);
	
	// Constructors of view components
	
	// alert = div che mostra i messaggi di alert
	// treecontainer = <div id="id_tree"> che include il titolo "Lista delle tue cartelle:"
	// treebodycontainer = <ul id="id_treebody"> che corrisponde al FolderTree effettivo
	function FolderTree(_alert, _treecontainer, _treebodycontainer){
		this.alert = _alert;
		this.treecontainer = _treecontainer;
		this.treebodycontainer = _treebodycontainer;
		
		// Funzione usata per nascondere l albero in assenza di cartelle nell albero
		this.reset = function() {
			this.treecontainer.style.visibility = "hidden";
		}
		
		this.show = function() {
	    	var self = this;
	      	makeCall("GET", "LoadFullTree", null,
	        	function(req) {
	          		if (req.readyState == 4) {
	            		var message = req.responseText;
	            		if (req.status == 200) {
				            var treeToShow = JSON.parse(req.responseText);
				            if (treeToShow.length == 0) {
				                self.alert.textContent = "Non ci sono cartelle o documenti da mostrare!";
				                return;
				            }
				             self.update(missionsToShow); // self visible by closure
				             // if (next) next(); // show the default element of the list if present
				            
				        } else if (req.status == 403) {
							// Utente non autorizzato, lo slogga
			                window.location.href = req.getResponseHeader("Location");
			                window.sessionStorage.removeItem('username');
			            } else {
							// generico errore ricevuto dal server
				        	self.alert.textContent = message;
				    	}
	         		}
	        	});
	    }
	    
	    this.update = function(folderTree) {
			this.treebodycontainer.innerHTML = "";
			// build updated list
	      	var self = this;
	      	folderTree.forEach(function(rootFolder) {
				var rootfoldersubtree = document.createElement("li");
				var rootfoldercontainer = document.createElement("div");
				rootfoldercontainer.classList.add("rootFolder");
				rootfoldersubtree.appendChild(rootfoldercontainer);
				
				// non so come ACCIDERBOLINA andare avanti (aka mi so rut i bal)
			}, false);
			
		}
		
	}
	  
}