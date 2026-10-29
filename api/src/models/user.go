package models

import (
	"errors"
	"github.com/google/uuid"
	"net/mail"
	"regexp"
	"strings"
)

type User struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Email    string    `json:"email"`
	Username string    `json:"username"`
	Password string    `json:"-"`
}

var usernameFormat = regexp.MustCompile(`^[a-z0-9_.-]+$`)

func (u *User) Validate() error {
	u.Name = strings.TrimSpace(u.Name)
	u.Email = strings.TrimSpace(u.Email)
	u.Username = strings.ToLower(strings.TrimSpace(u.Username))
	if err := Text(u.Name, "nome", 255); err != nil {
		return err
	}
	if !usernameFormat.MatchString(u.Username) || len(u.Username) > 80 {
		return errors.New("usuário deve ter até 80 caracteres: letras, números, ponto, hífen ou sublinhado")
	}
	m, err := mail.ParseAddress(u.Email)
	if err != nil || m.Address != u.Email || len(u.Email) > 255 {
		return errors.New("informe um e-mail válido")
	}
	return nil
}
