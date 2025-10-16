ALTER TABLE baseline_emotions
  ALTER COLUMN feeling_score TYPE numeric(4,2) USING feeling_score::numeric,
  ALTER COLUMN energy_score  TYPE numeric(4,2) USING energy_score::numeric;

-- Optional: enforce bounds via check constraints (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'baseline_emotions' AND constraint_name = 'baseline_emotions_scores_range'
  ) THEN
    ALTER TABLE baseline_emotions
      ADD CONSTRAINT baseline_emotions_scores_range
      CHECK (feeling_score >= 1 AND feeling_score <= 5 AND energy_score >= 1 AND energy_score <= 5);
  END IF;
END$$;

ALTER TABLE emotion_responses
  ALTER COLUMN perceived_feeling_score TYPE numeric(4,2) USING perceived_feeling_score::numeric,
  ALTER COLUMN perceived_energy_score  TYPE numeric(4,2) USING perceived_energy_score::numeric;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'emotion_responses' AND constraint_name = 'emotion_responses_scores_range'
  ) THEN
    ALTER TABLE emotion_responses
      ADD CONSTRAINT emotion_responses_scores_range
      CHECK (perceived_feeling_score >= 1 AND perceived_feeling_score <= 5
          AND perceived_energy_score >= 1 AND perceived_energy_score <= 5);
  END IF;
END$$;
