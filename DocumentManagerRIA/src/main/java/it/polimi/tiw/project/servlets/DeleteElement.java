package it.polimi.tiw.project.servlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import it.polimi.tiw.project.beans.User;
import it.polimi.tiw.project.dao.DocumentDAO;
import it.polimi.tiw.project.dao.FolderDAO;
import it.polimi.tiw.project.utils.ConnectionHandler;


@WebServlet("/DeleteElement")
public class DeleteElement extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
    
    public DeleteElement() {
        super();
        // TODO Auto-generated constructor stub
    }
    
    public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
    }

	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// check if the user is logged in
		String loginpath = getServletContext().getContextPath() + "/index.html";
		User u = null;
		HttpSession s = request.getSession();
		if (s.isNew() || s.getAttribute("user") == null) {
			response.sendRedirect(loginpath);
			return;
		} else {
			u = (User) s.getAttribute("user");
		}
		//prendo id della cartella in cui si vuole aggiungere una sottocartella
		String documentid = request.getParameter("documentId");
		String folderid = request.getParameter("folderId");
		Integer documentID, folderID;
		if((documentid == null && folderid == null) || (documentid != null && folderid != null)) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Parametri non validi");
			return;
		}
		
		if(documentid!=null) {
			try {
				documentID = Integer.parseInt(documentid);
			} catch (NumberFormatException e) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Parametro documentID con formato non numerico");
				return;
			}
			DocumentDAO dDAO = new DocumentDAO(connection);
			try {
				dDAO.deleteDocument(documentID);

			} catch (SQLException e) {
				// throw new ServletException(e);
				response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				response.getWriter().println("Failure in user's document deletion");
				return;
			}

			response.setStatus(HttpServletResponse.SC_OK);
			response.setContentType("text/plain");
	        response.setCharacterEncoding("UTF-8");
	        response.getWriter().write("Il documento è stato eliminato con successo!");
        }
		else if(folderid!=null) {
			try {
				folderID = Integer.parseInt(folderid);
			} catch (NumberFormatException e) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				response.getWriter().println("Parametro folderID con formato non numerico");
				return;
			}
			FolderDAO fDAO = new FolderDAO(connection);
			try {
				fDAO.deleteFolder(folderID);

			} catch (SQLException e) {
				// throw new ServletException(e);
				response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				response.getWriter().println("Failure in user's folder deletion");
				return;
			}

			response.setStatus(HttpServletResponse.SC_OK);
			response.setContentType("text/plain");
	        response.setCharacterEncoding("UTF-8");
	        response.getWriter().write("La cartella è stata eliminata con successo!");
		}
	}

}
