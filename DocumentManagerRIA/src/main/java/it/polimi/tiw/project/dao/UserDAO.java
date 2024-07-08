package it.polimi.tiw.project.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import it.polimi.tiw.project.beans.User;

public class UserDAO {
	private Connection con;

	public UserDAO(Connection connection) {
		this.con = connection;
	}

	public User checkCredentials(String usrn, String pwd) throws SQLException {
		String query = "SELECT  username, email, password FROM user  WHERE username = ? AND password =?";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setString(1, usrn);
			pstatement.setString(2, pwd);
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results, credential check failed
					return null;
				else {
					result.next();
					User user = new User(result.getString("username"), result.getString("email"), result.getString("password"));
					return user;
				}
			}
		}
	}
	
	public User checkExistence(String usrn, String pwd, String email) throws SQLException {
		String query = "SELECT  username, email, password FROM user  WHERE username = ? AND password =? AND email = ?";
		try (PreparedStatement pstatement = con.prepareStatement(query);) {
			pstatement.setString(1, usrn);
			pstatement.setString(2, pwd);
			pstatement.setString(3, email);
			try (ResultSet result = pstatement.executeQuery();) {
				if (!result.isBeforeFirst()) // no results, credential check failed
					return null;
				else {
					result.next();
					User user = new User(result.getString("username"), result.getString("email"), result.getString("password"));
					return user;
				}
			}
		}
	}
	
	public void createUser(String usrn, String pwd, String email) throws SQLException {
		  String query = "INSERT INTO user (username, email, password) VALUES (?, ?, ?)";
		    try (PreparedStatement pstatement = con.prepareStatement(query);) {
		        pstatement.setString(1, usrn);
		        pstatement.setString(2, email);
		        pstatement.setString(3, pwd);
		        pstatement.executeUpdate(); // Esegue l'aggiornamento
		    }
	}
}
