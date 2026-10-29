-- Preserve existing permissions; new associations default to read-only.
BEGIN;
ALTER TABLE user_location_association ADD COLUMN IF NOT EXISTS role VARCHAR(10) NOT NULL DEFAULT 'admin';
ALTER TABLE user_location_association ALTER COLUMN role SET DEFAULT 'viewer';
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='user_location_association'::regclass AND conname='membership_role') THEN
  ALTER TABLE user_location_association ADD CONSTRAINT membership_role CHECK(role IN('admin','editor','viewer'));
 END IF;
END $$;
CREATE INDEX IF NOT EXISTS association_location_idx ON user_location_association(location_id);
COMMIT;
