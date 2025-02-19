## Grade 28/30

## Developers
* [Elisabetta Lollino](https://github.com/Elylo15)
* [Federico Bulloni](https://github.com/Bull0)

## Specifiche del progetto
Versione con JavaScript
 Si realizzi un’applicazione client-server web che modifica le specifiche precedenti come segue:
 * L’applicazione supporta registrazione e login mediante una pagina pubblica con opportune form.
   La registrazione controlla la validità sintattica dell’indirizzo di email e l’uguaglianza tra i campi “password” e “ripeti password”, anche a lato client.
   La registrazione controlla l’unicità dello username.
 * Dopo il login dell’utente, l’intera applicazione è realizzata con un’unica pagina.
 * Ogni interazione dell’utente è gestita senza ricaricare completamente la pagina, ma produce l’invocazione asincrona del server e l’eventuale modifica del contenuto da aggiornare a seguito dell’evento.
 * Errori a lato server devono essere segnalati mediante un messaggio di allerta all’interno della pagina.
 * La funzione di spostamento di un documento è realizzata mediante drag and drop.
 * La funzione di creazione di una sottocartella è realizzata nella pagina HOME mediante un bottone AGGIUNGI SOTTOCARTELLA posto di fianco ad ogni cartella. La pressione del bottone fa apparire un campo di input per l’inserimento del nome della cartella da inserire.
 * La funzione di creazione di un documento è realizzata nella pagina HOME mediante un bottone AGGIUNGI DOCUMENTO posto di fianco ad ogni cartella. La pressione del bottone fa apparire una form di input per l’inserimento dei dati del documento.
 * Si aggiunge una cartella denominata “cestino”. Il drag and drop di un documento o di una cartella nel cestino comporta la cancellazione. Prima di inviare il comando di cancellazione al server l’utente vede una finestra modale di conferma e può decidere se annullare l’operazione o procedere.
   La cancellazione di una cartella comporta la cancellazione integrale e ricorsiva del contenuto dalla base di dati (documenti e cartelle)
