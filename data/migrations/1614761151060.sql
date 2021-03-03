-- create new database 
 CREATE DATABASE lab14;
 
-- populate your new database
psql -f /data/schema.sql -d lab14
 psql -f /data/seed.sql -d lab14
 
-- make copy of lab14 database .
 CREATE DATABASE lab14_normal WITH TEMPLATE lab14;

-- Create authors table 
CREATE TABLE AUTHORS (id SERIAL PRIMARY KEY, name VARCHAR(255));

--Insert all authors name from books table to authors table 
INSERT INTO authors(name) SELECT DISTINCT author FROM books;

-- Add column to books call author 
ALTER TABLE books ADD COLUMN author_id INT;

-- Update author_id from books 
UPDATE books SET author_id=author.id FROM (SELECT * FROM authors) AS author WHERE books.author = author.name;

--Drop authors column form books table 
ALTER TABLE books DROP COLUMN author;


--make author_id foregin ket and refrence to authors.id
ALTER TABLE books ADD CONSTRAINT fk_authors FOREIGN KEY (author_id) REFERENCES authors(id);


