package controllers

import (
	"net/http"

	"quizgo-backend/config"
	"quizgo-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetTeacherQuizzes(c *gin.Context) {
	teacherID, _ := c.Get("userID")

	var quizzes []models.Quiz
	query := config.DB.Where("teacher_id = ?", teacherID)

	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	search := c.Query("search")
	if search != "" {
		query = query.Where("title ILIKE ? OR topic ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Find(&quizzes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to fetch quizzes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": gin.H{"quizzes": quizzes}})
}

func GetQuizDetail(c *gin.Context) {
	quizID := c.Param("quizId")
	teacherID, _ := c.Get("userID")

	var quiz models.Quiz
	if err := config.DB.Preload("Questions.Options").First(&quiz, "id = ? AND teacher_id = ?", quizID, teacherID).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "Anda tidak memiliki akses ke kuis ini atau kuis tidak ditemukan."})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": quiz})
}

type CreateQuizInput struct {
	Title            string `json:"title" binding:"required"`
	Description      string `json:"description"`
	Topic            string `json:"topic" binding:"required"`
	TimeLimitMinutes int    `json:"time_limit_minutes" binding:"required"`
}

func CreateQuiz(c *gin.Context) {
	var input CreateQuizInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Validasi gagal."})
		return
	}

	teacherID, _ := c.Get("userID")

	quiz := models.Quiz{
		TeacherID:        teacherID.(uuid.UUID),
		Title:            input.Title,
		Description:      input.Description,
		Topic:            input.Topic,
		TimeLimitMinutes: input.TimeLimitMinutes,
		Status:           models.StatusDraft,
	}

	if err := config.DB.Create(&quiz).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal membuat kuis"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": "success", "message": "Kuis berhasil dibuat.", "data": quiz})
}

func UpdateQuiz(c *gin.Context) {
	quizID := c.Param("quizId")
	teacherID, _ := c.Get("userID")

	var quiz models.Quiz
	if err := config.DB.First(&quiz, "id = ? AND teacher_id = ?", quizID, teacherID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Kuis tidak ditemukan"})
		return
	}

	var input CreateQuizInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Validasi gagal."})
		return
	}

	quiz.Title = input.Title
	quiz.Description = input.Description
	quiz.Topic = input.Topic
	quiz.TimeLimitMinutes = input.TimeLimitMinutes

	if err := config.DB.Save(&quiz).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal update kuis"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Kuis berhasil diperbarui.", "data": quiz})
}

func PublishQuiz(c *gin.Context) {
	quizID := c.Param("quizId")
	teacherID, _ := c.Get("userID")

	var quiz models.Quiz
	if err := config.DB.Preload("Questions").First(&quiz, "id = ? AND teacher_id = ?", quizID, teacherID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Kuis tidak ditemukan"})
		return
	}

	if len(quiz.Questions) == 0 {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"status": "error", "message": "Kuis harus memiliki minimal 1 soal sebelum dipublikasikan."})
		return
	}

	quiz.Status = models.StatusPublished
	config.DB.Save(&quiz)

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Kuis berhasil dipublikasikan.", "data": quiz})
}

func UnpublishQuiz(c *gin.Context) {
	quizID := c.Param("quizId")
	teacherID, _ := c.Get("userID")

	var quiz models.Quiz
	if err := config.DB.First(&quiz, "id = ? AND teacher_id = ?", quizID, teacherID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Kuis tidak ditemukan"})
		return
	}

	quiz.Status = models.StatusDraft
	config.DB.Save(&quiz)

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Kuis berhasil dikembalikan ke draft.", "data": quiz})
}

func DeleteQuiz(c *gin.Context) {
	quizID := c.Param("quizId")
	teacherID, _ := c.Get("userID")

	if err := config.DB.Delete(&models.Quiz{}, "id = ? AND teacher_id = ?", quizID, teacherID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menghapus kuis"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Kuis berhasil dihapus."})
}
