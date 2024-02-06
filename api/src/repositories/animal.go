package repositories

import (
	"api/models"
	"database/sql"
)

type animals struct {
	db *sql.DB
}

func NewAnimalsRepository(db *sql.DB) *animals {
	return &animals{db}
}

func (repository *animals) CreateAnimal(animal models.Animal) (int, error) {
	statement, err := repository.db.Prepare(
		"INSERT INTO animal (name, birth_date, gender, entry_date, death_date, sale_date, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
	)
	if err != nil {
		return 0, err
	}
	defer statement.Close()

	var lastInsertID int
	err = statement.QueryRow(
		animal.Name, animal.BirthDate, animal.Gender, animal.EntryDate, animal.DeathDate, animal.SaleDate, animal.LocationID,
	).Scan(&lastInsertID)
	if err != nil {
		return 0, nil
	}

	return lastInsertID, nil
}

func (repository *animals) GetAnimal(animalID int) (models.Animal, error) {
	var animal models.Animal
	row := repository.db.QueryRow(
		"SELECT id, name, birth_date, gender, entry_date, death_date, sale_date, location_id FROM animal WHERE id = $1",
		animalID,
	)

	err := row.Scan(
		&animal.ID, &animal.Name, &animal.BirthDate, &animal.Gender, &animal.EntryDate, &animal.DeathDate, &animal.SaleDate, &animal.LocationID,
	)

	if err != nil {
		return models.Animal{}, err
	}

	return animal, nil
}

func (repository *animals) GetAllAnimalsWithPhotosByLocation(locationID int) ([]models.Animal, error) {
	var animals []models.Animal
	var lastID int
	animalMap := make(map[int]*models.Animal)

	query := `
        SELECT 
            a.id, a.name, a.birth_date, a.gender, a.entry_date, a.death_date, a.date_sale, a.location_id, 
            ap.id, ap.animal_id, ap.photo_url
        FROM animal a
        LEFT JOIN animal_photo ap ON a.id = ap.animal_id
        WHERE a.location_id = $1
    `
	rows, err := repository.db.Query(query, locationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var animalID, photoID int
		var photoURL string
		var photo models.AnimalPhoto
		var animal models.Animal

		err := rows.Scan(
			&animal.ID, &animal.Name, &animal.BirthDate, &animal.Gender,
			&animal.EntryDate, &animal.DeathDate, &animal.SaleDate, &animal.LocationID,
			&photoID, &animalID, &photoURL,
		)
		if err != nil {
			return nil, err
		}

		if animal.ID != lastID {
			animalMap[animal.ID] = &animal
			lastID = animal.ID
		}

		if photoID != 0 {
			photo = models.AnimalPhoto{ID: photoID, AnimalID: animalID, PhotoURL: photoURL}
			animalMap[animal.ID].Photos = append(animalMap[animal.ID].Photos, photo)
		}
	}

	for _, animal := range animalMap {
		animals = append(animals, *animal)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}
	return animals, nil
}

func (repository *animals) UpdateAnimal(animalID int, updateAnimal models.Animal) error {
	_, err := repository.db.Exec(
		"UPDATE animal SET name = $1, birth_date = $2, gender = $3, entry_date = $4, death_date = $5, sale_date = $6, location_id = $7 WHERE id = $8",
		updateAnimal.Name, updateAnimal.BirthDate, updateAnimal.Gender, updateAnimal.EntryDate,
		updateAnimal.DeathDate, updateAnimal.SaleDate, updateAnimal.LocationID, animalID,
	)

	if err != nil {
		return err
	}

	return nil
}

func (repository *animals) DeleteAnimal(animalID int) error {
	_, err := repository.db.Exec("DELETE FROM animal WHERE id = $1", animalID)

	if err != nil {
		return err
	}

	return nil
}

func (repository *animals) CreateAnimalPhoto(photo models.AnimalPhoto) error {
	statement := `INSERT INTO animal_photo (animal_id, photo_url) VALUES ($1, $2) RETURNING id`
	err := repository.db.QueryRow(statement, photo.AnimalID, photo.PhotoURL).Scan(&photo.ID)
	return err
}

func (repository *animals) GetAnimalPhoto(id int) (*models.AnimalPhoto, error) {
	photo := &models.AnimalPhoto{}
	statement := `SELECT id, animal_id, photo_url FROM animal_photo WHERE id = $1`
	row := repository.db.QueryRow(statement, id)
	err := row.Scan(&photo.ID, &photo.AnimalID, &photo.PhotoURL)
	if err != nil {
		return nil, err
	}
	return photo, nil
}

func (repository *animals) GetAllAnimalPhotos(animalID int) ([]*models.AnimalPhoto, error) {
	var photos []*models.AnimalPhoto
	statement := `SELECT id, animal_id, photo_url FROM animal_photo WHERE animal_id = $1`
	rows, err := repository.db.Query(statement, animalID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var photo models.AnimalPhoto
		err := rows.Scan(&photo.ID, &photo.AnimalID, &photo.PhotoURL)
		if err != nil {
			return nil, err
		}
		photos = append(photos, &photo)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}
	return photos, nil
}

func (repository *animals) UpdateAnimalPhoto(photo models.AnimalPhoto) error {
	statement := `UPDATE animal_photo SET animal_id = $1, photo_url = $2 WHERE id = $3`
	_, err := repository.db.Exec(statement, photo.AnimalID, photo.PhotoURL, photo.ID)
	return err
}

func (repository *animals) DeleteAnimalPhoto(id int) error {
	statement := `DELETE FROM animal_photo WHERE id = $1`
	_, err := repository.db.Exec(statement, id)
	return err
}
