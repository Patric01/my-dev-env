-- Users table
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR,
    email VARCHAR,
    password VARCHAR,
    role VARCHAR,
    created_at TIMESTAMP
);

-- Elements table
CREATE TABLE elements (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR,
    type VARCHAR,
    default_duration INT,
    location VARCHAR,
    created_at TIMESTAMP
);

-- Reservations table
CREATE TABLE reservations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    element_id BIGINT REFERENCES elements(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP
);

-- Tournaments table
CREATE TABLE tournaments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR,
    start_date TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP
);

-- Participants table
CREATE TABLE participants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tournament_id BIGINT REFERENCES tournaments(id),
    user_id BIGINT REFERENCES users(id),
    registered_at TIMESTAMP
);

-- Chat Logs table
CREATE TABLE chat_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    prompt TEXT,
    response TEXT,
    created_at TIMESTAMP
);
