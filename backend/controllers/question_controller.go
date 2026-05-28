package controllers

import (
	"net/http"

	"quizgo-backend/config"
	"quizgo-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OptionInput struct {
	ID         *uuid.UUID `json:"id"`
	OptionText string     `json:"option_text" binding:"required"`
	IsCorrect  bool       `json:"is_correct"`
}

type QuestionInput struct {
	QuestionText string        `json:"question_text" binding:"required"`
	Options      []OptionInput `json:"options" binding:"required,min=2,max=4"`
}

func validateOptions(options []OptionInput) bool {
	correctCount := 0
	for _, opt := range options {
		if opt.IsCorrect {
			correctCount++
		}
	}
	return correctCount == 1
}

func AddQuestion(c *gin.Context) {
	quizIDStr := c.Param("quizId")
	teacherID, _ := c.Get("userID")

	var quiz models.Quiz
	if err := config.DB.First(&quiz, "id = ? AND teacher_id = ?", quizIDStr, teacherID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Kuis tidak ditemukan"})
		return
	}

	var input QuestionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Validasi gagal."})
		return
	}

	if !validateOptions(input.Options) {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Tepat satu pilihan harus ditandai sebagai jawaban benar."})
		return
	}

	quizID, _ := uuid.Parse(quizIDStr)

	question := models.Question{
		QuizID:       quizID,
		QuestionText: input.QuestionText,
	}

	tx := config.DB.Begin()
	if err := tx.Create(&question).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menambah soal"})
		return
	}

	for _, optInput := range input.Options {
		option := models.Option{
			QuestionID: question.ID,
			OptionText: optInput.OptionText,
			IsCorrect:  optInput.IsCorrect,
		}
		if err := tx.Create(&option).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menambah opsi"})
			return
		}
	}
	tx.Commit()

	var createdQuestion models.Question
	config.DB.Preload("Options").First(&createdQuestion, "id = ?", question.ID)

	c.JSON(http.StatusCreated, gin.H{"status": "success", "message": "Soal berhasil ditambahkan.", "data": createdQuestion})
}

// UpdateQuestion and DeleteQuestion will be added similarly...
