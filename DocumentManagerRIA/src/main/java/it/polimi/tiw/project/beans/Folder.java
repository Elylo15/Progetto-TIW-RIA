package it.polimi.tiw.project.beans;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Folder {
	private int id;
	private String owner;
	private String name;
	private Date creationDate;
	private int father;
	// stuff to better present the hierarchy
	private List<Folder> subFolders = new ArrayList<Folder>();
	private List<Document> documents = new ArrayList<Document>();
	
	public Folder(int id, String owner, String name, Date creationDate, int father) {
		super();
		this.id = id;
		this.owner = owner;
		this.name = name;
		this.creationDate = creationDate;
		this.father = father;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getOwner() {
		return owner;
	}

	public void setOwnerUsername(String owner) {
		this.owner = owner;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Date getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Date creationDate) {
		this.creationDate = creationDate;
	}

	public int getFather() {
		return father;
	}

	public void setFather(int father) {
		this.father = father;
	}

	public List<Folder> getSubFolders() {
		return subFolders;
	}

	public void addSubFolder(Folder f) {
		subFolders.add(f);
	}
	
	public void removeSubFolder(Folder f) {
		subFolders.remove(f);
	}

	public List<Document> getDocuments() {
		return documents;
	}

	public void setDocuments(List<Document> documents) {
		this.documents = documents;
	}

}
