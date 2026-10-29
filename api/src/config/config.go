package config

import (
	"fmt"
	"github.com/joho/godotenv"
	"net/url"
	"os"
	"strconv"
	"strings"
)

var DatabaseConnectionString string
var Port int
var SecretKey []byte
var AllowedOrigins []string

func env(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
func Carregar() error {
	_ = godotenv.Load()
	var err error
	Port, err = strconv.Atoi(env("API_PORT", "5000"))
	if err != nil || Port < 1 || Port > 65535 {
		return fmt.Errorf("API_PORT inválida")
	}
	SecretKey = []byte(os.Getenv("JWT_SECRET"))
	if len(SecretKey) < 32 {
		return fmt.Errorf("configure JWT_SECRET com pelo menos 32 caracteres")
	}
	DatabaseConnectionString = os.Getenv("DATABASE_URL")
	if DatabaseConnectionString == "" {
		u := url.URL{Scheme: "postgres", Host: env("DB_HOST", "localhost") + ":" + env("DB_PORT", "5432"), Path: "/" + env("DB_NAME", "controledegado"), User: url.UserPassword(env("DB_USERNAME", "pastotalk"), os.Getenv("DB_PASSWORD"))}
		q := u.Query()
		q.Set("sslmode", env("DB_SSLMODE", "disable"))
		u.RawQuery = q.Encode()
		DatabaseConnectionString = u.String()
	}
	AllowedOrigins = strings.Split(env("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"), ",")
	for i := range AllowedOrigins {
		AllowedOrigins[i] = strings.TrimSpace(AllowedOrigins[i])
	}
	return nil
}
