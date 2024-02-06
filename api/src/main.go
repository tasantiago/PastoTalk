package main

import (
	"api/config"
	"api/router"
	"fmt"
	"log"
	"net/http"

	"github.com/rs/cors"
)

func main() {

	config.Carregar()

	r := router.Gerar()

	fmt.Printf("Escutando na porta %d \n", config.Port)
	// Configurar o CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"}, // All origins
		AllowedMethods: []string{"GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"},
	})

	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", config.Port), c.Handler(r)))
}
