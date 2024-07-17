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
import it.polimi.tiw.project.dao.FolderDAO;
import it.polimi.tiw.project.utils.ConnectionHandler;

@WebServlet("/CreateFolder")
@MultipartConfig
public class CreateFolder extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public CreateFolder() {
		super();
		// TODO Auto-generated constructor stub
	}

	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		User u = null;
		HttpSession s = request.getSession();
		if (s.isNew() || s.getAttribute("user") == null) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.getWriter().println("Non loggato");
			return;
		} else {
			u = (User) s.getAttribute("user");
		}
		// prendo id della cartella in cui si vuole aggiungere una sottocartella
		String id = request.getParameter("fatherFolderid");
		Integer folderID;
		if (id == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Parametro fatherFolderid non valido");
			return;
		}
		try {
			folderID = Integer.parseInt(id);
		} catch (NumberFormatException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Parametro folderID con formato non numerico");
			return;
		}
		// prendo il nome della cartella che devo creare
		String foldername = request.getParameter("folderName");
		if (foldername == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Parametro folderName non è valido");
			return;
		}

		FolderDAO fDAO = new FolderDAO(connection);
		try {
			fDAO.createFolder(folderID, foldername, u.getUsername());

		} catch (SQLException e) {
			// throw new ServletException(e);
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Failure in user's folder creation");
			return;
		}

		response.setStatus(HttpServletResponse.SC_OK);
		response.setContentType("text/plain");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write("La cartella è stata aggiunta con successo!");
	}

}
