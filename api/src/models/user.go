package models

import (
	"api/security"
	"errors"
	"strings"
	"time"

	"github.com/badoux/checkmail"
	"github.com/google/uuid"
)

// User representa a tabela de usuários
type User struct {
	ID        uuid.UUID `json:"id,omitempty"`
	Name      string    `json:"name,omitempty"`
	Email     string    `json:"email,omitempty"`
	Username  string    `json:"username,omitempty"`
	Password  string    `json:"password,omitempty"`
	CreatedAt time.Time `json:"createdat,omitempty"`
}

func (user *User) Prepare(stage string) error {
	if erro := user.format(stage); erro != nil {
		return erro
	}

	if erro := user.validate(stage); erro != nil {
		return erro
	}

	return nil
}

func (user *User) validate(stage string) error {
	if user.Name == "" {
		return errors.New("The name is required and cannot be blank.")
	}
	if user.Username == "" {
		return errors.New("The username is required and cannot be blank.")
	}
	if user.Email == "" {
		return errors.New("The name is required and cannot be blank.")
	}

	if erro := checkmail.ValidateFormat(user.Email); erro != nil {
		return errors.New("The name is required and cannot be blank.")
	}

	if stage == "register" && user.Password == "" {
		return errors.New("Email is not valid")
	}

	return nil
}

func (user *User) format(stage string) error {
	user.Name = strings.TrimSpace(user.Name)
	user.Username = strings.TrimSpace(user.Username)
	user.Email = strings.TrimSpace(user.Email)

	if stage == "register" {
		passwordWithHash, erro := security.Hash(user.Password)
		if erro != nil {
			return erro
		}

		user.Password = string(passwordWithHash)
	}

	return nil
}
