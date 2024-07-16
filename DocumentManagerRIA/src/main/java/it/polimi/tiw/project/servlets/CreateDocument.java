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

@WebServlet("/CreateDocument")
@MultipartConfig
public class CreateDocument extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public CreateDocument() {
		super();
		// TODO Auto-generated constructor stub
	}

	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		HttpSession s = request.getSession();
		User u = (User) s.getAttribute("user");
		String id = request.getParameter("fatherFolderid");
		Integer folderID;
		System.out.println("id: " + id);
		if (id == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Parametro fatherFolderid non valido");
			return;
		}
		try {
			folderID = Integer.parseInt(id);
			System.out.println("folderID: " + folderID);
		} catch (NumberFormatException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Parametro folderID con formato non numerico");
			return;
		}
		// prendo il nome della cartella che devo creare
		String foldername = request.getParameter("documentName");
		System.out.println("foldername: " + foldername);
		if (foldername == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Parametro folderName non è valido");
			return;
		}
		// prendo il nome del documento che devo creare
		String type = request.getParameter("type");
		System.out.println("type: " + type);
		if (type == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Parametro type non è valido");
			return;
		}
		DocumentDAO dDAO = new DocumentDAO(connection);
		try {
			dDAO.createDocument(folderID, foldername, u.getUsername(),type);
			
		} catch (SQLException e) {
			//throw new ServletException(e);
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Failure in user's document creation");
			return;
		}
		response.setStatus(HttpServletResponse.SC_OK);
		response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("Il documento è stata aggiunto con successo!");
	}

}
