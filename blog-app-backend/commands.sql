CREATE TABLE blogs ( id SERIAL PRIMARY KEY, author text, url text NOT NULL, title text NOT NULL, likes int DEFAULT 0);

insert into blogs (author, url, title) values ('Michael Chan', 'https://reactpatterns.com/', 'React patterns'); 

insert into blogs (author, url, title) values ('Edsger W. Dijkstra', 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', 'Go To Statement Considered Harmful'); 

insert into blogs (author, url, title) values ('Edsger W. Dijkstra', 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html', 'Canonical string reduction');