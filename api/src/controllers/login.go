package controllers

import (
	"api/auth"
	"api/database"
	"api/models"
	"api/repositories"
	"api/responses"
	"api/security"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
)

func Login(w http.ResponseWriter, r *http.Request) {
	corpoRequisicao, err := io.ReadAll(r.Body)
	if err != nil {
		responses.Erro(w, http.StatusUnprocessableEntity, err)
		return
	}

	var user models.User

	if err = json.Unmarshal(corpoRequisicao, &user); err != nil {
		responses.Erro(w, http.StatusBadRequest, err)
		return
	}

	db, err := database.Connect()
	if err != nil {
		responses.Erro(w, http.StatusInternalServerError, err)
		return
	}

	defer db.Close()

	repository := repositories.NewUsersRepository(db)
	userSavedInDB, err := repository.SearchByUsername(user.Username)
	if err != nil {
		responses.Erro(w, http.StatusInternalServerError, err)
		return
	}

	if err = security.VerifyPassword(userSavedInDB.Password, user.Password); err != nil {
		responses.Erro(w, http.StatusUnauthorized, err)
		return
	}

	token, err := auth.CreateToken(userSavedInDB.ID)
	if err != nil {
		responses.Erro(w, http.StatusInternalServerError, err)
		return
	}

	loginResponse := models.AuthData{
		Token: token,
		User: struct {
			ID   uuid.UUID `json:"id"`
			Name string    `json:"nome"`
		}{
			ID:   userSavedInDB.ID,
			Name: userSavedInDB.Name,
		},
	}

	responses.JSON(w, http.StatusOK, loginResponse)

}
