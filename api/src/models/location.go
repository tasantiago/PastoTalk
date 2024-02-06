package models

import (
	"time"

	"github.com/google/uuid"
)

type UserLocationAssociation struct {
	UserID     uuid.UUID `json:"userID"`
	LocationID int       `json:"locationID"`
	User       User      `json:"user"`
	Location   Location  `json:"location"`
}

type Location struct {
	ID              int              `json:"id"`
	Name            string           `json:"name"`
	Address         string           `json:"address"`
	DairyCattle     bool             `json:"dairyCattle"`
	Animals         []Animal         `json:"animals"`
	MilkProductions []MilkProduction `json:"milkProductions"`
	Expenses        []Expense        `json:"expenses"`
	Incomes         []Income         `json:"incomes"`
}

type MilkProduction struct {
	ID         int       `json:"id"`
	Date       time.Time `json:"date"`
	Quantity   float64   `json:"quantity"`
	LocationID int       `json:"locationID"`
}

type Expense struct {
	ID           int       `json:"id"`
	Description  string    `json:"description"`
	Value        float64   `json:"value"`
	Date         time.Time `json:"date"`
	Paid         bool      `json:"paid"`
	Installments int       `json:"installments"`
	LocationID   int       `json:"locationID"`
}

type Income struct {
	ID          int       `json:"id"`
	Description string    `json:"description"`
	Value       float64   `json:"value"`
	Date        time.Time `json:"date"`
	Received    bool      `json:"received"`
	LocationID  int       `json:"locationID"`
}

type MilkPrice struct {
	ID         int       `json:"id"`
	Date       time.Time `json:"date"`
	Price      float64   `json:"price"`
	LocationID int       `json:"locationID"`
}
