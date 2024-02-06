package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

var (
	DatabaseConnectionString = ""
	Port                     = 0
	SecretKey                []byte
)

func Carregar() {
	var erro error

	if erro = godotenv.Load(); erro != nil {
		log.Fatal(erro)
	}

	Port, erro = strconv.Atoi(os.Getenv("API_PORT"))
	if erro != nil {
		Port = 5000
	}

	DB_Porta, erro := strconv.Atoi(os.Getenv("DB_PORT"))
	if erro != nil {
		Port = 5000
	}

	DatabaseConnectionString = fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable TimeZone=America/Porto_Velho",
		os.Getenv("DB_HOST"),
		DB_Porta,
		os.Getenv("DB_USERNAME"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"))

	SecretKey = []byte(os.Getenv("JWT_SECRET"))
}
