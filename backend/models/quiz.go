package models

import (
	"time"

	"github.com/google/uuid"
)

type QuizStatus string

const (
	StatusDraft     QuizStatus = "draft"
	StatusPublished QuizStatus = "published"
)

type Quiz struct {
	ID               uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	TeacherID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"teacher_id"`
	Title            string         `gorm:"type:varchar(255);not null" json:"title"`
	Description      string         `gorm:"type:text" json:"description"`
	Topic            string         `gorm:"type:varchar(255);not null" json:"topic"`
	TimeLimitMinutes int            `gorm:"not null" json:"time_limit_minutes"`
	Status           QuizStatus     `gorm:"type:varchar(20);default:'draft'" json:"status"`
	CreatedAt        time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	Questions        []Question     `gorm:"constraint:OnDelete:CASCADE;" json:"questions,omitempty"`
}
