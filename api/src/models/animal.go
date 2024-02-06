package models

import (
	"time"
)

// Animal representa a tabela de animais
type Animal struct {
	ID         int           `json:"id,omitempty"`
	Name       string        `json:"name,omitempty"`
	BirthDate  time.Time     `json:"birthDate,omitempty"`
	Gender     string        `json:"gender,omitempty"`
	EntryDate  time.Time     `json:"entryDate,omitempty"`
	DeathDate  *time.Time    `json:"deathDate,omitempty"`
	SaleDate   *time.Time    `json:"saleDate,omitempty"`
	LocationID int           `json:"locationID,omitempty"`
	Photos     []AnimalPhoto `json:"photos,omitempty"`
}

// AnimalPhoto representa a tabela de fotos dos animais
type AnimalPhoto struct {
	ID       int    `json:"id,omitempty"`
	AnimalID int    `json:"animalID,omitempty"`
	PhotoURL string `json:"photoURL,omitempty"`
}
