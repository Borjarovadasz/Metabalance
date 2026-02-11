-- Metabalance database schema
DROP DATABASE IF EXISTS metabalance;
CREATE DATABASE metabalance CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE metabalance;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    gender ENUM('male','female','other','unknown') DEFAULT 'unknown',
    role ENUM('user','admin') DEFAULT 'user',
    profile_image LONGTEXT,
    active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Goals table
CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('VIZ','ALVAS','KALORIA','HANGULAT','TESTSULY','LEPES') NOT NULL,
    target_value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_goals_user_type (user_id, type, active)
);

-- Measurements table
CREATE TABLE measurements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('VIZ','ALVAS','KALORIA','HANGULAT','TESTSULY','LEPES') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20),
    recorded_at DATETIME NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_measurements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_measurements_user_date (user_id, recorded_at),
    INDEX idx_measurements_type_date (type, recorded_at)
);

-- Errors table
CREATE TABLE errors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    message TEXT NOT NULL,
    stack TEXT,
    url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_errors_user_date (user_id, created_at)
);

-- Seed admin user (password: Admin123!)
INSERT INTO users (first_name, last_name, email, password, role, active) VALUES
('Admin', 'User', 'admin@example.com', '$2a$10$k0bezuu9wHtkHgOWbzQ/JuXkNClg43.rC0aZf0ocqXvmnUDpOwWW2', 'admin', 1);


CREATE TABLE errors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  url VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_errors_user_date (user_id, created_at)
);
