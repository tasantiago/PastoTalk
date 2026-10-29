package controllers

import (
	"api/auth"
	"api/database"
	"api/models"
	"api/repositories"
	"api/responses"
	"errors"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
	"strings"
)

func locationScope(w http.ResponseWriter, r *http.Request, p models.Permission) (*repositories.Records, int, bool) {
	id, ok := positiveID(w, r, "locationId")
	if !ok {
		return nil, 0, false
	}
	user, _ := auth.ExtractUserID(r)
	repo := repositories.NewRecords(database.DB)
	if err := repo.Authorize(r.Context(), user, id, p); err != nil {
		failure(w, err)
		return nil, 0, false
	}
	return repo, id, true
}
func Locations(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.ExtractUserID(r)
	repo := repositories.NewRecords(database.DB)
	if r.Method == http.MethodGet {
		data, err := repo.Locations(r.Context(), user)
		if err != nil {
			failure(w, err)
			return
		}
		responses.JSON(w, 200, data)
		return
	}
	var l models.Location
	if !decode(w, r, &l) || !validateLocation(w, &l) {
		return
	}
	id, err := repo.CreateLocation(r.Context(), user, l)
	if err != nil {
		failure(w, err)
		return
	}
	l.ID = id
	l.Role = models.RoleAdmin
	responses.JSON(w, 201, l)
}
func validateLocation(w http.ResponseWriter, l *models.Location) bool {
	if l.Role != "" {
		responses.Erro(w, 400, errors.New("altere o papel pela gestão da equipe"))
		return false
	}
	l.Name = strings.TrimSpace(l.Name)
	l.Address = strings.TrimSpace(l.Address)
	for _, err := range []error{models.Text(l.Name, "nome", 100), models.Text(l.Address, "endereço", 255)} {
		if err != nil {
			responses.Erro(w, 400, err)
			return false
		}
	}
	return true
}
func Location(w http.ResponseWriter, r *http.Request) {
	p := models.Read
	if r.Method != http.MethodGet {
		p = models.Manage
	}
	repo, id, ok := locationScope(w, r, p)
	if !ok {
		return
	}
	defer repo.Close()
	switch r.Method {
	case http.MethodDelete:
		if err := repo.DeleteLocation(r.Context(), id); err != nil {
			failure(w, err)
			return
		}
		if err := repo.Commit(); err != nil {
			failure(w, err)
			return
		}
		responses.JSON(w, 204, nil)
	case http.MethodPut:
		var l models.Location
		if !decode(w, r, &l) || !validateLocation(w, &l) {
			return
		}
		if err := repo.UpdateLocation(r.Context(), id, l); err != nil {
			failure(w, err)
			return
		}
		if err := repo.Commit(); err != nil {
			failure(w, err)
			return
		}
		l.ID = id
		l.Role = repo.AccessRole
		responses.JSON(w, 200, l)
	default:
		l, err := repo.Location(r.Context(), id)
		if err != nil {
			failure(w, err)
			return
		}
		responses.JSON(w, 200, l)
	}
}
func Records(w http.ResponseWriter, r *http.Request) {
	p := models.Read
	if r.Method != http.MethodGet {
		p = models.Write
	}
	repo, location, ok := locationScope(w, r, p)
	if !ok {
		return
	}
	defer repo.Close()
	key := mux.Vars(r)["resource"]
	res, ok := repositories.Resources[key]
	if !ok {
		responses.Erro(w, 404, errors.New("módulo não encontrado"))
		return
	}
	id := 0
	if mux.Vars(r)["recordId"] != "" {
		id, ok = positiveID(w, r, "recordId")
		if !ok {
			return
		}
	}
	switch r.Method {
	case http.MethodGet:
		if id == 0 {
			data, err := repo.List(r.Context(), res, location)
			if err != nil {
				failure(w, err)
				return
			}
			responses.JSON(w, 200, data)
		} else {
			data, err := repo.Get(r.Context(), res, location, id)
			if err != nil {
				failure(w, err)
				return
			}
			responses.JSON(w, 200, data)
		}
	case http.MethodDelete:
		if err := repo.Delete(r.Context(), res, location, id); err != nil {
			failure(w, err)
			return
		}
		if err := repo.Commit(); err != nil {
			failure(w, err)
			return
		}
		responses.JSON(w, 204, nil)
	default:
		values, ok := recordValues(w, r, key, location)
		if !ok {
			return
		}
		status := 200
		if r.Method == http.MethodPost {
			var err error
			id, err = repo.Create(r.Context(), res, location, values)
			if err != nil {
				failure(w, err)
				return
			}
			status = 201
		} else {
			if err := repo.Update(r.Context(), res, location, id, values); err != nil {
				failure(w, err)
				return
			}
		}
		data, err := repo.Get(r.Context(), res, location, id)
		if err != nil {
			failure(w, err)
			return
		}
		if err = repo.Commit(); err != nil {
			failure(w, err)
			return
		}
		responses.JSON(w, status, data)
	}
}
func recordValues(w http.ResponseWriter, r *http.Request, key string, location int) ([]interface{}, bool) {
	var values []interface{}
	var checks []error
	var bodyLocation int
	switch key {
	case "animals":
		var a models.Animal
		if !decode(w, r, &a) {
			return nil, false
		}
		checks = []error{a.Validate()}
		bodyLocation = a.LocationID
		values = []interface{}{a.Name, a.BirthDate, a.Gender, a.EntryDate, a.DeathDate, a.SaleDate, a.PhotoURL}
	case "milk-productions":
		var m models.MilkProduction
		if !decode(w, r, &m) {
			return nil, false
		}
		checks = []error{models.Date(m.Date), models.Positive(m.Quantity)}
		bodyLocation = m.LocationID
		values = []interface{}{m.Date, m.Quantity}
	case "milk-prices":
		var m models.MilkPrice
		if !decode(w, r, &m) {
			return nil, false
		}
		checks = []error{models.Date(m.Date), models.Positive(m.Price)}
		bodyLocation = m.LocationID
		values = []interface{}{m.Date, m.Price}
	case "expenses":
		var e models.Expense
		if !decode(w, r, &e) {
			return nil, false
		}
		e.Description = strings.TrimSpace(e.Description)
		checks = []error{models.Text(e.Description, "descrição", 255), models.Date(e.Date), models.Positive(e.Value)}
		if e.Installments < 1 || e.Installments > 360 {
			checks = append(checks, errors.New("parcelas devem estar entre 1 e 360"))
		}
		bodyLocation = e.LocationID
		values = []interface{}{e.Description, e.Value, e.Date, e.Paid, e.Installments}
	case "incomes":
		var i models.Income
		if !decode(w, r, &i) {
			return nil, false
		}
		i.Description = strings.TrimSpace(i.Description)
		checks = []error{models.Text(i.Description, "descrição", 255), models.Date(i.Date), models.Positive(i.Value)}
		bodyLocation = i.LocationID
		values = []interface{}{i.Description, i.Value, i.Date, i.Received}
	}
	if bodyLocation != 0 && bodyLocation != location {
		checks = append(checks, errors.New("a propriedade deve corresponder à URL da requisição"))
	}
	for _, err := range checks {
		if err != nil {
			responses.Erro(w, 400, err)
			return nil, false
		}
	}
	return values, true
}
func Dashboard(w http.ResponseWriter, r *http.Request) {
	user, _ := auth.ExtractUserID(r)
	repo := repositories.NewRecords(database.DB)
	id := 0
	if raw := r.URL.Query().Get("locationID"); raw != "" {
		var err error
		id, err = strconv.Atoi(raw)
		if err != nil || id < 1 {
			responses.Erro(w, 400, errors.New("propriedade inválida"))
			return
		}
		ok, err := repo.Accessible(r.Context(), user, id)
		if err != nil {
			failure(w, err)
			return
		}
		if !ok {
			responses.Erro(w, 404, errors.New("propriedade não encontrada"))
			return
		}
	}
	data, err := repo.Dashboard(r.Context(), user, id)
	if err != nil {
		failure(w, err)
		return
	}
	responses.JSON(w, 200, data)
}
func Health(w http.ResponseWriter, r *http.Request) {
	if err := database.DB.PingContext(r.Context()); err != nil {
		responses.JSON(w, 503, map[string]string{"status": "unavailable"})
		return
	}
	responses.JSON(w, 200, map[string]string{"status": "ok"})
}
