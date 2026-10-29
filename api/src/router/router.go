package router

import (
	"api/controllers"
	"api/middlewares"
	"github.com/gorilla/mux"
	"net/http"
)

func Gerar() *mux.Router {
	r := mux.NewRouter()
	public := func(p string, h http.HandlerFunc, methods ...string) {
		r.HandleFunc(p, middlewares.Logger(h)).Methods(methods...)
	}
	protected := func(p string, h http.HandlerFunc, methods ...string) {
		r.HandleFunc(p, middlewares.Logger(middlewares.Authenticate(h))).Methods(methods...)
	}
	public("/health", controllers.Health, "GET")
	public("/users", controllers.CreateUser, "POST")
	public("/login", controllers.Login, "POST")
	protected("/me", controllers.Me, "GET", "PUT")
	protected("/dashboard", controllers.Dashboard, "GET")
	protected("/locations", controllers.Locations, "GET", "POST")
	protected("/locations/{locationId}", controllers.Location, "GET", "PUT", "DELETE")
	protected("/locations/{locationId}/members", controllers.Members, "GET", "POST")
	protected("/locations/{locationId}/members/{userId}", controllers.Members, "PUT", "DELETE")
	protected("/locations/{locationId}/{resource:animals|milk-productions|milk-prices|expenses|incomes}", controllers.Records, "GET", "POST")
	protected("/locations/{locationId}/{resource:animals|milk-productions|milk-prices|expenses|incomes}/{recordId}", controllers.Records, "GET", "PUT", "DELETE")
	return r
}
