package models

import (
	"errors"
	"fmt"
	"math"
	"net/url"
	"strings"
	"time"
)

type Location struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Address     string `json:"address"`
	DairyCattle bool   `json:"dairyCattle"`
	Role        Role   `json:"role"`
}
type Animal struct {
	ID         int     `json:"id"`
	LocationID int     `json:"locationID"`
	Name       string  `json:"name"`
	BirthDate  string  `json:"birthDate"`
	Gender     string  `json:"gender"`
	EntryDate  string  `json:"entryDate"`
	DeathDate  *string `json:"deathDate"`
	SaleDate   *string `json:"saleDate"`
	PhotoURL   string  `json:"photoURL"`
}
type MilkProduction struct {
	ID         int     `json:"id"`
	LocationID int     `json:"locationID"`
	Date       string  `json:"date"`
	Quantity   float64 `json:"quantity"`
}
type MilkPrice struct {
	ID         int     `json:"id"`
	LocationID int     `json:"locationID"`
	Date       string  `json:"date"`
	Price      float64 `json:"price"`
}
type Expense struct {
	ID           int     `json:"id"`
	LocationID   int     `json:"locationID"`
	Description  string  `json:"description"`
	Value        float64 `json:"value"`
	Date         string  `json:"date"`
	Paid         bool    `json:"paid"`
	Installments int     `json:"installments"`
}
type Income struct {
	ID          int     `json:"id"`
	LocationID  int     `json:"locationID"`
	Description string  `json:"description"`
	Value       float64 `json:"value"`
	Date        string  `json:"date"`
	Received    bool    `json:"received"`
}

func Text(v, label string, max int) error {
	if strings.TrimSpace(v) == "" || len(v) > max {
		return fmt.Errorf("%s é obrigatório e deve ter até %d caracteres", label, max)
	}
	return nil
}
func Date(v string) error {
	t, err := time.Parse("2006-01-02", v)
	if err != nil || t.Year() < 1 {
		return errors.New("informe uma data válida no formato AAAA-MM-DD")
	}
	return nil
}
func Positive(v float64) error {
	if v <= 0 || math.IsNaN(v) || math.IsInf(v, 0) || v > 999999999999.99 {
		return errors.New("informe um valor maior que zero e menor que 1 trilhão")
	}
	return nil
}
func (a *Animal) Validate() error {
	a.Name = strings.TrimSpace(a.Name)
	if err := Text(a.Name, "nome do animal", 100); err != nil {
		return err
	}
	if err := Date(a.BirthDate); err != nil {
		return err
	}
	if err := Date(a.EntryDate); err != nil {
		return err
	}
	today := time.Now().Format("2006-01-02")
	if a.BirthDate > today || a.EntryDate > today || a.EntryDate < a.BirthDate {
		return errors.New("nascimento e entrada não podem ser futuros; entrada deve ser após o nascimento")
	}
	if a.Gender != "female" && a.Gender != "male" {
		return errors.New("selecione fêmea ou macho")
	}
	for _, d := range []*string{a.DeathDate, a.SaleDate} {
		if d != nil {
			if err := Date(*d); err != nil {
				return err
			}
			if *d < a.EntryDate || *d > today {
				return errors.New("saída deve estar entre a entrada e hoje")
			}
		}
	}
	if a.DeathDate != nil && a.SaleDate != nil {
		return errors.New("um animal não pode ter venda e óbito ao mesmo tempo")
	}
	if a.PhotoURL != "" {
		u, err := url.Parse(a.PhotoURL)
		if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" || len(a.PhotoURL) > 2048 {
			return errors.New("informe uma URL http ou https válida para a foto")
		}
	}
	return nil
}
