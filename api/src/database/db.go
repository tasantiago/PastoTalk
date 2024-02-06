package database

import (
	"api/config"
	"database/sql"

	_ "github.com/lib/pq"
)

func Connect() (*sql.DB, error) {
	db, erro := sql.Open("postgres", config.DatabaseConnectionString)
	if erro != nil {
		return nil, erro
	}

	if erro = db.Ping(); erro != nil {
		db.Close()
		return nil, erro
	}

	return db, nil
}
