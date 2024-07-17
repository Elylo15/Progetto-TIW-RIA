{
	// Page components
	let folderTree, documentInfo, pageOrchestrator = new PageOrchestrator(), createFolderForm, createDocumentForm, alertContainer;

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

							if (treeToShow == null) {
								self.alert.textContent = "Non ci sono cartelle o documenti da mostrare!";
								self.addRootFolderButton(document.getElementById("addRootFolderButton"));

								return;
							}

							self.update(self.treebodycontainer, treeToShow); // self visible by closure
							self.createBin(self.treebodycontainer);
							self.addRootFolderButton(document.getElementById("addRootFolderButton"));

						} else if (req.status == 401) {
							// Utente non autorizzato, lo slogga
							window.location.href = "index.html";
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
				self.addSubFolderButton(folderContainer);

				//aggiunta dei bottoni per aggingere documenti
				self.addDocumentButton(folderContainer);


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

						// per aggiungere i bottoni per vedere i dettagli
						self.addDocInfoButton(documentItem);
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
						// mostro la finestra modale di conferma per ELIMINARE il DOCUMENTO
						var docToBeDeletedName = ev.dataTransfer.getData("docName");
						alertContainer.show(docToDeleteId, docToBeDeletedName, true);
					}
					else if (folderToDeleteId !== "" && !isNaN(folderToDeleteId)) {
						// mostro la finestra modale di conferma per ELIMINARE la CARTELLA
						var folderToBeDeletedName = ev.dataTransfer.getData("folderName");
						alertContainer.show(folderToDeleteId, folderToBeDeletedName, false);
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
				ev.dataTransfer.setData("docName", ev.target.querySelectorAll("span")[1].textContent);

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
											case 401:
												// Utente non autorizzato, lo slogga
												window.location.href = "index.html";
												window.sessionStorage.removeItem('username');
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
				ev.dataTransfer.setData("folderName", ev.target.querySelectorAll("span")[1].textContent);

				// make it half transparent
				ev.target.classList.add("dragging");
			}, false);
			folderContainer.addEventListener("dragend", (ev) => {
				// reset the transparency
				ev.target.classList.remove("dragging");
			}, false);
		}

		// Aggiungi i bottoni per aggiungere le sottocartelle
		this.addSubFolderButton = function(folderContainer) {
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

		// aggiunge i bottoni per creare le cartelle padre
		this.addRootFolderButton = function(addRootFolderButton) {
			addRootFolderButton.addEventListener("click", function() {
				// Mostra il form per creare una nuova cartella padre
				document.getElementById("fatherFolder").textContent = "Folder0";
				document.getElementById("div_createFolder").setAttribute("fatherFolderId", "0");
				createFolderForm.show();
			});
		}

		// aggiunge i bottoni per creare i documenti
		this.addDocumentButton = function(folderContainer) {
			// Aggiungi bottone per creare un documento
			var addDocumentButton = document.createElement("button");
			addDocumentButton.textContent = "Aggiungi Documento";
			addDocumentButton.addEventListener("click", function() {
				// Mostra il form per creare una nuova cartella padre
				document.getElementById("fatherFolderDocument").textContent = folderContainer.children[1].textContent;
				document.getElementById("div_createDocument").setAttribute("fatherFolderId", folderContainer.getAttribute("folderid"));
				createDocumentForm.show();
			});
			folderContainer.appendChild(addDocumentButton);
		}

		// aggiunge i bottoni per accedere alle informazioni sui documenti
		this.addDocInfoButton = function(docContainer) {
			var addDocInfoButton = document.createElement("button");
			addDocInfoButton.textContent = "Visualizza dettagli";
			addDocInfoButton.addEventListener("click", function() {
				documentInfo.show(docContainer.getAttribute("documentid"));
			});
			docContainer.appendChild(addDocInfoButton)
		}
	}


	// alert = div che mostra i messaggi di alert
	// formContainer = <div id="div_createFolder"> 
	// orchestrator = riferimento al PageOrchestrator per aggiornare la pagina se necessario
	function CreateFolderForm(_orchestrator, _alert, _formContainer) {
		this.orchestrator = _orchestrator;
		this.formContainer = _formContainer;
		this.alert = _alert;

		this.reset = function() {
			this.formContainer.style.visibility = "hidden";
			// fare pulizia dei parametri, rimuoviamo l'input hidden se presente
			var hiddenInput = document.querySelector('input[name="fatherFolderid"]');
			if (hiddenInput && hiddenInput.parentElement === this.formContainer) {
				this.formContainer.removeChild(hiddenInput);
			}
		}
		this.show = function() {
			var self = this;
			this.formContainer.style.visibility = "visible";
			var createFolderForm = document.getElementById("createFolder_form");
			var fatherFolderId = this.formContainer.getAttribute("fatherfolderid");

			// Rimuoviamo eventuali input hidden esistenti prima di aggiungerne uno nuovo
			var existingInput = createFolderForm.querySelector('input[name="fatherFolderid"]');
			if (existingInput) {
				createFolderForm.removeChild(existingInput);
				console.log("rimosso input nascosto");
			}

			var input = document.createElement("input");
			input.type = "hidden";
			input.name = "fatherFolderid";
			input.value = fatherFolderId;
			createFolderForm.appendChild(input);


			// Aggiungi un event listener per l'evento submit
			createFolderForm.addEventListener('submit', function(e) {
				e.preventDefault(); // Impedisce il comportamento predefinito di submit del form
				// Evita che altri listener precedentemente registrati su questo evento vengano "svegliati"
				e.stopImmediatePropagation();
				makeCall("POST", "CreateFolder", createFolderForm, function(req) {

					if (req.readyState == XMLHttpRequest.DONE) {
						var message = req.responseText;
						switch (req.status) {
							case 200:
								self.orchestrator.refresh();
								break;
							case 401:
								// Utente non autorizzato, lo slogga
								window.location.href = "index.html";
								window.sessionStorage.removeItem('username');
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

					self.reset();
				});
			}, false);
		}

	}


	// alert = div che mostra i messaggi di alert
	// formContainer = <div id="div_createFolder"> 
	// orchestrator = riferimento al PageOrchestrator per aggiornare la pagina se necessario
	function CreateDocumentForm(_orchestrator, _alert, _formContainer) {
		this.orchestrator = _orchestrator;
		this.formContainer = _formContainer;
		this.alert = _alert;

		this.reset = function() {
			this.formContainer.style.visibility = "hidden";
			// fare pulizia dei parametri, rimuoviamo l'input hidden se presente
			var hiddenInput = document.querySelector('input[name="fatherFolderid"]');
			if (hiddenInput && hiddenInput.parentElement === this.formContainer) {
				this.formContainer.removeChild(hiddenInput);
			}
		}
		this.show = function() {
			var self = this;
			this.formContainer.style.visibility = "visible";
			var createDocumentForm = document.getElementById("createDocument_form");
			//console.log(createDocumentForm);
			var fatherFolderId = this.formContainer.getAttribute("fatherfolderid");

			// Rimuoviamo eventuali input hidden esistenti prima di aggiungerne uno nuovo
			var existingInput = createDocumentForm.querySelector('input[name="fatherFolderid"]');
			if (existingInput) {
				createDocumentForm.removeChild(existingInput);
			}

			var input = document.createElement("input");
			input.type = "hidden";
			input.name = "fatherFolderid";
			input.value = fatherFolderId;
			createDocumentForm.appendChild(input);
			// Aggiungi un event listener per l'evento submit
			createDocumentForm.addEventListener('submit', function(e) {
				e.preventDefault(); // Impedisce il comportamento predefinito di submit del form
				// Evita che altri listener precedentemente registrati su questo evento vengano "svegliati"
				e.stopImmediatePropagation();

				//console.log(createDocumentForm);
				makeCall("POST", "CreateDocument", createDocumentForm, function(req) {

					if (req.readyState == XMLHttpRequest.DONE) {
						var message = req.responseText;
						switch (req.status) {
							case 200:
								self.orchestrator.refresh();
								break;
							case 401:
								// Utente non autorizzato, lo slogga
								window.location.href = "index.html";
								window.sessionStorage.removeItem('username');
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

					self.reset();
				});
			}, { once: true }); // Usa { once: true } per rimuovere l'event listener dopo la prima esecuzione
		}

	}

	// finestra modale di conferma quando cerco di modificare un documento
	// modalContainer = <div id="modal"> contenitore della finestra modale
	function AlertContainer(_modalContainer, _alertContainer, _orchestrator) {
		this.modalContainer = _modalContainer;
		this.alert = _alertContainer;
		this.orchestrator = _orchestrator;
		this.modalText = document.getElementById("elementToDelete");
		this.closeBtn = document.querySelector(".close-btn");
		this.confirmBtn = document.getElementById("confirmBtn");
		this.cancelBtn = document.getElementById("cancelBtn");

		// mostra la finestra modale di conferma
		// bool == true se l'elemento da eliminare è un documento, false se è una cartella 
		this.show = function(elementId, elementName, bool) {
			this.modalText.textContent = elementName;
			if (bool)
				this.modalContainer.setAttribute("docToDeleteId", elementId);
			else
				this.modalContainer.setAttribute("folderToDeleteId", elementId);
			this.modalContainer.style.display = "block";
		}

		var self = this;
		// Chiude la finestra modale
		this.close = function() {
			self.modalContainer.removeAttribute("folderToDeleteId");
			self.modalContainer.removeAttribute("docToDeleteId");
			self.modalContainer.style.display = "none";
		}

		// Chiudi la finestra modale quando si clicca sulla X
		this.closeBtn.onclick = this.close;

		// Chiudi la finestra modale quando si clicca sul pulsante Annulla
		this.cancelBtn.onclick = this.close;

		// Gestione comportamento del pulsante Conferma
		this.confirmBtn.onclick = function() {
			// gestisci eliminazioni
			if (self.modalContainer.getAttribute("docToDeleteId") != null) {
				// ELIMINAZIONE DI UN DOCUMENTO
				var docToDeleteId = self.modalContainer.getAttribute("docToDeleteId");
				//console.log("eliminare documento con id: " + docToDeleteId);
				makeCall("GET", 'DeleteElement?documentId=' + docToDeleteId, null,
					function(req) {
						if (req.readyState == XMLHttpRequest.DONE) {
							var message = req.responseText;
							switch (req.status) {
								case 200:
									self.orchestrator.refresh();
									break;
								case 401:
									// Utente non autorizzato, lo slogga
									window.location.href = "index.html";
									window.sessionStorage.removeItem('username');
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
				// ELIMINAZIONE DI UNA CARTELLA
				var folderToDeleteId = self.modalContainer.getAttribute("folderToDeleteId");
				//console.log("eliminare cartella con id: " + folderToDeleteId);
				makeCall("GET", 'DeleteElement?folderId=' + folderToDeleteId, null,
					function(req) {
						if (req.readyState == XMLHttpRequest.DONE) {
							var message = req.responseText;
							switch (req.status) {
								case 200:
									self.orchestrator.refresh();
									break;
								case 401:
									// Utente non autorizzato, lo slogga
									window.location.href = "index.html";
									window.sessionStorage.removeItem('username');
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
			self.close();
		}

		// Chiudi la finestra modale se si clicca al di fuori della finestra modale
		window.onclick = function(event) {
			if (event.target == modal) {
				self.close();
			}
		}
	}

	// Pannello che mostra le informazioni del documento
	// docInfoContainer = <div id="div_documentInfo"> div che contine il pannello
	function DocumentInfo(_docInfoContainer, _alertContainer) {
		this.docInfoContainer = _docInfoContainer;
		this.docName = document.getElementById("docName");
		this.documentName = document.getElementById("documentName");
		this.documentOwner = document.getElementById("documentOwner");
		this.documentDate = document.getElementById("documentDate");
		this.documentType = document.getElementById("documentType");
		this.documentDigest = document.getElementById("documentDigest");

		this.alert = _alertContainer;
		var self = this;

		this.close = function() {
			self.docInfoContainer.style.visibility = "hidden";
		}

		this.show = function(docId) {
			if (isNaN(docId))
				self.alert.textContent = "Identificativo del documento non valido";
			else {
				makeCall("GET", 'GetDocument?documentId=' + docId, null,
					function(req) {
						if (req.readyState == XMLHttpRequest.DONE) {
							var message = req.responseText;
							switch (req.status) {
								case 200:
									var docInfo = JSON.parse(req.responseText);
									self.docName.textContent = docInfo.name;
									self.documentName.textContent = docInfo.name;
									self.documentOwner.textContent = docInfo.owner;
									self.documentDate.textContent = docInfo.creationDate;
									self.documentType.textContent = docInfo.type;
									self.documentDigest.textContent = docInfo.digest;
									self.docInfoContainer.style.visibility = "visible";
									break;
								case 401:
									// Utente non autorizzato, lo slogga
									window.location.href = "index.html";
									window.sessionStorage.removeItem('username');
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

		}


	}




	// Handles page loading and refreshing
	function PageOrchestrator() {
		var alert = document.getElementById("id_alert");
		var treeContainer = document.getElementById("id_tree");
		var treeBodyContainer = document.getElementById("id_treebody");
		var formContainerFolder = document.getElementById("div_createFolder");
		var formContainerDocument = document.getElementById("div_createDocument");
		var modalContainer = document.getElementById("modal");
		var docInfoContainer = document.getElementById("div_documentInfo");

		this.start = function() {
			// Visualizzazione messaggio di benvenuto personalizzato
			var usrNameContainer = document.getElementById("id_username");
			usrNameContainer.textContent = sessionStorage.getItem('username');

			folderTree = new FolderTree(alert, treeContainer, treeBodyContainer, this);

			//Creazione dell'oggetto createFolderForm
			createFolderForm = new CreateFolderForm(this, alert, formContainerFolder);

			//creazione dell'oggetto createDocumentForm
			createDocumentForm = new CreateDocumentForm(this, alert, formContainerDocument);

			// Caricamento della finestra modale di conferma per eliminare un elemento
			alertContainer = new AlertContainer(modalContainer, alert, this);

			// Caricamento del pannello che contiene informazioni sul documento
			documentInfo = new DocumentInfo(docInfoContainer, alert);


			document.querySelector("a[href='Logout']").addEventListener('click', () => {
				window.sessionStorage.removeItem('username');
			})
		};

		this.refresh = function() { // currentMission initially null at start
			alert.textContent = "";        // not null after creation of status change

			// restart del folderTree
			folderTree.reset();
			folderTree.show();
			createFolderForm.reset();
			createDocumentForm.reset();
			documentInfo.close();
		};
	}
}	
