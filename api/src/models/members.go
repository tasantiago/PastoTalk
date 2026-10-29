package models

type Role string

const (
	RoleAdmin  Role = "admin"
	RoleEditor Role = "editor"
	RoleViewer Role = "viewer"
)

type Permission int

const (
	Read Permission = iota
	Write
	Manage
)

func (r Role) Valid() bool { return r == RoleAdmin || r == RoleEditor || r == RoleViewer }
func (r Role) Allows(p Permission) bool {
	switch p {
	case Read:
		return r.Valid()
	case Write:
		return r == RoleAdmin || r == RoleEditor
	case Manage:
		return r == RoleAdmin
	}
	return false
}

type Member struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Username string `json:"username"`
	Role     Role   `json:"role"`
}
