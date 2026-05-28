package models

import (
	"github.com/google/uuid"
)

type StudentAnswer struct {
	ID               uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	SessionID        uuid.UUID  `gorm:"type:uuid;not null;index" json:"session_id"`
	QuestionID       uuid.UUID  `gorm:"type:uuid;not null" json:"question_id"`
	SelectedOptionID *uuid.UUID `gorm:"type:uuid" json:"selected_option_id"`
}
