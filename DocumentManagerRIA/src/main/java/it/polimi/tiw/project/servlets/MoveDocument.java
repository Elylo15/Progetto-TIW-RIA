package it.polimi.tiw.project.servlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import it.polimi.tiw.project.beans.User;
import it.polimi.tiw.project.dao.DocumentDAO;
import it.polimi.tiw.project.utils.ConnectionHandler;

@WebServlet("/MoveDocument")
@MultipartConfig
public class MoveDocument extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// check if the user is logged in
		User u = null;
		HttpSession s = request.getSession();
		if (s.isNew() || s.getAttribute("user") == null) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().println("Non loggato");
			return;
		} else {
			u = (User) s.getAttribute("user");
		}
		//check if the parameters are valid
		String fId = request.getParameter("fatherFolderId");
		Integer folderId;
		String dId = request.getParameter("documentId");
		Integer documentId; 
		if(fId == null || dId == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Parametro non valido");
			return;
		}
		try {
			folderId = Integer.parseInt(fId);
			documentId = Integer.parseInt(dId);
		}catch(NumberFormatException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Parametro con formato non numerico");
			return;
		}
		
		// Update the document's father
		DocumentDAO dDAO = new DocumentDAO(connection);
		try {
			if (dDAO.moveDocumentToFolder(documentId, folderId)) {
				response.setStatus(HttpServletResponse.SC_OK);
				response.setContentType("text/plain");
		        response.setCharacterEncoding("UTF-8");
		        response.getWriter().write("Lo spostamento ha avuto successo!");
			} else {
				response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				response.getWriter().println("Lo spostamento è fallito");
				return;
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}

}
