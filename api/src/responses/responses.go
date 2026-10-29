package responses

import (
	"encoding/json"
	"net/http"
)

func JSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	if status != 204 {
		_ = json.NewEncoder(w).Encode(data)
	}
}
func Erro(w http.ResponseWriter, status int, err error) {
	JSON(w, status, map[string]string{"erro": err.Error()})
}
