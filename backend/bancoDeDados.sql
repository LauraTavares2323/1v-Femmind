create database Femmind;
use Femmind;

create table users(
	id INT AUTO_INCREMENT PRIMARY KEY,
	name varchar(255),
    email varchar(255),
    password varchar(255)
);