package models

import (
	"time"

	"github.com/google/uuid"
)

type QuizResult struct {
	ID              uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	SessionID       uuid.UUID `gorm:"type:uuid;not null;index" json:"session_id"`
	StudentID       uuid.UUID `gorm:"type:uuid;not null;index" json:"student_id"`
	QuizID          uuid.UUID `gorm:"type:uuid;not null;index" json:"quiz_id"`
	ScorePercentage float64   `gorm:"type:float" json:"score_percentage"`
	GradeCategory   string    `gorm:"type:varchar(2)" json:"grade_category"`
	TotalCorrect    int       `json:"total_correct"`
	TotalWrong      int       `json:"total_wrong"`
	IsRemedial      bool      `gorm:"default:false" json:"is_remedial"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
}
