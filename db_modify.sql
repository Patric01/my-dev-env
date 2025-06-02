-- Step 0: Login with DBeaver and open new script for the "app" database

-- Step 1: Create the new schema
CREATE SCHEMA IF NOT EXISTS gaming AUTHORIZATION postgres;

-- Step 2: Create tables within the 'gaming' schema

-- Users table
CREATE TABLE gaming.users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR,
    email VARCHAR,
    role VARCHAR,
    created_at TIMESTAMP
);

-- Elements table
CREATE TABLE gaming.elements (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR,
    type VARCHAR,
    default_duration INT,
    location VARCHAR,
    created_at TIMESTAMP
);

-- Reservations table
CREATE TABLE gaming.reservations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT REFERENCES gaming.users(id),
    element_id BIGINT REFERENCES gaming.elements(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP
);

-- Tournaments table
CREATE TABLE gaming.tournaments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR,
    start_date TIMESTAMP,
    created_by BIGINT REFERENCES gaming.users(id),
    created_at TIMESTAMP
);

-- Participants table
CREATE TABLE gaming.participants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tournament_id BIGINT REFERENCES gaming.tournaments(id),
    user_id BIGINT REFERENCES gaming.users(id),
    registered_at TIMESTAMP
);

-- Chat Logs table
CREATE TABLE gaming.chat_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT REFERENCES gaming.users(id),
    prompt TEXT,
    response TEXT,
    created_at TIMESTAMP
);
