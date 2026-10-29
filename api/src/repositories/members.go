package repositories

import (
	"api/models"
	"context"
	"errors"
	"github.com/google/uuid"
)

var ErrForbidden = errors.New("seu papel nesta propriedade não permite esta operação")
var ErrLastAdmin = errors.New("a propriedade precisa manter pelo menos um administrador ativo")

// All writes and membership changes lock the property before checking access.
func (s *Records) Authorize(ctx context.Context, user uuid.UUID, location int, p models.Permission) error {
	if p != models.Read {
		tx, err := s.DB.BeginTx(ctx, nil)
		if err != nil {
			return err
		}
		s.tx = tx
		var id int
		if err = tx.QueryRowContext(ctx, "SELECT id FROM location WHERE id=$1 AND is_active=TRUE FOR UPDATE", location).Scan(&id); err != nil {
			s.Close()
			return err
		}
	}
	err := s.conn().QueryRowContext(ctx, `SELECT a.role FROM user_location_association a JOIN location l ON l.id=a.location_id WHERE a.user_id=$1 AND l.id=$2 AND l.is_active=TRUE`, user, location).Scan(&s.AccessRole)
	if err != nil {
		s.Close()
		return err
	}
	if !s.AccessRole.Allows(p) {
		s.Close()
		return ErrForbidden
	}
	return nil
}
func (s *Records) Members(ctx context.Context, location int) ([]models.Member, error) {
	rows, err := s.conn().QueryContext(ctx, `SELECT u.id,u.name,u.username,a.role FROM user_location_association a JOIN users u ON u.id=a.user_id WHERE a.location_id=$1 AND u.is_active=TRUE ORDER BY u.name,u.id`, location)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	members := make([]models.Member, 0)
	for rows.Next() {
		var m models.Member
		if err = rows.Scan(&m.ID, &m.Name, &m.Username, &m.Role); err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	return members, rows.Err()
}
func (s *Records) AddMember(ctx context.Context, location int, name string, role models.Role) (models.Member, error) {
	var m models.Member
	err := s.conn().QueryRowContext(ctx, "SELECT id,name,username FROM users WHERE username=$1 AND is_active=TRUE", name).Scan(&m.ID, &m.Name, &m.Username)
	if err != nil {
		return m, err
	}
	_, err = s.conn().ExecContext(ctx, "INSERT INTO user_location_association(user_id,location_id,role) VALUES($1,$2,$3)", m.ID, location, role)
	m.Role = role
	return m, err
}
func (s *Records) ChangeMember(ctx context.Context, location int, user uuid.UUID, role models.Role, remove bool) (models.Member, error) {
	var m models.Member
	err := s.conn().QueryRowContext(ctx, `SELECT u.id,u.name,u.username,a.role FROM user_location_association a JOIN users u ON u.id=a.user_id WHERE a.location_id=$1 AND a.user_id=$2 AND u.is_active=TRUE`, location, user).Scan(&m.ID, &m.Name, &m.Username, &m.Role)
	if err != nil {
		return m, err
	}
	if m.Role == models.RoleAdmin && (remove || role != models.RoleAdmin) {
		var count int
		err = s.conn().QueryRowContext(ctx, `SELECT count(*) FROM user_location_association a JOIN users u ON u.id=a.user_id WHERE a.location_id=$1 AND a.role='admin' AND u.is_active=TRUE`, location).Scan(&count)
		if err != nil {
			return m, err
		}
		if count <= 1 {
			return m, ErrLastAdmin
		}
	}
	if remove {
		_, err = s.conn().ExecContext(ctx, "DELETE FROM user_location_association WHERE location_id=$1 AND user_id=$2", location, user)
	} else {
		_, err = s.conn().ExecContext(ctx, "UPDATE user_location_association SET role=$1 WHERE location_id=$2 AND user_id=$3", role, location, user)
		m.Role = role
	}
	return m, err
}
