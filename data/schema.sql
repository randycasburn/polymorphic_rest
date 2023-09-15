-- Schema definition for the things and gadgets

-- Drop the tables if they exist
drop table if exists things ;

-- Things
create table things ( id INT primary key, name VARCHAR(45) );

