-- Upgrade the original 2024 database without deleting records.
BEGIN;
ALTER TABLE animal ADD COLUMN IF NOT EXISTS name VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE animal ADD COLUMN IF NOT EXISTS photo_url VARCHAR(2048) NOT NULL DEFAULT '';
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='animal' AND column_name='date_sale')
 AND NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='animal' AND column_name='sale_date') THEN
  ALTER TABLE animal RENAME COLUMN date_sale TO sale_date;
 END IF;
END $$;
UPDATE animal a SET photo_url=COALESCE((SELECT p.photo_url FROM animal_photo p WHERE p.animal_id=a.id ORDER BY p.id LIMIT 1),'') WHERE a.photo_url='';
ALTER TABLE expense ALTER COLUMN value TYPE NUMERIC(14,2) USING value::numeric;
ALTER TABLE income ALTER COLUMN value TYPE NUMERIC(14,2) USING value::numeric;
ALTER TABLE milk_price ALTER COLUMN price TYPE NUMERIC(14,4) USING price::numeric;
ALTER TABLE milk_production ALTER COLUMN quantity TYPE NUMERIC(14,3) USING quantity::numeric;
UPDATE expense SET installments=1 WHERE installments IS NULL;
ALTER TABLE expense ALTER COLUMN installments SET DEFAULT 1;
ALTER TABLE milk_price DROP CONSTRAINT IF EXISTS milk_price_date_key;
CREATE UNIQUE INDEX IF NOT EXISTS milk_price_location_date_unique ON milk_price(location_id,date);
CREATE INDEX IF NOT EXISTS animal_location_idx ON animal(location_id);
CREATE INDEX IF NOT EXISTS expense_location_date_idx ON expense(location_id,date);
CREATE INDEX IF NOT EXISTS income_location_date_idx ON income(location_id,date);
CREATE INDEX IF NOT EXISTS milk_production_location_date_idx ON milk_production(location_id,date);
COMMIT;
