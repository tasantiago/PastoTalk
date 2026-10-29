package repositories

import (
	"api/models"
	"context"
	"database/sql"
	"github.com/google/uuid"
)

type Users struct{ DB *sql.DB }

func NewUsersRepository(db *sql.DB) *Users { return &Users{DB: db} }
func (s *Users) Create(ctx context.Context, u models.User) (uuid.UUID, error) {
	id := uuid.New()
	_, err := s.DB.ExecContext(ctx, "INSERT INTO users(id,name,email,username,password) VALUES($1,$2,$3,$4,$5)", id, u.Name, u.Email, u.Username, u.Password)
	return id, err
}
func (s *Users) SearchByUsername(ctx context.Context, name string) (models.User, error) {
	var u models.User
	err := s.DB.QueryRowContext(ctx, "SELECT id,name,email,username,password FROM users WHERE username=$1 AND is_active=TRUE", name).Scan(&u.ID, &u.Name, &u.Email, &u.Username, &u.Password)
	return u, err
}
func (s *Users) SearchByID(ctx context.Context, id uuid.UUID) (models.User, error) {
	var u models.User
	err := s.DB.QueryRowContext(ctx, "SELECT id,name,email,username FROM users WHERE id=$1 AND is_active=TRUE", id).Scan(&u.ID, &u.Name, &u.Email, &u.Username)
	return u, err
}
func (s *Users) Update(ctx context.Context, id uuid.UUID, u models.User) error {
	_, err := s.DB.ExecContext(ctx, "UPDATE users SET name=$1,email=$2,username=$3 WHERE id=$4 AND is_active=TRUE", u.Name, u.Email, u.Username, id)
	return err
}
