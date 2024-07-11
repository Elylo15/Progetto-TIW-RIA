{
	// Page components
	let folderTree, documentInfo, pageOrchestrator = new PageOrchestrator();

	// on HomePageRia.html load function
	window.addEventListener("load", () => {
		if (sessionStorage.getItem("username") == null) {
			window.location.href = "index.html";
		} else {
			// displayFolderTree();
			pageOrchestrator.start(); // initialize the components
			pageOrchestrator.refresh();
		} // display initial content
	}, false);


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

		// Retrieves the information form the server
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
							self.update(self.treebodycontainer, treeToShow); // self visible by closure
							self.createBin(self.treebodycontainer);

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

		// Displays the updated tree
		this.update = function buildTree(parentElement, folders) {
			var self = this;
			parentElement.innerHTML = "";
			folders.forEach(function(folder) {
				var folderItem = document.createElement("li");
				var folderContainer = document.createElement("div");
				folderContainer.classList.add("rootFolder");

				// Aggiunge l'icona della cartella e il nome
				var icon = document.createElement("span");
				icon.innerHTML = '<img src="img/folder.png">';
				var folderName = document.createElement("span");
				folderName.textContent = " " + folder.name;

				folderContainer.appendChild(icon);
				folderContainer.appendChild(folderName);
				folderItem.appendChild(folderContainer);
				
				//per mettere le cartelle drop
				self.setUpDroppableFolder(folderItem);

				// Controlla se ci sono sottocartelle
				if (folder.subFolders.length > 0) {
					var subfolderList = document.createElement("ul");
					subfolderList.classList.add("subfolder");
					self.update(subfolderList, folder.subFolders); // Chiamata ricorsiva per le sottocartelle
					folderItem.appendChild(subfolderList);
					
					//per mettere le cartelle drop
					self.setUpDroppableFolder(folderItem);
				}

				// Aggiunge i documenti se presenti
				if (folder.hasOwnProperty("documents")) {
					var documentsList = document.createElement("ul");
					documentsList.classList.add("documents");
					folder.documents.forEach(function(doc) {
						var documentItem = document.createElement("li");
						var documentIcon = document.createElement("span");
						documentIcon.innerHTML = '<img src="img/document.png">';
						var documentName = document.createElement("span");
						documentName.textContent = " " + doc.name;

						documentItem.appendChild(documentIcon);
						documentItem.appendChild(documentName);
						documentsList.appendChild(documentItem);

						//per mettere i documenti draggabili
						self.setUpDraggableDocs(documentItem);
					});
					folderItem.appendChild(documentsList);
				}

				parentElement.appendChild(folderItem);
			});
		}

		this.createBin = function(parentElement) {
			// Generazione del cestino
			var binItem = document.createElement("li");
			var binContainer = document.createElement("div");
			binContainer.classList.add("rootFolder");

			// Aggiunge l'icona del cestino e il nome
			var icon = document.createElement("span");
			icon.innerHTML = '<img src="img/bin.png">';
			var binName = document.createElement("span");
			binName.textContent = " Cestino";

			binContainer.appendChild(icon);
			binContainer.appendChild(binName);
			binItem.appendChild(binContainer);
			
			//per mettere il cestino drop
			console.log(self);
			self.setUpDroppableFolder(binItem);
			
			parentElement.appendChild(binItem);
			
		}

		this.setUpDraggableDocs = function(docContainer) {
			docContainer.setAttribute("draggable", true);
			docContainer.addEventListener("dragstart", (ev) => {
				// store a ref. on the dragged elem
				dragged = ev.target;
				// make it half transparent
				ev.target.classList.add("dragging");
			}, false);
			docContainer.addEventListener("dragend", (ev) => {
				// reset the transparency
				ev.target.classList.remove("dragging");
			}, false);
		}

		this.setUpDroppableFolder = function(folderContainer) {
			folderContainer.setAttribute("droptarget", '');
			folderContainer.setAttribute("dropzone", '');
			folderContainer.addEventListener("dragover", (ev) => {
				//prevent default to allow drop
				ev.preventDefault();
			}, false);
			folderContainer.addEventListener("dragenter", (ev) => {
				// highligth potential drop target when the draggable element enters it
				if (ev.target.classList.contains("dropzone")) {
					ev.target.classList.add("dragover")
				}
			});

			folderContainer.addEventListener("dragleave", (ev) => {
				// reset background of potential drop target when the draggable element leaves it
				if (ev.target.classList.contains("dropzone")) {
					ev.target.classList.remove("dragover");
				}
			});

			folderContainer.addEventListener("drop", (ev) => {
				// prevent default action (open as link for some elements)
				ev.preventDefault();
				// move dragged element to the selected drop target
				if (ev.target.classList.contains("dropzone")) {
					ev.target.classList.remove("dragover");
					ev.target.appendChild(dragged);
				}
			});

		}


	}

	// Handles page loading and refreshing
	function PageOrchestrator() {
		var alertContainer = document.getElementById("id_alert");
		var treeContainer = document.getElementById("id_tree");
		var treeBodyContainer = document.getElementById("id_treebody");

		this.start = function() {
			folderTree = new FolderTree(alertContainer, treeContainer, treeBodyContainer);
			folderTree.show(); // Mostra l'albero delle cartelle
		};

		this.refresh = function() { // currentMission initially null at start
			alertContainer.textContent = "";        // not null after creation of status change
		};
	}
}	
