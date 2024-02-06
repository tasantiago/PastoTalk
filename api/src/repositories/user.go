package repositories

import (
	"api/models"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
)

type users struct {
	db *sql.DB
}

func NewUsersRepository(db *sql.DB) *users {
	return &users{db}
}

func (repository users) Create(user models.User) (uuid.UUID, error) {
	statement, err := repository.db.Prepare(
		"INSERT INTO users (name, email, username, password) VALUES ($1, $2, $3, $4) RETURNING id",
	)
	if err != nil {
		return uuid.Nil, err
	}
	defer statement.Close()

	var lastInsertedID uuid.UUID
	err = statement.QueryRow(user.Name, user.Email, user.Username, user.Password).Scan(&lastInsertedID)
	if err != nil {
		return uuid.Nil, err
	}

	return lastInsertedID, nil
}

func (repository users) Search(nameOrUsername string) ([]models.User, error) {
	nameOrUsername = fmt.Sprintf("%%%s%%", nameOrUsername)

	rows, err := repository.db.Query(
		"SELECT id, name, username, email, created_at FROM users WHERE name LIKE $1 OR username LIKE $2",
		nameOrUsername, nameOrUsername,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User

	for rows.Next() {
		var user models.User

		if err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Username,
			&user.Email,
			&user.CreatedAt,
		); err != nil {
			return nil, err
		}

		users = append(users, user)
	}
	return users, nil
}

func (repository users) SearchByID(ID uuid.UUID) (models.User, error) {
	rows, err := repository.db.Query(
		"SELECT id, name, username, email, created_at FROM users WHERE id = $1",
		ID,
	)
	if err != nil {
		return models.User{}, err
	}
	defer rows.Close()

	var user models.User

	if rows.Next() {
		if err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Username,
			&user.Email,
			&user.CreatedAt,
		); err != nil {
			return models.User{}, err
		}
	}

	return user, nil
}

func (repository users) Update(ID uuid.UUID, user models.User) error {
	statement, err := repository.db.Prepare("UPDATE users SET name = $1, username = $2, email=$3 WHERE id = $4")
	if err != nil {
		return err
	}
	defer statement.Close()

	if _, err := statement.Exec(user.Name, user.Username, user.Email, ID); err != nil {
		return err
	}

	return nil
}

func (repository users) Delete(ID uuid.UUID) error {
	statement, err := repository.db.Prepare("UPDATE users SET is_active = FALSE WHERE id = $1")
	if err != nil {
		return err
	}
	defer statement.Close()

	if _, err := statement.Exec(ID); err != nil {
		return err
	}

	return nil
}

func (repository users) SearchByUsername(username string) (models.User, error) {
	row, err := repository.db.Query("SELECT id, name, password FROM users WHERE username = $1", username)
	if err != nil {
		return models.User{}, nil
	}
	defer row.Close()

	var user models.User
	if row.Next() {
		if err := row.Scan(&user.ID, &user.Name, &user.Password); err != nil {
			return models.User{}, err
		}
	}
	return user, nil
}

func (repository users) GetLocationsForUser(userID uuid.UUID) ([]int, error) {
	var locationIDs []int

	rows, err := repository.db.Query("SELECT location_id FROM user_location_association WHERE user_id = $1", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var locationID int
		err := rows.Scan(&locationID)
		if err != nil {
			return nil, err
		}
		locationIDs = append(locationIDs, locationID)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return locationIDs, nil
}
