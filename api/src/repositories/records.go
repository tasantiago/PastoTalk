package repositories

import (
	"api/models"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"strings"
)

type Resource struct {
	Table, Selection string
	Columns          []string
}

var Resources = map[string]Resource{
	"animals":          {"animal", `id,name,birth_date AS "birthDate",gender,entry_date AS "entryDate",death_date AS "deathDate",sale_date AS "saleDate",photo_url AS "photoURL",location_id AS "locationID"`, []string{"name", "birth_date", "gender", "entry_date", "death_date", "sale_date", "photo_url"}},
	"milk-productions": {"milk_production", `id,date,quantity,location_id AS "locationID"`, []string{"date", "quantity"}},
	"milk-prices":      {"milk_price", `id,date,price,location_id AS "locationID"`, []string{"date", "price"}},
	"expenses":         {"expense", `id,description,value,date,paid,installments,location_id AS "locationID"`, []string{"description", "value", "date", "paid", "installments"}},
	"incomes":          {"income", `id,description,value,date,received,location_id AS "locationID"`, []string{"description", "value", "date", "received"}},
}

type Records struct {
	DB         *sql.DB
	tx         *sql.Tx
	AccessRole models.Role
}
type connection interface {
	QueryContext(context.Context, string, ...interface{}) (*sql.Rows, error)
	QueryRowContext(context.Context, string, ...interface{}) *sql.Row
	ExecContext(context.Context, string, ...interface{}) (sql.Result, error)
}

