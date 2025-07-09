CREATE TABLE reservation_guests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reservation_id BIGINT REFERENCES reservations(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    invited_at TIMESTAMP DEFAULT NOW()
);