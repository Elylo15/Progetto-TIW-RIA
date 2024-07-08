DROP DATABASE IF EXISTS `dbDocumentManagerRIA`;
CREATE  DATABASE `dbDocumentManagerRIA`;
USE `dbDocumentManagerRIA`;

DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
    `username` VARCHAR(20) PRIMARY KEY,
    `email` VARCHAR(30) NOT NULL UNIQUE,
    `password` VARCHAR(30) NOT NULL
);

DROP TABLE IF EXISTS `Folder`;
CREATE TABLE `Folder` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `owner` VARCHAR(20) NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    `creation_date` DATE NOT NULL,
    `father` INT,
    FOREIGN KEY (`owner`)
        REFERENCES `User` (`username`)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (`father`)
        REFERENCES `Folder` (`id`)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

DROP TABLE IF EXISTS `Document`;
CREATE TABLE `Document` (
	`id` INT AUTO_INCREMENT PRIMARY KEY,
	`owner` VARCHAR(20) NOT NULL,
    `name` VARCHAR(30) NOT NULL,
	`creation_date` DATE NOT NULL,
	`type` ENUM("text", "image", "video") NOT NULL,
	`digest` VARCHAR (128) NOT NULL,
	`father` INT,
	FOREIGN KEY (`owner`) REFERENCES `User` (`username`)
		ON UPDATE CASCADE ON DELETE NO ACTION,
	FOREIGN KEY (`father`) REFERENCES `Folder` (`id`)
		ON UPDATE CASCADE ON DELETE NO ACTION
);

INSERT INTO `user` (`username`, `email`, `password`) 
VALUES 
('mariorossi', 'mariorossi@example.com', 'mario'),
('jane_smith', 'jane@example.com', 'pass456');



INSERT INTO `Folder` (`owner`, `name`, `creation_date`, `father`) 
VALUES 
('mariorossi', 'Folder1', '2024-05-12', NULL),
('mariorossi', 'Folder11', '2024-05-11', 1),
('jane_smith', 'Folder1', '2024-05-12', NULL),
('jane_smith', 'Folder11', '2024-05-10', 3),
('mariorossi', 'Folder12', '2024-05-12', 1),
('mariorossi', 'Folder122', '2024-05-12', 5),
('mariorossi', 'Folder2', '2024-05-12', NULL);

INSERT INTO `Document` (`owner`, `name`, `creation_date`, `type`, `digest`,  `father`) 
VALUES 
('mariorossi', 'Documento1', '2024-05-16', "text", "243535hgfb", 2),
('mariorossi', 'Documento2', '2024-05-11' , "image", "freg5767643", 1),
('jane_smith', 'Documento1', '2024-05-12', "video", "fvrgrb", 4),
('mariorossi', 'Documento3', '2024-05-12', "text", "freg5675436", 1);