func NewRecords(db *sql.DB) *Records { return &Records{DB: db} }
func (s *Records) conn() connection {
	if s.tx != nil {
		return s.tx
	}
	return s.DB
}
func (s *Records) Close() {
	if s.tx != nil {
		_ = s.tx.Rollback()
	}
}
func (s *Records) Commit() error {
	if s.tx != nil {
		return s.tx.Commit()
	}
	return nil
}
func (s *Records) Accessible(ctx context.Context, user uuid.UUID, location int) (bool, error) {
	var ok bool
	err := s.conn().QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM location l JOIN user_location_association a ON a.location_id=l.id WHERE a.user_id=$1 AND l.id=$2 AND l.is_active=TRUE)`, user, location).Scan(&ok)
	return ok, err
}
func jsonRows(rows *sql.Rows) ([]json.RawMessage, error) {
	defer rows.Close()
	data := make([]json.RawMessage, 0)
	for rows.Next() {
		var v json.RawMessage
		if err := rows.Scan(&v); err != nil {
			return nil, err
		}
		data = append(data, v)
	}
	return data, rows.Err()
}
func (s *Records) Locations(ctx context.Context, user uuid.UUID) ([]json.RawMessage, error) {
	rows, err := s.conn().QueryContext(ctx, `SELECT row_to_json(t) FROM (SELECT l.id,l.name,l.address,l.dairy_cattle AS "dairyCattle",a.role FROM location l JOIN user_location_association a ON a.location_id=l.id WHERE a.user_id=$1 AND l.is_active=TRUE ORDER BY l.name,l.id) t`, user)
	if err != nil {
		return nil, err
	}
	return jsonRows(rows)
}
func (s *Records) Location(ctx context.Context, id int) (models.Location, error) {
	var l models.Location
	err := s.conn().QueryRowContext(ctx, "SELECT id,name,address,dairy_cattle FROM location WHERE id=$1 AND is_active=TRUE", id).Scan(&l.ID, &l.Name, &l.Address, &l.DairyCattle)
	l.Role = s.AccessRole
	return l, err
}
func (s *Records) CreateLocation(ctx context.Context, user uuid.UUID, l models.Location) (int, error) {
	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()
	var id int
	err = tx.QueryRowContext(ctx, "INSERT INTO location(name,address,dairy_cattle) VALUES($1,$2,$3) RETURNING id", l.Name, l.Address, l.DairyCattle).Scan(&id)
	if err != nil {
		return 0, err
	}
	_, err = tx.ExecContext(ctx, "INSERT INTO user_location_association(user_id,location_id,role) VALUES($1,$2,'admin')", user, id)
	if err != nil {
		return 0, err
	}
	return id, tx.Commit()
}
func (s *Records) UpdateLocation(ctx context.Context, id int, l models.Location) error {
	_, err := s.conn().ExecContext(ctx, "UPDATE location SET name=$1,address=$2,dairy_cattle=$3 WHERE id=$4 AND is_active=TRUE", l.Name, l.Address, l.DairyCattle, id)
	return err
}
func (s *Records) DeleteLocation(ctx context.Context, id int) error {
	_, err := s.conn().ExecContext(ctx, "UPDATE location SET is_active=FALSE WHERE id=$1", id)
	return err
}
func (s *Records) List(ctx context.Context, res Resource, location int) ([]json.RawMessage, error) {
	rows, err := s.conn().QueryContext(ctx, fmt.Sprintf("SELECT row_to_json(t) FROM (SELECT %s FROM %s WHERE location_id=$1 ORDER BY id DESC) t", res.Selection, res.Table), location)
	if err != nil {
		return nil, err
	}
	return jsonRows(rows)
}
func (s *Records) Get(ctx context.Context, res Resource, location, id int) (json.RawMessage, error) {
	var data json.RawMessage
	err := s.conn().QueryRowContext(ctx, fmt.Sprintf("SELECT row_to_json(t) FROM (SELECT %s FROM %s WHERE location_id=$1 AND id=$2) t", res.Selection, res.Table), location, id).Scan(&data)
	return data, err
}
func (s *Records) Create(ctx context.Context, res Resource, location int, values []interface{}) (int, error) {
	columns := append(append([]string{}, res.Columns...), "location_id")
	values = append(values, location)
	args := make([]string, len(columns))
	for i := range args {
		args[i] = fmt.Sprintf("$%d", i+1)
	}
	var id int
	err := s.conn().QueryRowContext(ctx, fmt.Sprintf("INSERT INTO %s(%s) VALUES(%s) RETURNING id", res.Table, strings.Join(columns, ","), strings.Join(args, ",")), values...).Scan(&id)
	return id, err
}
func (s *Records) Update(ctx context.Context, res Resource, location, id int, values []interface{}) error {
	sets := make([]string, len(res.Columns))
	for i, c := range res.Columns {
		sets[i] = fmt.Sprintf("%s=$%d", c, i+1)
	}
	result, err := s.conn().ExecContext(ctx, fmt.Sprintf("UPDATE %s SET %s WHERE location_id=$%d AND id=$%d", res.Table, strings.Join(sets, ","), len(values)+1, len(values)+2), append(values, location, id)...)
	return affected(result, err)
}
func (s *Records) Delete(ctx context.Context, res Resource, location, id int) error {
	result, err := s.conn().ExecContext(ctx, fmt.Sprintf("DELETE FROM %s WHERE location_id=$1 AND id=$2", res.Table), location, id)
	return affected(result, err)
}
func affected(result sql.Result, err error) error {
	if err != nil {
		return err
	}
	n, err := result.RowsAffected()
	if err == nil && n == 0 {
		return sql.ErrNoRows
	}
	return err
}
func (s *Records) Dashboard(ctx context.Context, user uuid.UUID, location int) (json.RawMessage, error) {
	q := `WITH scope AS (SELECT l.id FROM location l JOIN user_location_association a ON a.location_id=l.id WHERE a.user_id=$1 AND l.is_active=TRUE AND ($2=0 OR l.id=$2)), period AS (SELECT date_trunc('month',CURRENT_DATE)::date AS start,(date_trunc('month',CURRENT_DATE)+interval '1 month')::date AS finish)
 SELECT json_build_object(
 'locations',(SELECT count(*) FROM scope),
 'animals',(SELECT count(*) FROM animal WHERE location_id IN(SELECT id FROM scope) AND death_date IS NULL AND sale_date IS NULL),
 'milk',(SELECT COALESCE(sum(quantity),0) FROM milk_production,period WHERE location_id IN(SELECT id FROM scope) AND date>=period.start AND date<period.finish),
 'income',(SELECT COALESCE(sum(value),0) FROM income,period WHERE location_id IN(SELECT id FROM scope) AND date>=period.start AND date<period.finish),
 'expense',(SELECT COALESCE(sum(value),0) FROM expense,period WHERE location_id IN(SELECT id FROM scope) AND date>=period.start AND date<period.finish),
 'received',(SELECT COALESCE(sum(value),0) FROM income,period WHERE received=TRUE AND location_id IN(SELECT id FROM scope) AND date>=period.start AND date<period.finish),
 'paid',(SELECT COALESCE(sum(value),0) FROM expense,period WHERE paid=TRUE AND location_id IN(SELECT id FROM scope) AND date>=period.start AND date<period.finish),
 'milkByDay',COALESCE((SELECT json_agg(row_to_json(t)) FROM (SELECT date,sum(quantity) AS quantity FROM milk_production,period WHERE location_id IN(SELECT id FROM scope) AND date>=period.start AND date<period.finish GROUP BY date ORDER BY date)t),'[]'::json),
 'period',(SELECT start FROM period))`
	var data json.RawMessage
	err := s.conn().QueryRowContext(ctx, q, user, location).Scan(&data)
	return data, err
}
