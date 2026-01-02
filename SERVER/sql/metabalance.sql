CREATE DATABASE metabalance CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE metabalance;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    gender ENUM('male','female','other'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password, phone, gender) VALUES
('Teszt Felhasználó', 'test@example.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36i0c3y5e0ie/5W0aR1d5eK', '06301234567', 'other');
