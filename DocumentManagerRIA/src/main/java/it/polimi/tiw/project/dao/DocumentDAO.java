package it.polimi.tiw.project.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import it.polimi.tiw.project.beans.Document;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class DocumentDAO {
	Connection connection;
	
	public DocumentDAO(Connection connection) {
		this.connection = connection;
	}
	
	public List<Document> fetchDocumentsByFolderId(int fId) throws SQLException{
		String query = "SELECT document.id, document.owner, document.name, document.creation_date, document.type, document.digest, document.father FROM document, folder WHERE folder.id = document.father and folder.id =?";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, fId);
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results, credential check failed
					return null;
				else {
					List<Document> subDocuments = new ArrayList<Document>();
					while(result.next()) {
						Document document = new Document(result.getInt("id"), result.getString("owner"), result.getString("name"), result.getDate("creation_date"), result.getString("type"), result.getString("digest"), result.getInt("father"));
						subDocuments.add(document);
					}
					return subDocuments;
				}
			}
		}
	}

	public Document fetchDocumentById(Integer documentId) throws SQLException {
		String query = "SELECT id, owner, name, creation_date, type, digest, father from document WHERE id = ?";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, documentId);
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results, credential check failed
					return null;
				else {
					result.next();
					Document document = new Document(result.getInt("id"), result.getString("owner"), result.getString("name"), result.getDate("creation_date"), result.getString("type"), result.getString("digest"), result.getInt("father"));
				
					return document;
				}
			}
		}
	}
	

	public boolean moveDocumentToFolder(Integer documentId, Integer fatherFolderId) throws SQLException {
		String query = "UPDATE document SET father = ? WHERE id = ?";
		try (PreparedStatement pstatement = connection.prepareStatement(query);) {
			pstatement.setInt(1, fatherFolderId);
			pstatement.setInt(2, documentId);
			int rowsAffected = pstatement.executeUpdate();
			if (rowsAffected == 1)
				return true;
			else {
				return false;
			}
			
		}
	}

	public void createDocument(int folderId, String name, String owner, String type) throws SQLException{			
		//per prendere la data e formattarla
		LocalDate date = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedDate = date.format(formatter);
        String digest=null;
        //per creare il digest
        try {
        	 digest = genereteDigest(name);
        }catch(NoSuchAlgorithmException e) {
        	e.printStackTrace();
        }
        
        String query = "INSERT INTO Document (owner, name, creation_date,type, digest, father) VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement pstatement = connection.prepareStatement(query)) {
            pstatement.setString(1, owner);
            pstatement.setString(2, name);
            pstatement.setString(3, formattedDate);
            pstatement.setString(4, type);
            pstatement.setString(5, digest);
            pstatement.setInt(6, folderId);
            
            pstatement.executeUpdate(); // Uso di executeUpdate per INSERT, UPDATE, DELETE
        }
	}
	
	public String genereteDigest(String name) throws NoSuchAlgorithmException {
        
		 // Create SHA-1 MessageDigest instance
        MessageDigest md = MessageDigest.getInstance("SHA-1");
        
        // Compute the digest
        byte[] fullDigest = md.digest(name.getBytes());
        
        // Extract the first 16 bytes (128 bits) from the SHA-1 digest
        byte[] truncatedDigest = new byte[16];
        System.arraycopy(fullDigest, 0, truncatedDigest, 0, 16);
        
        // Convert the byte array to a hex string
        StringBuilder hexString = new StringBuilder();
        for (byte b : truncatedDigest) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        
        // Save the hex representation of the truncated digest in a String variable
        return hexString.toString();
        
	}
	
	public void deleteDocument(int documentId) throws SQLException{
		String query = "DELETE FROM document WHERE id= ?";
        try (PreparedStatement pstatement = connection.prepareStatement(query)) {
            pstatement.setInt(1, documentId);
                     
            pstatement.executeUpdate(); // Uso di executeUpdate per INSERT, UPDATE, DELETE
        }
	}
	
	// Metodo per eliminare tutti i documenti in una data cartella
    public void deleteDocumentsInFolder(int folderId) throws SQLException {
        String query = "DELETE FROM Document WHERE father = ?";
        try (PreparedStatement pstatement = connection.prepareStatement(query)) {
            pstatement.setInt(1, folderId);
            pstatement.executeUpdate();
        }
    }
	
}
