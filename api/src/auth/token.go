package auth

import (
	"api/config"
	"errors"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"net/http"
	"strings"
	"time"
)

func CreateToken(id uuid.UUID) (string, error) {
	claims := jwt.RegisteredClaims{Issuer: "pastotalk", Subject: id.String(), IssuedAt: jwt.NewNumericDate(time.Now()), ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour))}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(config.SecretKey)
}
func ExtractUserID(r *http.Request) (uuid.UUID, error) {
	parts := strings.Fields(r.Header.Get("Authorization"))
	if len(parts) != 2 || parts[0] != "Bearer" {
		return uuid.Nil, errors.New("token inválido")
	}
	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(parts[1], claims, func(t *jwt.Token) (interface{}, error) { return config.SecretKey, nil }, jwt.WithValidMethods([]string{"HS256"}), jwt.WithIssuer("pastotalk"), jwt.WithExpirationRequired())
	if err != nil || !token.Valid {
		return uuid.Nil, errors.New("sessão inválida ou expirada")
	}
	id, err := uuid.Parse(claims.Subject)
	if err != nil || id == uuid.Nil {
		return uuid.Nil, errors.New("token inválido")
	}
	return id, nil
}
