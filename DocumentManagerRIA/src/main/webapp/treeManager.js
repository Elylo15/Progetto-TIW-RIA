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


	// Funzione per creare e mostrare l'albero delle cartelle
	function displayFolderTree() {
		var alertDiv = document.getElementById("id_alert");
		var treeContainer = document.getElementById("id_tree");
		var treeBodyContainer = document.getElementById("id_treebody");

		folderTree = new FolderTree(alertDiv, treeContainer, treeBodyContainer);
		folderTree.show(); // Mostra l'albero delle cartelle
	}

	// Constructors of view components

	// alert = div che mostra i messaggi di alert
	// treecontainer = <div id="id_tree"> che include il titolo "Lista delle tue cartelle:"
	// treebodycontainer = <ul id="id_treebody"> che corrisponde al FolderTree effettivo
	function FolderTree(_alert, _treecontainer, _treebodycontainer) {
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
					// significa che la richiesta è completata e la risposta dal server è stata interamente ricevuta
					if (req.readyState == 4) {
						var message = req.responseText;
						if (req.status == 200) {
							var treeToShow = JSON.parse(req.responseText);
							if (treeToShow.length == 0) {
								self.alert.textContent = "Non ci sono cartelle o documenti da mostrare!";
								return;
							}
							buildTree(treebodycontainer, treeToShow); // self visible by closure
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



		function buildTree(parentElement, folders) {
			parentElement.innerHTML = "";
			folders.forEach(function(folder) {
				var folderItem = document.createElement("li");
				var folderContainer = document.createElement("div");
				folderContainer.classList.add("rootFolder");

				// Aggiunge l'icona della cartella e il nome
				var icon = document.createElement("span");
				icon.innerHTML = '<img src="img/folder.png">';
				var folderName = document.createElement("span");
				folderName.textContent = folder.name;

				folderContainer.appendChild(icon);
				folderContainer.appendChild(folderName);
				folderItem.appendChild(folderContainer);

				// Controlla se ci sono sottocartelle
				if (folder.subfolders.length > 0) {
					var subfolderList = document.createElement("ul");
					subfolderList.classList.add("subfolder");
					buildTree(subfolderList, folder.subfolders); // Chiamata ricorsiva per le sottocartelle
					folderItem.appendChild(subfolderList);
				}

				// Aggiunge i documenti se presenti
				if (folder.documents.length > 0) {
					var documentsList = document.createElement("ul");
					documentsList.classList.add("documents");
					folder.documents.forEach(function(document) {
						var documentItem = document.createElement("li");
						var documentIcon = document.createElement("span");
						documentIcon.innerHTML = '<img src="img/document.png">';
						var documentName = document.createElement("span");
						documentName.textContent = document.name;

						documentItem.appendChild(documentIcon);
						documentItem.appendChild(documentName);
						documentsList.appendChild(documentItem);
					});
					folderItem.appendChild(documentsList);
				}

				parentElement.appendChild(folderItem);

			});


			// Avvia la costruzione dell'albero partendo dalle radici
			buildTree(this.treebodycontainer, folderTree);
		}
	}
	
