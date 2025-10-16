-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  gender TEXT,
  age INT,
  watches_english_movies BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Movie clips
CREATE TABLE IF NOT EXISTS movie_clips (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  file_url TEXT NOT NULL,
  duration_seconds INT NOT NULL
);

-- Unique randomized playlist per user
CREATE TABLE IF NOT EXISTS user_clip_sequences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clip_id INT NOT NULL REFERENCES movie_clips(id) ON DELETE CASCADE,
  sequence_order INT NOT NULL,
  UNIQUE (user_id, clip_id),
  UNIQUE (user_id, sequence_order)
);

-- Tracks user's overall progress
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  last_completed_sequence_order INT NOT NULL DEFAULT 0,
  baseline_emotion_done BOOLEAN NOT NULL DEFAULT FALSE,
  baseline_fatigue_done BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Baseline emotion (pre-study)
CREATE TABLE IF NOT EXISTS baseline_emotions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feeling_score INT NOT NULL CHECK (feeling_score BETWEEN 1 AND 5),
  energy_score INT NOT NULL CHECK (energy_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-clip emotion responses
CREATE TABLE IF NOT EXISTS emotion_responses (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clip_id INT NOT NULL REFERENCES movie_clips(id) ON DELETE CASCADE,
  induced_emotions JSONB NOT NULL, -- e.g. [{"emotion":"Sad","intensity":4}]
  perceived_feeling_score INT NOT NULL CHECK (perceived_feeling_score BETWEEN 1 AND 5),
  perceived_energy_score INT NOT NULL CHECK (perceived_energy_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fatigue logs (VAS-F 18 items)
CREATE TABLE IF NOT EXISTS fatigue_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fatigue_scores JSONB NOT NULL, -- { q1:0-10, ..., q18:0-10 }
  is_baseline BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_clip_sequences_user ON user_clip_sequences(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_responses_user ON emotion_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_fatigue_logs_user ON fatigue_logs(user_id);
