package models

import (
	"time"

	"github.com/google/uuid"
)

type SessionStatus string

const (
	SessionOngoing   SessionStatus = "ongoing"
	SessionSubmitted SessionStatus = "submitted"
)

type QuizSession struct {
	ID            uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	StudentID     uuid.UUID      `gorm:"type:uuid;not null;index" json:"student_id"`
	QuizID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"quiz_id"`
	Status        SessionStatus  `gorm:"type:varchar(20);default:'ongoing'" json:"status"`
	AttemptNumber int            `gorm:"default:1" json:"attempt_number"`
	StartedAt     time.Time      `gorm:"autoCreateTime" json:"started_at"`
	EndedAt       *time.Time     `json:"ended_at"`
	Answers       []StudentAnswer `gorm:"foreignKey:SessionID;constraint:OnDelete:CASCADE;" json:"answers,omitempty"`
	Quiz          Quiz            `gorm:"foreignKey:QuizID" json:"quiz,omitempty"`
	Result        *QuizResult     `gorm:"foreignKey:SessionID" json:"result,omitempty"`
}
