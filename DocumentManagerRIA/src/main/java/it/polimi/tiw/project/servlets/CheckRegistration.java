package it.polimi.tiw.project.servlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringEscapeUtils;

import it.polimi.tiw.project.beans.User;
import it.polimi.tiw.project.dao.UserDAO;
import it.polimi.tiw.project.utils.ConnectionHandler;

@WebServlet("/CheckRegistration")
@MultipartConfig
public class CheckRegistration extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Connection connection = null;

	public CheckRegistration() {
		super();
	}

	public void init() throws ServletException {
		connection = ConnectionHandler.getConnection(getServletContext());
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// obtain and escape parameters
		String usrn = StringEscapeUtils.escapeJava(request.getParameter("usernameR"));
		String pwd = StringEscapeUtils.escapeJava(request.getParameter("pwdR"));
		String repeatpwd = StringEscapeUtils.escapeJava(request.getParameter("repeatpwdR"));
		String email = StringEscapeUtils.escapeJava(request.getParameter("emailR"));

		if (usrn == null || pwd == null || repeatpwd == null || email == null || usrn.isEmpty() || pwd.isEmpty()
				|| repeatpwd.isEmpty() || email.isEmpty()) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Credentials must be not null");
			return;
		}
		
		// Le password non coincidono
		if (!pwd.equals(repeatpwd)) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("Passwords do not match");
			return;
		}

		UserDAO usrDAO = new UserDAO(connection);
		User u = null;

		try {
			// Controlla se l'utente esiste già
			u = usrDAO.checkExistence(usrn, pwd,email);
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_BAD_GATEWAY);
			response.getWriter().println("Database error while checking user existence");
			return;
		}

		if (u != null) {
			// L'utente esiste già
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("The user already exists");
			return;
		}
		
		if(!isValidEmail(email)) {
			// Il formato della mail non è valido
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			response.getWriter().println("The email format is not valid");
			return;
		}

		try {
			// Crea un nuovo utente
			usrDAO.createUser(usrn, pwd, email);
			u = new User(usrn, pwd, email);
			// Imposta altri attributi di 'u' se necessario
		} catch (SQLException e) {
			response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			response.getWriter().println("Database error while creating user");
			return;
		}

		// Imposta l'utente nella sessione
		request.getSession().setAttribute("user", u);
		response.setStatus(HttpServletResponse.SC_OK);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().println(usrn);

	}
	
	public void destroy() {
		try {
			ConnectionHandler.closeConnection(connection);
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
	private static boolean isValidEmail(String email) {
		String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        if (email == null) {
            return false;
        }
        
        Pattern pattern = Pattern.compile(EMAIL_REGEX);
        Matcher matcher = pattern.matcher(email);
        return matcher.matches();
    }

}
