CREATE DATABASE adapt_ai;
\c adapt_ai

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_token VARCHAR(500),
    role VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS revoked_tokens (
    id SERIAL PRIMARY KEY,
    jti VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS caregiver (
	id SERIAL PRIMARY KEY, 
	name VARCHAR(80) NOT NULL, 
	age INTEGER NOT NULL, 
    occupation VARCHAR(80),
    license VARCHAR(80),
	user_id INTEGER NOT NULL, 
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS patient (
	id SERIAL PRIMARY KEY, 
	name VARCHAR(80) NOT NULL, 
	age INTEGER NOT NULL, 
    occupation VARCHAR(80) NOT NULL,
    topic VARCHAR(80) NOT NULL,
    disorder_details TEXT NOT NULL,
    is_diagnosed VARCHAR(80) NOT NULL,
    level VARCHAR(80) NOT NULL,
    user_id INTEGER NOT NULL UNIQUE,
	caregiver_id INTEGER,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users (id),
	FOREIGN KEY(caregiver_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS feedback (
	id SERIAL PRIMARY KEY, 
	user_id INTEGER NOT NULL,
	feedback_text TEXT NOT NULL, 
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	FOREIGN KEY(user_id) REFERENCES users (id)
);