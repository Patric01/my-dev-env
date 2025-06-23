INSERT INTO users (name, email, password, role, created_at) VALUES
('user', 'user@endava.com', '12345678', 'user', NOW());

INSERT INTO elements (name, type, default_duration, location, created_at) VALUES
('Ping Pong', 'ping-pong', 15, 'Timisoara', NOW()),
('PlayStation', 'playstation', 15, 'Timisoara', NOW()),
('Fussball', 'fussball', 15, 'Timisoara', NOW()),
('Massage', 'massage', 15, 'Timisoara', NOW());
