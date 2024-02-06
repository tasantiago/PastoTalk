package repositories

import (
	"api/models"
	"database/sql"
	"errors"

	"github.com/google/uuid"
)

type locations struct {
	db *sql.DB
}

func NewLocationsRepository(db *sql.DB) *locations {
	return &locations{db}
}

func (repository *locations) Create(location models.Location, userID uuid.UUID) (int, error) {
	conn, err := repository.db.Begin()
	if err != nil {
		return 0, err
	}

	statement, err := conn.Prepare(
		"INSERT INTO location (name, address, dairy_cattle) VALUES ($1, $2, $3) RETURNING id",
	)
	if err != nil {
		conn.Rollback()
		return 0, err
	}
	defer statement.Close()

	var lastInsertedID int
	err = statement.QueryRow(location.Name, location.Address, location.DairyCattle).Scan(&lastInsertedID)
	if err != nil {
		return 0, err
	}

	_, err = conn.Exec(
		"INSERT INTO user_location_association (user_id, location_id) VALUES ($1, $2)",
		userID, lastInsertedID,
	)

	if err != nil {
		conn.Rollback()
		return 0, err
	}

	if err := conn.Commit(); err != nil {
		return 0, err
	}

	return lastInsertedID, nil
}

func (repository *locations) Read(locationID int) (models.Location, error) {
	var location models.Location
	row := repository.db.QueryRow("SELECT id, name, address, dairy_cattle FROM location WHERE id = $1", locationID)
	err := row.Scan(&location.ID, &location.Name, &location.Address, &location.DairyCattle)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return models.Location{}, errors.New("location not found")
		}
		return models.Location{}, err
	}

	return location, nil
}

func (repository *locations) Update(locationID int, updatedLocation models.Location) error {
	_, err := repository.db.Exec(
		"UPDATE location SET name = $1, address = $2, dairy_cattle = $3 WHERE id = $4",
		updatedLocation.Name, updatedLocation.Address, updatedLocation.DairyCattle, locationID,
	)
	return err
}

func (repository *locations) Delete(locationID int) error {
	_, err := repository.db.Exec("UPDATE location SET is_active = FALSE WHERE id = $1", locationID)
	return err
}

func (repository *locations) AssociationUserLocation(userID uuid.UUID, locationID int) error {
	_, err := repository.db.Exec(
		"INSERT INTO user_location_association (user_id, location_id) Values ($1, $2)",
		userID, locationID,
	)

	return err
}
