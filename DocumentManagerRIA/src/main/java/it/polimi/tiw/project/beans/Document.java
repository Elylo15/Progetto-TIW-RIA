package it.polimi.tiw.project.beans;

import java.util.Date;

public class Document {
	private int id;
	private String owner;
	private String name;
	private Date creationDate;
	private String type;
	private String digest;
	private int father;
	
	public Document(int id, String owner, String name, Date creationDate, String type, String digest, int father) {
		super();
		this.id = id;
		this.owner = owner;
		this.name = name;
		this.creationDate = creationDate;
		this.type = type;
		this.digest = digest;
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

	public void setOwner(String owner) {
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

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getDigest() {
		return digest;
	}

	public void setDigest(String digest) {
		this.digest = digest;
	}

	public int getFather() {
		return father;
	}

	public void setFather(int father) {
		this.father = father;
	}
	
	
	

}
