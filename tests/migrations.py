"""Validate legacy migrations in a disposable Docker database.
Run from the project root with the test Compose database running:
DB_PASSWORD=... JWT_SECRET=... PASTOTALK_COMPOSE_PROJECT=pastotalk_recovery python3 tests/migrations.py
"""
from pathlib import Path
import os, subprocess, uuid
root=Path(__file__).resolve().parents[1]
project=os.getenv("PASTOTALK_COMPOSE_PROJECT","pastotalk_recovery")
cmd=["docker","--host=unix:///var/run/docker.sock","compose","-p",project,"exec","-T","db"]
database="pastotalk_migration_"+uuid.uuid4().hex
subprocess.run(cmd+["createdb","-U","pastotalk",database],check=True,cwd=root)
fixtures="""
INSERT INTO users(id,name,email,username,password) VALUES
 ('00000000-0000-0000-0000-000000000001','Pessoa 1','p1@example.com','migration_1','fixture'),
 ('00000000-0000-0000-0000-000000000002','Pessoa 2','p2@example.com','migration_2','fixture');
INSERT INTO location(name,address) VALUES ('Fazenda','Zona rural');
INSERT INTO user_location_association(user_id,location_id) SELECT id,1 FROM users;
INSERT INTO animal(birth_date,gender,entry_date,date_sale,location_id) VALUES ('2020-01-01','female','2021-01-01','2022-01-01',1);
INSERT INTO animal_photo(animal_id,photo_url) VALUES (1,'https://example.com/photo.jpg');
INSERT INTO income(description,value,date,location_id) VALUES ('Venda',123.45,'2026-10-01',1);
INSERT INTO milk_production(date,quantity,location_id) VALUES ('2026-10-01',125.75,1);
"""
checks="""
DO $$ BEGIN
 IF (SELECT count(*) FROM user_location_association WHERE role='admin')<>2 THEN RAISE EXCEPTION 'legacy rights lost'; END IF;
 IF (SELECT quantity FROM milk_production WHERE location_id=1)<>125.750 THEN RAISE EXCEPTION 'milk records lost'; END IF;
 IF (SELECT value FROM income WHERE location_id=1)<>123.45 THEN RAISE EXCEPTION 'money lost'; END IF;
 IF (SELECT sale_date FROM animal WHERE id=1)<>'2022-01-01'::date THEN RAISE EXCEPTION 'sale date lost'; END IF;
 IF (SELECT photo_url FROM animal WHERE id=1)<>'https://example.com/photo.jpg' THEN RAISE EXCEPTION 'photo lost'; END IF;
END $$;
INSERT INTO location(name,address) VALUES ('Nova fazenda','Zona rural');
INSERT INTO user_location_association(user_id,location_id) VALUES ('00000000-0000-0000-0000-000000000001',2);
DO $$ BEGIN
 IF (SELECT role FROM user_location_association WHERE location_id=2)<>'viewer' THEN RAISE EXCEPTION 'wrong default'; END IF;
 BEGIN
  UPDATE user_location_association SET role='owner' WHERE location_id=2;
  RAISE EXCEPTION 'invalid role accepted';
 EXCEPTION WHEN check_violation THEN NULL;
 END;
END $$;
"""
sql=(root/"tests/fixtures/original.sql").read_text()+"\n"+fixtures
for _ in range(2):
 for name in ["001_complete.sql","002_members.sql"]:
  sql+="\n"+(root/"api/sql/migrations"/name).read_text()
sql+="\n"+checks
subprocess.run(cmd+["psql","-U","pastotalk","-d",database,"-v","ON_ERROR_STOP=1"],input=sql,text=True,cwd=root,check=True,stdout=subprocess.DEVNULL)
print("PASS: migrations preserve roles, records, sale dates, photos, amounts; rerunnable with constraints.")
print("Disposable validation database:",database)
