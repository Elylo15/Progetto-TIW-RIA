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

import com.google.gson.Gson;

import it.polimi.tiw.project.beans.Document;
import it.polimi.tiw.project.beans.User;
import it.polimi.tiw.project.dao.DocumentDAO;
import it.polimi.tiw.project.utils.ConnectionHandler;

@WebServlet("/GetDocument")
@MultipartConfig
public class GetDocument extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
	
    public GetDocument() {
        super();
        // TODO Auto-generated constructor stub
    }

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
		
		//check if the parameter is valid
		String dId = request.getParameter("documentId");
		Integer documentId; 
		if(dId == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Parametro non valido");
			return;
		}
		try {
			documentId = Integer.parseInt(dId);
		}catch(NumberFormatException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Parametro con formato non numerico");
			return;
		}
		DocumentDAO dDAO = new DocumentDAO(connection);
		Document d = null;
		try {
			d = dDAO.fetchDocumentById(documentId);
			if (d == null) {
				response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				response.getWriter().println("IL DOCUMENTO RICHIESTO NON ESISTE!");
				return;
			} else if (!d.getOwner().equals(u.getUsername())) {
				response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				response.getWriter().println("PERMESSI INSUFFICIENTI PER ACCEDERE AL DOCUMENTO!");
				return;
			}
		}catch (SQLException e) {
			//throw new ServletException(e);
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Failure in user's document database extraction");
		}
		
		// Convert rootFolders to JSON
		String json = new Gson().toJson(d);

		// Invia la risposta JSON
		response.setStatus(HttpServletResponse.SC_OK);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(json);
	}

}
