package it.polimi.tiw.project.servlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;

import it.polimi.tiw.project.beans.Folder;
import it.polimi.tiw.project.beans.User;
import it.polimi.tiw.project.dao.FolderDAO;
import it.polimi.tiw.project.utils.ConnectionHandler;


@WebServlet("/LoadFullTree")
public class LoadFullTree extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;
       
    public LoadFullTree() {
        super();
    }
    
    public void init() throws ServletException {
    	connection = ConnectionHandler.getConnection(getServletContext());
	}


	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String loginpath = getServletContext().getContextPath() + "/index.html";
		User u = null;
		HttpSession s = request.getSession();
		if (s.isNew() || s.getAttribute("user") == null) {
			response.sendRedirect(loginpath);
			return;
		} else {
			u = (User) s.getAttribute("user");
		}
		FolderDAO fDAO = new FolderDAO(connection);
		List<Folder> rootFolders = null;
		try {
			rootFolders = fDAO.fetchAllTree(u.getUsername());
		} catch (SQLException e) {
			//throw new ServletException(e);
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Failure in user's folders database extraction");
		}
		
		// Convert rootFolders to JSON
		String json = new Gson().toJson(rootFolders);
		
        // Invia la risposta JSON
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(json);
	}

	

}
