package controllers

import (
	"api/models"
	"api/responses"
	"errors"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"net/http"
	"strings"
)

func Members(w http.ResponseWriter, r *http.Request) {
	p := models.Read
	if r.Method != http.MethodGet {
		p = models.Manage
	}
	repo, location, ok := locationScope(w, r, p)
	if !ok {
		return
	}
	defer repo.Close()
	if r.Method == http.MethodGet {
		data, err := repo.Members(r.Context(), location)
		if err != nil {
			failure(w, err)
			return
		}
		responses.JSON(w, 200, data)
		return
	}
	var member models.Member
	var err error
	status := 200
	if r.Method == http.MethodPost {
		var body struct {
			Username string      `json:"username"`
			Role     models.Role `json:"role"`
		}
		if !decode(w, r, &body) {
			return
		}
		body.Username = strings.ToLower(strings.TrimSpace(body.Username))
		if !body.Role.Valid() || body.Username == "" || len(body.Username) > 80 {
			responses.Erro(w, 400, errors.New("informe o nome de usuário e um papel válido"))
			return
		}
		member, err = repo.AddMember(r.Context(), location, body.Username, body.Role)
		status = 201
	} else {
		user, e := uuid.Parse(mux.Vars(r)["userId"])
		if e != nil {
			responses.Erro(w, 400, errors.New("identificador de usuário inválido"))
			return
		}
		var body struct {
			Role models.Role `json:"role"`
		}
		if r.Method == http.MethodPut {
			if !decode(w, r, &body) {
				return
			}
			if !body.Role.Valid() {
				responses.Erro(w, 400, errors.New("selecione um papel válido"))
				return
			}
		} else {
			status = 204
		}
		member, err = repo.ChangeMember(r.Context(), location, user, body.Role, r.Method == http.MethodDelete)
	}
	if err != nil {
		failure(w, err)
		return
	}
	if err = repo.Commit(); err != nil {
		failure(w, err)
		return
	}
	if status == 204 {
		responses.JSON(w, status, nil)
	} else {
		responses.JSON(w, status, member)
	}
}
