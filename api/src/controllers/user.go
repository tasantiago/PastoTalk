package controllers

import (
	"api/auth"
	"api/database"
	"api/models"
	"api/repositories"
	"api/responses"
	"api/security"
	"database/sql"
	"errors"
	"net/http"
	"strings"
)

func CreateUser(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if !decode(w, r, &body) {
		return
	}
	u := models.User{Name: body.Name, Email: body.Email, Username: body.Username}
	if err := u.Validate(); err != nil {
		responses.Erro(w, 400, err)
		return
	}
	if len(body.Password) < 8 || len(body.Password) > 72 {
		responses.Erro(w, 400, errors.New("senha deve ter entre 8 e 72 caracteres"))
		return
	}
	hash, err := security.Hash(body.Password)
	if err != nil {
		failure(w, err)
		return
	}
	u.Password = string(hash)
	u.ID, err = repositories.NewUsersRepository(database.DB).Create(r.Context(), u)
	if err != nil {
		failure(w, err)
		return
	}
	responses.JSON(w, 201, u)
}
func Login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if !decode(w, r, &body) {
		return
	}
	body.Username = strings.ToLower(strings.TrimSpace(body.Username))
	if body.Username == "" || body.Password == "" || len(body.Password) > 72 {
		responses.Erro(w, 400, errors.New("informe usuário e senha"))
		return
	}
	u, err := repositories.NewUsersRepository(database.DB).SearchByUsername(r.Context(), body.Username)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		failure(w, err)
		return
	}
	if err != nil || security.VerifyPassword(u.Password, body.Password) != nil {
		responses.Erro(w, 401, errors.New("usuário ou senha incorretos"))
		return
	}
	token, err := auth.CreateToken(u.ID)
	if err != nil {
		failure(w, err)
		return
	}
	responses.JSON(w, 200, map[string]interface{}{"token": token, "user": map[string]interface{}{"id": u.ID, "nome": u.Name}})
}
func Me(w http.ResponseWriter, r *http.Request) {
	id, _ := auth.ExtractUserID(r)
	repo := repositories.NewUsersRepository(database.DB)
	if r.Method == http.MethodPut {
		var body struct {
			Name     string `json:"name"`
			Email    string `json:"email"`
			Username string `json:"username"`
		}
		if !decode(w, r, &body) {
			return
		}
		u := models.User{Name: body.Name, Email: body.Email, Username: body.Username}
		if err := u.Validate(); err != nil {
			responses.Erro(w, 400, err)
			return
		}
		if err := repo.Update(r.Context(), id, u); err != nil {
			failure(w, err)
			return
		}
	}
	u, err := repo.SearchByID(r.Context(), id)
	if err != nil {
		failure(w, err)
		return
	}
	responses.JSON(w, 200, u)
}
