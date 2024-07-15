{
	// Page components
	let folderTree, documentInfo, pageOrchestrator = new PageOrchestrator(), createFolderForm;

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
	// orchestrator = riferimento al PageOrchestrator per aggiornare la pagina se necessario
	function FolderTree(_alert, _treecontainer, _treebodycontainer, _orchestrator) {
		this.alert = _alert;
		this.treecontainer = _treecontainer;
		this.treebodycontainer = _treebodycontainer;
		this.orchestrator = _orchestrator;

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
				folderContainer.setAttribute("folderid", folder.id);
				folderContainer.classList.add("rootFolder");

				// Aggiunge l'icona della cartella e il nome
				var icon = document.createElement("span");
				icon.innerHTML = '<img src="img/folder.png">';
				var folderName = document.createElement("span");
				folderName.textContent = " " + folder.name;

				folderContainer.appendChild(icon);
				folderContainer.appendChild(folderName);
				folderItem.appendChild(folderContainer);

				//aggiunta dei bottoni per aggiungere sottocartelle
				self.addButtons(folderContainer, folder.id, folders);


				//per mettere le cartelle drop
				self.setUpDroppableFolder(folderContainer);
				// per consentire di draggare le cartelle
				self.setUpDraggableFolder(folderContainer);



				// Controlla se ci sono sottocartelle
				if (folder.subFolders.length > 0) {
					var subfolderList = document.createElement("ul");
					subfolderList.classList.add("subfolder");
					self.update(subfolderList, folder.subFolders); // Chiamata ricorsiva per le sottocartelle
					folderItem.appendChild(subfolderList);
				}

				// Aggiunge i documenti se presenti
				if (folder.hasOwnProperty("documents")) {
					var documentsList = document.createElement("ul");
					documentsList.classList.add("documents");
					folder.documents.forEach(function(doc) {
						var documentItem = document.createElement("li");
						documentItem.setAttribute("documentid", doc.id);
						documentItem.classList.add("doc");
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
			this.treecontainer.style.visibility = "visible";
		}

		this.createBin = function(parentElement) {
			// Generazione del cestino
			var binItem = document.createElement("li");
			var binContainer = document.createElement("div");
			binContainer.setAttribute("folderid", "bin");
			binContainer.classList.add("rootFolder");

			// Aggiunge l'icona del cestino e il nome
			var icon = document.createElement("span");
			icon.innerHTML = '<img src="img/bin.png">';
			var binName = document.createElement("span");
			binName.textContent = " Cestino";

			binContainer.appendChild(icon);
			binContainer.appendChild(binName);
			binItem.appendChild(binContainer);

			// GESTIONE DEL DROP PER ELIMINARE UN ELEMENTO
			// tutti i div di tutte le cartelle sono "dropzone-delete"
			binContainer.classList.add("dropzone-delete");
			binContainer.addEventListener("dragover", (ev) => {
				//prevent default to allow drop
				ev.preventDefault();
			}, false);

			binContainer.addEventListener("dragenter", (ev) => {
				// trovo il div più vicino con classe dropzone-delete
				const dropTarget = ev.target.closest('.dropzone-delete');
				// highligth potential drop target when the draggable element enters it
				if (dropTarget) {
					dropTarget.classList.add("dragover");
				}
			});

			binContainer.addEventListener("dragleave", (ev) => {
				// trovo il div più vicino con classe dropzone-delete
				const dropTarget = ev.target.closest('.dropzone-delete');
				// reset background of potential drop target when the draggable element leaves it
				if (dropTarget) {
					dropTarget.classList.remove("dragover");
				}
			});


			// GESTIONE DEL DROP
			binContainer.addEventListener("drop", (ev) => {
				// prevent default action (open as link for some elements)
				ev.preventDefault();
				// trovo il div più vicino con classe dropzone-delete
				const dropTarget = ev.target.closest('.dropzone-delete');
				// operazioni di eliminazione del documento/cartella
				if (dropTarget) {
					var self = this;
					dropTarget.classList.remove("dragover");
					var folderToDeleteId = ev.dataTransfer.getData("folderToDeleteId");
					var docToDeleteId = ev.dataTransfer.getData("docId");
					// CONTROLLO SE HO DROPPATO UN DOCUMENTO O UNA CARTELLA
					if (docToDeleteId !== "" && !isNaN(docToDeleteId)) {
						
						// ELIMINAZIONE del DOCUMENTO
						makeCall("GET", 'DeleteElement?documentId=' + docToDeleteId, null,
							function(req) {
								if (req.readyState == XMLHttpRequest.DONE) {
									var message = req.responseText;
									switch (req.status) {
										case 200:
											self.orchestrator.refresh();
											break;
										case 400: // bad request	
										case 500: // server error
											self.alert.textContent = message;
											break;
									}
								}
								else {
									self.alert.textContent = message;
								}
							}
						);
					}
					else if (folderToDeleteId !== "" && !isNaN(folderToDeleteId)) {
						// ELIMINAZIONE DELLA CARTELLA
						makeCall("GET", 'DeleteElement?folderId=' + folderToDeleteId, null,
							function(req) {
								if (req.readyState == XMLHttpRequest.DONE) {
									var message = req.responseText;
									switch (req.status) {
										case 200:
											self.orchestrator.refresh();
											break;
										case 400: // bad request	
										case 500: // server error
											self.alert.textContent = message;
											break;
									}
								}
								else {
									self.alert.textContent = message;
								}
							}
						);
					}
					else {
						// è stato droppato sul cestino qualcosa di non riconosciuto
						this.alert.textContent = "Elemento da eleiminare non valido";
					}

				}
			});
			parentElement.appendChild(binItem);
		}

		// I documenti vengono resi draggable per poter essere spostati
		this.setUpDraggableDocs = function(docContainer) {
			docContainer.setAttribute("draggable", true);
			docContainer.addEventListener("dragstart", (ev) => {
				// store a ref. on the dragged elem
				ev.dataTransfer.setData("docId", ev.target.getAttribute("documentid"));
				ev.dataTransfer.setData("fatherFolderId", ev.target.closest("li:not(.doc)").querySelector(".dropzone").getAttribute("folderid"));

				// make it half transparent
				ev.target.classList.add("dragging");
			}, false);
			docContainer.addEventListener("dragend", (ev) => {
				// reset the transparency
				ev.target.classList.remove("dragging");
			}, false);
		}

		// Le cartelle sono resi "droppable" per fare in modo che un documento possa spostarsi su di esse
		this.setUpDroppableFolder = function(folderContainer) {
			// tutti i div di tutte le cartelle sono "dropzone"
			folderContainer.classList.add("dropzone");
			folderContainer.addEventListener("dragover", (ev) => {
				//prevent default to allow drop
				ev.preventDefault();
			}, false);

			folderContainer.addEventListener("dragenter", (ev) => {
				// trovo il div più vicino con classe dropzone
				const dropTarget = ev.target.closest('.dropzone');
				// highligth potential drop target when the draggable element enters it
				if (dropTarget) {
					dropTarget.classList.add("dragover");
				}
			});

			folderContainer.addEventListener("dragleave", (ev) => {
				// trovo il div più vicino con classe dropzone
				const dropTarget = ev.target.closest('.dropzone');
				// reset background of potential drop target when the draggable element leaves it
				if (dropTarget) {
					dropTarget.classList.remove("dragover");
				}
			});

			folderContainer.addEventListener("drop", (ev) => {
				// prevent default action (open as link for some elements)
				ev.preventDefault();
				// trovo il div più vicino con classe dropzone
				const dropTarget = ev.target.closest('.dropzone');
				// operazioni di spostamento del documento
				if (dropTarget) {
					dropTarget.classList.remove("dragover");
					var docId = ev.dataTransfer.getData("docId");	// id del documento da eliminare

					// OPERATIONS
					if (docId !== "" && !isNaN(docId)) {
						// STO DRAGGANDO UN DOCUMENTO
						var oldFolderId = ev.dataTransfer.getData("fatherFolderId");
						var destinationFolderId = dropTarget.getAttribute("folderid");
						if (oldFolderId == destinationFolderId) {
							//mostra messaggio di errore
							this.alert.textContent = "Il documento è già in quella cartella";
						}
						else if (oldFolderId != destinationFolderId) {
							// SPOSTA IL DOCUMENTO
							var self = this;
							makeCall("GET", 'MoveDocument?fatherFolderId=' + destinationFolderId + '&documentId=' + docId, null,
								function(req) {
									if (req.readyState == XMLHttpRequest.DONE) {
										var message = req.responseText;
										switch (req.status) {
											case 200:
												self.orchestrator.refresh();
												break;
											case 400: // bad request	
											case 500: // server error
												self.alert.textContent = message;
												break;
										}
									}
									else {
										self.alert.textContent = message;
									}
								}
							);

						}
						else {
							// generico messaggio di errore
							this.alert.textContent = "Documento non valido";
						}
					} else {
						// generico messaggio di errore
						this.alert.textContent = "Documento non valido";
					}

					//console.log(docId + " dropped on: " + destinationFolderId);
				}
			});

		}

		// Le cartelle sono rese draggable in modo che siano eliminabili
		this.setUpDraggableFolder = function(folderContainer) {
			folderContainer.setAttribute("draggable", true);
			folderContainer.addEventListener("dragstart", (ev) => {
				// store a ref. on the dragged elem
				ev.dataTransfer.setData("folderToDeleteId", ev.target.getAttribute("folderid"));

				// make it half transparent
				ev.target.classList.add("dragging");
			}, false);
			folderContainer.addEventListener("dragend", (ev) => {
				// reset the transparency
				ev.target.classList.remove("dragging");
			}, false);
		}

		// Aggiungi i bottoni per le sottocartelle
		this.addButtons = function(folderContainer) {
			// Bottone per aggiungere una sottocartella
			var addSubfolderButton = document.createElement("button");
			addSubfolderButton.textContent = "Aggiungi Sottocartella";
			addSubfolderButton.addEventListener("click", function() {
				document.getElementById("fatherFolder").textContent = folderContainer.children[1].textContent;
				document.getElementById("div_createFolder").setAttribute("fatherFolderId", folderContainer.getAttribute("folderid"));
				createFolderForm.show();
			});

			folderContainer.appendChild(addSubfolderButton);
		}

	}


	// alert = div che mostra i messaggi di alert
	// formContainer = <div id="div_createFolder"> 
	// orchestrator = riferimento al PageOrchestrator per aggiornare la pagina se necessario
	function CreateFolderForm(_orchestrator, _alert, _formContainer) {
		this.orchestrator = _orchestrator;
		this.formContainer = _formContainer;
		this.alert = _alert;


		this.show = function() {
			var self = this;
			this.formContainer.style.visibility = "visible";
			var createFolderForm = document.getElementById("createFolder_form");
			var fatherFolderId = this.formContainer.getAttribute("fatherfolderid");
			var input = document.createElement("input");
			input.type = "hidden";
			input.name = "fatherFolderid";
			input.value = fatherFolderId;
			createFolderForm.appendChild(input);
			// Aggiungi un event listener per l'evento submit
			createFolderForm.addEventListener('submit', function(e) {
				e.preventDefault(); // Impedisce il comportamento predefinito di submit del form

				makeCall("POST", "CreateFolder", createFolderForm, function(req) {

					if (req.readyState == XMLHttpRequest.DONE) {
						var message = req.responseText;
						switch (req.status) {
							case 200:
								self.orchestrator.refresh();
								break;
							case 400: // bad request	
							case 500: // server error
								self.alert.textContent = message;
								break;
						}
					}
					else {
						self.alert.textContent = message;
					}
				});
			});

		}

	}

	// finestra modale di conferma quando cerco di modificare un documento
	function AlertContainer(){
		this.show = function(){
		}
	}




	// Handles page loading and refreshing
	function PageOrchestrator() {
		var alert = document.getElementById("id_alert");
		var treeContainer = document.getElementById("id_tree");
		var treeBodyContainer = document.getElementById("id_treebody");
		var formContainer = document.getElementById("div_createFolder");

		this.start = function() {
			// Visualizzazione messaggio di benvenuto personalizzato
			var usrNameContainer = document.getElementById("id_username");
			usrNameContainer.textContent = sessionStorage.getItem('username');

			folderTree = new FolderTree(alert, treeContainer, treeBodyContainer, this);

			//Creazione dell'oggetto createFolderForm
			createFolderForm = new CreateFolderForm(this, alert, formContainer);
		};

		this.refresh = function() { // currentMission initially null at start
			alert.textContent = "";        // not null after creation of status change

			// restart del folderTree
			folderTree.reset();
			folderTree.show();
		};
	}
}	
