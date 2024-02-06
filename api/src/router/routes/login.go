package routes

import (
	"api/controllers"
	"net/http"
)

var loginRoute = Route{

	URI:                    "/login",
	Method:                 http.MethodPost,
	Function:               controllers.Login,
	RequiresAuthentication: false,
}
