package it.polimi.tiw.project.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import it.polimi.tiw.project.beans.Folder;

public class FolderDAO {
	Connection connection;
	
	public FolderDAO(Connection connection) {
		this.connection = connection;
	}
	
	public List<Folder> fetchRootFoldersAndDocument(String owner) throws SQLException{
		String query = "SELECT  username, id, owner, name, creation_date, father FROM user, folder  WHERE username = owner AND username = ? AND father is ?";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setString(1, owner);
			pstatement.setObject(2, null);
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results, credential check failed
					return null;
				else {
					List<Folder> rootFolders = new ArrayList<Folder>();
					while(result.next()) {
						Folder folder = new Folder(result.getInt("id"), result.getString("owner"), result.getString("name"), result.getDate("creation_date"), result.getInt("father"));
						DocumentDAO dDAO = new DocumentDAO(connection);
						folder.setDocuments(dDAO.fetchDocumentsByFolderId(folder.getId()));
						rootFolders.add(folder);
					}
					return rootFolders;
				}
			}
		}
	}
	
	// restituisce solo le sotto cartelle di una cartella e anche i documenti
	public void fetchSubFoldersAndDocument(Folder f) throws SQLException {
		Folder sf = null;
		String query = "SELECT id, owner, name, creation_date, father FROM folder WHERE father = ?";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, f.getId());
			try (ResultSet result = pstatement.executeQuery();) {
				while (result.next()) {
					sf = new Folder(result.getInt("id"), result.getString("owner"), result.getString("name"), result.getDate("creation_date"), result.getInt("father"));
					DocumentDAO dDAO = new DocumentDAO(connection);
					sf.setDocuments(dDAO.fetchDocumentsByFolderId(sf.getId()));
					fetchSubFoldersAndDocument(sf);
					f.addSubFolder(sf);
				}
			}
		}
	}	
	
	//restituisce solo le cartelle padre
	public List<Folder> fetchAllTree(String owner) throws SQLException{
		List<Folder> tree = fetchRootFoldersAndDocument(owner);
		if(tree != null) {
			for(Folder f : tree) {
				fetchSubFoldersAndDocument(f);
			}
		}
		return tree;
	}	
	
	public void createFolder(int folderId, String name, String owner) throws SQLException{			
		//per prendere la data e formattarla
		LocalDate date = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedDate = date.format(formatter);
        String query = "INSERT INTO Folder (owner, name, creation_date, father) VALUES (?, ?, ?, ?)";
        try (PreparedStatement pstatement = connection.prepareStatement(query)) {
            pstatement.setString(1, owner);
            pstatement.setString(2, name);
            pstatement.setString(3, formattedDate);
            if (folderId == 0) {
                pstatement.setNull(4, java.sql.Types.INTEGER); // uso di setNull per i valori null
            } else {
                pstatement.setInt(4, folderId);
            }
            pstatement.executeUpdate(); // Uso di executeUpdate per INSERT, UPDATE, DELETE
        }
	}
	
	
    
    private List<Integer> findSubfolders(int folderId) throws SQLException {
        List<Integer> subfolderIds = new ArrayList<>();
        String query = "SELECT id FROM Folder WHERE father = ?";
        try (PreparedStatement pstatement = connection.prepareStatement(query)) {
            pstatement.setInt(1, folderId);
            try (ResultSet result = pstatement.executeQuery()) {
                while (result.next()) {
                    subfolderIds.add(result.getInt("id"));
                }
            }
        }
        return subfolderIds;
    }
    
    

    // Metodo ricorsivo per eliminare una cartella e tutte le sue sottocartelle e documenti
    public void deleteFolder(int folderId) throws SQLException {
        // Trova tutte le sottocartelle
        List<Integer> subfolderIds = findSubfolders(folderId);

        // Elimina ricorsivamente tutte le sottocartelle
        for (int subfolderId : subfolderIds) {
            deleteFolder(subfolderId);
        }

        // Elimina tutti i documenti nella cartella corrente
        DocumentDAO dDAO = new DocumentDAO(connection);
        dDAO.deleteDocumentsInFolder(folderId);

        // Elimina la cartella corrente
        String query = "DELETE FROM Folder WHERE id = ?";
        try (PreparedStatement pstatement = connection.prepareStatement(query)) {
            pstatement.setInt(1, folderId);
            pstatement.executeUpdate();
        }
    }
	
	
}
