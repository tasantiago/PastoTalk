package auth

import (
	"api/config"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"net/http/httptest"
	"testing"
	"time"
)

func TestTokenBoundary(t *testing.T) {
	config.SecretKey = []byte("testing-secret-with-at-least-32-characters")
	id := uuid.New()
	token, err := CreateToken(id)
	if err != nil {
		t.Fatal(err)
	}
	r := httptest.NewRequest("GET", "/", nil)
	r.Header.Set("Authorization", "Bearer "+token)
	got, err := ExtractUserID(r)
	if err != nil || got != id {
		t.Fatalf("valid token rejected: %v", err)
	}
	for _, h := range []string{token, "Basic " + token, "Bearer malformed"} {
		r.Header.Set("Authorization", h)
		if _, err = ExtractUserID(r); err == nil {
			t.Fatal("invalid authorization accepted")
		}
	}
	cases := []struct {
		method          jwt.SigningMethod
		issuer, subject string
		expires         *jwt.NumericDate
	}{
		{jwt.SigningMethodHS384, "pastotalk", id.String(), jwt.NewNumericDate(time.Now().Add(time.Hour))},
		{jwt.SigningMethodHS256, "other", id.String(), jwt.NewNumericDate(time.Now().Add(time.Hour))},
		{jwt.SigningMethodHS256, "pastotalk", id.String(), nil},
		{jwt.SigningMethodHS256, "pastotalk", id.String(), jwt.NewNumericDate(time.Now().Add(-time.Hour))},
		{jwt.SigningMethodHS256, "pastotalk", "bad", jwt.NewNumericDate(time.Now().Add(time.Hour))},
	}
	for _, c := range cases {
		v, _ := jwt.NewWithClaims(c.method, jwt.RegisteredClaims{Issuer: c.issuer, Subject: c.subject, ExpiresAt: c.expires}).SignedString(config.SecretKey)
		r.Header.Set("Authorization", "Bearer "+v)
		if _, err = ExtractUserID(r); err == nil {
			t.Fatal("invalid claims accepted")
		}
	}
}
