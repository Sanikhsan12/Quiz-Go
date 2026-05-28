package controllers

import (
	"net/http"
	"time"

	"quizgo-backend/config"
	"quizgo-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SaveAnswerInput struct {
	QuestionID       uuid.UUID `json:"question_id" binding:"required"`
	SelectedOptionID uuid.UUID `json:"selected_option_id" binding:"required"`
}

func SaveAnswer(c *gin.Context) {
	sessionIDStr := c.Param("sessionId")
	studentID, _ := c.Get("userID")

	var session models.QuizSession
	if err := config.DB.First(&session, "id = ? AND student_id = ?", sessionIDStr, studentID).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "Sesi tidak valid"})
		return
	}

	if session.Status != models.SessionOngoing {
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "Sesi sudah berakhir."})
		return
	}

	var input SaveAnswerInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Validasi gagal."})
		return
	}

	answer := models.StudentAnswer{
		SessionID:        session.ID,
		QuestionID:       input.QuestionID,
		SelectedOptionID: &input.SelectedOptionID,
	}

	// Upsert answer
	config.DB.Where("session_id = ? AND question_id = ?", session.ID, input.QuestionID).Assign(models.StudentAnswer{SelectedOptionID: &input.SelectedOptionID}).FirstOrCreate(&answer)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"message": "Jawaban disimpan.",
		"data": answer,
	})
}

func calculateGrade(score float64) string {
	if score >= 80 {
		return "A"
	} else if score >= 71 {
		return "AB"
	} else if score >= 60 {
		return "B"
	} else if score >= 50 {
		return "BC"
	} else if score >= 40 {
		return "C"
	}
	return "D"
}

type SubmitQuizInput struct {
	Answers []struct {
		QuestionID       uuid.UUID `json:"question_id" binding:"required"`
		SelectedOptionID uuid.UUID `json:"selected_option_id" binding:"required"`
	} `json:"answers"`
}

func SubmitQuiz(c *gin.Context) {
	sessionIDStr := c.Param("sessionId")
	studentID, _ := c.Get("userID")

	var session models.QuizSession
	if err := config.DB.Preload("Answers").First(&session, "id = ? AND student_id = ?", sessionIDStr, studentID).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "Sesi tidak valid"})
		return
	}

	if session.Status == models.SessionSubmitted {
		c.JSON(http.StatusConflict, gin.H{"status": "error", "message": "Sesi ini sudah disubmit sebelumnya."})
		return
	}

	var input SubmitQuizInput
	if err := c.ShouldBindJSON(&input); err == nil {
		for _, ans := range input.Answers {
			studentAnswer := models.StudentAnswer{
				SessionID:        session.ID,
				QuestionID:       ans.QuestionID,
				SelectedOptionID: &ans.SelectedOptionID,
			}
			config.DB.Where("session_id = ? AND question_id = ?", session.ID, ans.QuestionID).Assign(models.StudentAnswer{SelectedOptionID: &ans.SelectedOptionID}).FirstOrCreate(&studentAnswer)
		}
		// reload answers
		config.DB.Preload("Answers").First(&session, "id = ?", session.ID)
	}

	var quiz models.Quiz
	config.DB.Preload("Questions.Options").First(&quiz, "id = ?", session.QuizID)

	tx := config.DB.Begin()

	correctAnswers := 0
	for _, q := range quiz.Questions {
		// find correct option
		var correctOpt uuid.UUID
		for _, o := range q.Options {
			if o.IsCorrect {
				correctOpt = o.ID
				break
			}
		}

		// check student answer
		for _, ans := range session.Answers {
			if ans.QuestionID == q.ID && ans.SelectedOptionID != nil && *ans.SelectedOptionID == correctOpt {
				correctAnswers++
				break
			}
		}
	}

	totalQuestions := len(quiz.Questions)
	wrongAnswers := totalQuestions - correctAnswers
	var scorePercentage float64
	if totalQuestions > 0 {
		scorePercentage = (float64(correctAnswers) / float64(totalQuestions)) * 100
	}

	isRemedial := session.AttemptNumber == 2
	if isRemedial && scorePercentage > 70 {
		scorePercentage = 70 // cap at 70 for remedial
	}

	grade := calculateGrade(scorePercentage)

	now := time.Now()
	session.Status = models.SessionSubmitted
	session.EndedAt = &now
	if err := tx.Save(&session).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to update session"})
		return
	}

	result := models.QuizResult{
		SessionID:       session.ID,
		StudentID:       session.StudentID,
		QuizID:          session.QuizID,
		ScorePercentage: scorePercentage,
		GradeCategory:   grade,
		TotalCorrect:    correctAnswers,
		TotalWrong:      wrongAnswers,
		IsRemedial:      isRemedial,
	}

	if err := tx.Create(&result).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to save result"})
		return
	}

	tx.Commit()

	canRemedial := false
	if !isRemedial && (grade == "D" || grade == "C" || grade == "BC" || grade == "B") {
		canRemedial = true
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Kuis berhasil disubmit dan dinilai.",
		"data": gin.H{
			"session_id":       session.ID,
			"quiz_id":          session.QuizID,
			"attempt_number":   session.AttemptNumber,
			"score_percentage": scorePercentage,
			"grade_category":   grade,
			"total_correct":    correctAnswers,
			"total_wrong":      wrongAnswers,
			"total_questions":  totalQuestions,
			"is_remedial":      isRemedial,
			"can_remedial":     canRemedial,
			"ended_at":         session.EndedAt,
		},
	})
}
