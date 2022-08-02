-- Drop and recreate contribution_likes table

DROP TABLE IF EXISTS contribution_likes CASCADE;
CREATE TABLE contribution_likes (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  contribution_id INTEGER REFERENCES contributions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT current_timestamp,
  UNIQUE (user_id, contribution_id)
);
