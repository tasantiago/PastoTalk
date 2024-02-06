package repositories

import (
	"api/models"
	"database/sql"
	"time"
)

type FinanceRepository struct {
	db *sql.DB
}

func (repository *FinanceRepository) CreateExpense(expense models.Expense) error {
	_, err := repository.db.Exec("INSERT INTO expense (description, value, date, paid, installments, location_id) VALUES ($1, $2, $3, $4, $5, $6)", expense.Description, expense.Value, expense.Date, expense.Paid, expense.Installments, expense.LocationID)
	return err
}

func (repository *FinanceRepository) GetExpense(id int) (models.Expense, error) {
	expense := models.Expense{}
	err := repository.db.QueryRow("SELECT id, description, value, date, paid, installments, location_id FROM expense WHERE id = $1", id).Scan(&expense.ID, &expense.Description, &expense.Value, &expense.Date, &expense.Paid, &expense.Installments, &expense.LocationID)
	if err != nil {
		return models.Expense{}, err
	}
	return expense, nil
}

func (repository *FinanceRepository) GetExpensesInDateRange(startDate, endDate time.Time) ([]models.Expense, error) {
	var expenses []models.Expense

	query := `
        SELECT id, description, value, date, paid, installments, location_id 
        FROM expense 
        WHERE date BETWEEN $1 AND $2
    `
	rows, err := repository.db.Query(query, startDate, endDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var expense models.Expense
		err := rows.Scan(
			&expense.ID, &expense.Description, &expense.Value,
			&expense.Date, &expense.Paid, &expense.Installments, &expense.LocationID,
		)
		if err != nil {
			return nil, err
		}
		expenses = append(expenses, expense)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return expenses, nil
}

func (repository *FinanceRepository) UpdateExpense(expense models.Expense) error {
	_, err := repository.db.Exec("UPDATE expense SET description = $1, value = $2, date = $3, paid = $4, installments = $5, location_id = $6 WHERE id = $7", expense.Description, expense.Value, expense.Date, expense.Paid, expense.Installments, expense.LocationID, expense.ID)
	return err
}

func (repository *FinanceRepository) DeleteExpense(id int) error {
	_, err := repository.db.Exec("DELETE FROM expense WHERE id = $1", id)
	return err
}

func (repository *FinanceRepository) CreateMilkProduction(milkproduction models.MilkProduction) error {
	_, err := repository.db.Exec("INSERT INTO milk_production (date, quantity, location_id) VALUES ($1, $2, $3)", milkproduction.Date, milkproduction.Quantity, milkproduction.LocationID)
	return err
}

func (repository *FinanceRepository) GetMilkProduction(id int) (models.MilkProduction, error) {
	milkProduction := models.MilkProduction{}
	err := repository.db.QueryRow("SELECT id, date, quantity, location_id FROM milk_production WHERE id = $1", id).Scan(&milkProduction.ID, &milkProduction.Date, &milkProduction.Quantity, &milkProduction.LocationID)
	if err != nil {
		return models.MilkProduction{}, err
	}
	return milkProduction, nil
}

func (repository *FinanceRepository) GetAllMilkProductionByLocation(locationID int) ([]models.MilkProduction, error) {
	var productions []models.MilkProduction

	rows, err := repository.db.Query("SELECT id, date, quantity, location_id FROM milk_production WHERE location_id = $1", locationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var milkProduction models.MilkProduction
		err := rows.Scan(
			&milkProduction.ID, &milkProduction.Date, &milkProduction.Quantity, &milkProduction.LocationID,
		)
		if err != nil {
			return nil, err
		}
		productions = append(productions, milkProduction)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return productions, nil
}

func (repository *FinanceRepository) UpdateMilkProduction(milkproduction models.MilkProduction) error {
	_, err := repository.db.Exec("UPDATE milk_production SET date = $1, quantity = $2, location_id = $3 WHERE id = $4", milkproduction.Date, milkproduction.Quantity, milkproduction.LocationID, milkproduction.ID)
	return err
}

func (repository *FinanceRepository) DeleteMilkProduction(id int) error {
	_, err := repository.db.Exec("DELETE FROM milk_production WHERE id = $1", id)
	return err
}

func (repository *FinanceRepository) CreateMilkPrice(milkprice models.MilkPrice) error {
	_, err := repository.db.Exec("INSERT INTO milk_price (date, price, location_id) VALUES ($1, $2, $3)", milkprice.Date, milkprice.Price, milkprice.LocationID)
	return err
}

func (repository *FinanceRepository) GetMilkPrice(id int) (models.MilkPrice, error) {
	milkPrice := models.MilkPrice{}
	err := repository.db.QueryRow("SELECT id, date, price, location_id FROM milk_price WHERE id = $1", id).Scan(&milkPrice.ID, &milkPrice.Date, &milkPrice.Price, &milkPrice.LocationID)
	if err != nil {
		return models.MilkPrice{}, err
	}
	return milkPrice, nil
}

func (repository *FinanceRepository) UpdateMilkPrice(milkprice models.MilkPrice) error {
	_, err := repository.db.Exec("UPDATE milk_price SET date = $1, price = $2, location_id = $3 WHERE id = $4", milkprice.Date, milkprice.Price, milkprice.LocationID, milkprice.ID)
	return err
}

func (repository *FinanceRepository) DeleteMilkPrice(id int) error {
	_, err := repository.db.Exec("DELETE FROM milk_price WHERE id = $1", id)
	return err
}

func (repository *FinanceRepository) CreateIncome(income models.Income) error {
	_, err := repository.db.Exec("INSERT INTO income (description, value, date, received, location_id) VALUES ($1, $2, $3, $4, $5)",
			income.Description, income.Value, income.Date, income.Received, income.LocationID)
	return err
}

func (repository *FinanceRepository) GetIncome(id int) (models.Income, error) {
	income := models.Income{}
	err := repository.db.QueryRow("SELECT id, description, value, date, received, location_id FROM income WHERE id = $1", id).
			Scan(&income.ID, &income.Description, &income.Value, &income.Date, &income.Received, &income.LocationID)
	if err != nil {
			return models.Income{}, err
	}
	return income, nil
}

func (repository *FinanceRepository) UpdateIncome(income models.Income) error {
	_, err := repository.db.Exec("UPDATE income SET description=$2, value=$3, date=$4, received=$5, location_id=$6 WHERE id=$1",
			income.ID, income.Description, income.Value, income.Date, income.Received, income.LocationID)
	return err
}

func (repository *FinanceRepository) DeleteIncome(id int) error {
	_, err := repository.db.Exec("DELETE FROM income WHERE id = $1", id)
	return err
}
