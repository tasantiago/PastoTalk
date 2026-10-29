package controllers

import (
	"net/http/httptest"
	"strings"
	"testing"
)

func TestStrictRequestDecoding(t *testing.T) {
	for _, body := range []string{`{"name":"ok","role":"admin"}`, `{"name":1}`, `{"name":"ok"} {"name":"second"}`, `[]`} {
		var dst struct {
			Name string `json:"name"`
		}
		w := httptest.NewRecorder()
		r := httptest.NewRequest("POST", "/", strings.NewReader(body))
		if decode(w, r, &dst) || w.Code != 400 {
			t.Fatal("invalid JSON accepted")
		}
	}
}
