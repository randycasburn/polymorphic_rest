-- Schema definition for the things and gadgets

-- Drop the tables if they exist
drop table things if exists ;

-- Things
create table things ( id INT primary key, name VARCHAR(45), INT t_size, int weight );

