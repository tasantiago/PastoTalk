package models

import (
	"encoding/json"
	"github.com/google/uuid"
	"strings"
	"testing"
)

func TestRoleBoundary(t *testing.T) {
	for _, r := range []Role{RoleAdmin, RoleEditor, RoleViewer, "owner", ""} {
		if r.Allows(Read) != r.Valid() {
			t.Fatal("read boundary")
		}
		if r.Allows(Write) != (r == RoleAdmin || r == RoleEditor) {
			t.Fatal("write boundary")
		}
		if r.Allows(Manage) != (r == RoleAdmin) {
			t.Fatal("manage boundary")
		}
		if r.Allows(Permission(99)) {
			t.Fatal("unknown permission accepted")
		}
	}
}
func TestAnimalLifecycle(t *testing.T) {
	a := Animal{Name: "Vaca", BirthDate: "2020-01-01", EntryDate: "2021-01-01", Gender: "female"}
	if err := a.Validate(); err != nil {
		t.Fatal(err)
	}
	a.EntryDate = "2019-01-01"
	if a.Validate() == nil {
		t.Fatal("entry before birth accepted")
	}
	a.EntryDate = "2021-01-01"
	d := "2022-01-01"
	a.SaleDate = &d
	a.DeathDate = &d
	if a.Validate() == nil {
		t.Fatal("sale and death accepted")
	}
	if Date("0000-01-01") == nil || Date("2024-02-30") == nil {
		t.Fatal("invalid date accepted")
	}
}
func TestUserNormalizationAndPasswordPrivacy(t *testing.T) {
	u := User{ID: uuid.New(), Name: " Test ", Email: "test@example.com", Username: " USER_NAME ", Password: "secret"}
	if err := u.Validate(); err != nil {
		t.Fatal(err)
	}
	if u.Username != "user_name" {
		t.Fatal("username not normalized")
	}
	b, _ := json.Marshal(u)
	if strings.Contains(string(b), "secret") || strings.Contains(string(b), "password") {
		t.Fatal("password disclosed")
	}
}
