package controllers

import (
	"api/repositories"
	"api/responses"
	"database/sql"
	"encoding/json"
	"errors"
	"github.com/gorilla/mux"
	"github.com/lib/pq"
	"io"
	"log"
	"net/http"
	"strconv"
)

func decode(w http.ResponseWriter, r *http.Request, dst interface{}) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if err := d.Decode(dst); err != nil {
		responses.Erro(w, 400, errors.New("dados inválidos; verifique os campos e tipos do formulário"))
		return false
	}
	if err := d.Decode(&struct{}{}); err != io.EOF {
		responses.Erro(w, 400, errors.New("envie apenas um objeto JSON"))
		return false
	}
	return true
}
func failure(w http.ResponseWriter, err error) {
	var p *pq.Error
	switch {
	case errors.Is(err, repositories.ErrForbidden):
		responses.Erro(w, 403, err)
	case errors.Is(err, repositories.ErrLastAdmin):
		responses.Erro(w, 409, err)
	case errors.Is(err, sql.ErrNoRows):
		responses.Erro(w, 404, errors.New("registro não encontrado"))
	case errors.As(err, &p) && p.Code == "23505":
		responses.Erro(w, 409, errors.New("já existe um registro com esses dados"))
	case errors.As(err, &p) && (p.Code == "23503" || p.Code == "23514" || p.Code.Class() == "22"):
		responses.Erro(w, 400, errors.New("dados incompatíveis com o cadastro"))
	default:
		log.Printf("database: %v", err)
		responses.Erro(w, 500, errors.New("não foi possível concluir a operação; tente novamente"))
	}
}
func positiveID(w http.ResponseWriter, r *http.Request, key string) (int, bool) {
	id, err := strconv.Atoi(mux.Vars(r)[key])
	if err != nil || id < 1 {
		responses.Erro(w, 400, errors.New("identificador inválido"))
		return 0, false
	}
	return id, true
}
