package models

import (
	"time"

	"github.com/google/uuid"
)

type Question struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	QuizID       uuid.UUID `gorm:"type:uuid;not null;index" json:"quiz_id"`
	QuestionText string    `gorm:"type:text;not null" json:"question_text"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	Options      []Option  `gorm:"constraint:OnDelete:CASCADE;" json:"options,omitempty"`
}

type Option struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	QuestionID   uuid.UUID `gorm:"type:uuid;not null;index" json:"question_id"`
	OptionText   string    `gorm:"type:varchar(500);not null" json:"option_text"`
	IsCorrect    bool      `gorm:"not null;default:false" json:"is_correct"`
}
