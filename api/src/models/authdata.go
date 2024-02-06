package models

import "github.com/google/uuid"

type AuthData struct {
	Token string `json:"token"`
	User  struct {
		ID   uuid.UUID `json:"id"`
		Name string    `json:"nome"`
	} `json:"user"`
}
