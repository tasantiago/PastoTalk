package router

import (
	"api/router/routes"

	"github.com/gorilla/mux"
)

func Gerar() *mux.Router {
	r := mux.NewRouter()

	return routes.Configure(r)
}
