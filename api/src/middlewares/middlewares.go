package middlewares

import (
	"api/auth"
	"api/database"
	"api/responses"
	"errors"
	"log"
	"net/http"
)

func Logger(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) { log.Printf("%s %s", r.Method, r.URL.Path); next(w, r) }
}
func Authenticate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := auth.ExtractUserID(r)
		if err != nil {
			responses.Erro(w, 401, err)
			return
		}
		var active bool
		err = database.DB.QueryRowContext(r.Context(), "SELECT EXISTS(SELECT 1 FROM users WHERE id=$1 AND is_active=TRUE)", id).Scan(&active)
		if err != nil {
			responses.Erro(w, 503, errors.New("serviço temporariamente indisponível"))
			return
		}
		if !active {
			responses.Erro(w, 401, errors.New("sessão inválida"))
			return
		}
		next(w, r)
	}
}
