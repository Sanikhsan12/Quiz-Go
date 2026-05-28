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

func GetTeacherStats(c *gin.Context) {
	teacherID, _ := c.Get("userID")

	var totalQuizzes int64
	config.DB.Model(&models.Quiz{}).Where("teacher_id = ?", teacherID).Count(&totalQuizzes)

	var stats struct {
		TotalSessions int64
		TotalRemedial int64
		AverageScore  float64
	}

	// Calculate total sessions, remedials, and average score
	config.DB.Table("quiz_results").
		Select("COUNT(quiz_results.id) as total_sessions, SUM(CASE WHEN quiz_results.is_remedial = true THEN 1 ELSE 0 END) as total_remedial, COALESCE(AVG(quiz_results.score_percentage), 0) as average_score").
		Joins("JOIN quizzes ON quiz_results.quiz_id = quizzes.id").
		Where("quizzes.teacher_id = ?", teacherID).
		Scan(&stats)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"total_quizzes":   totalQuizzes,
			"total_sessions":  stats.TotalSessions,
			"total_remedial":  stats.TotalRemedial,
			"average_score":   stats.AverageScore,
		},
	})
}

func GetQuizResultsOverview(c *gin.Context) {
	quizID := c.Param("quizId")
	teacherID, _ := c.Get("userID")

	// Ensure the quiz belongs to the teacher
	var quiz models.Quiz
	if err := config.DB.First(&quiz, "id = ? AND teacher_id = ?", quizID, teacherID).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "Kuis tidak ditemukan atau bukan milik Anda"})
		return
	}

	type StudentResult struct {
		StudentID     uuid.UUID `json:"student_id"`
		StudentName   string    `json:"student_name"`
		Score         float64   `json:"score"`
		AttemptNumber int       `json:"attempt_number"`
		IsRemedial    bool      `json:"is_remedial"`
	}

	var results []StudentResult

	// Use DISTINCT ON (student_id) to get only the latest attempt for each student
	query := `
		SELECT DISTINCT ON (qs.student_id)
			u.id as student_id,
			u.name as student_name,
			COALESCE(qr.score_percentage, 0) as score,
			qs.attempt_number as attempt_number,
			CASE WHEN qs.attempt_number > 1 THEN true ELSE false END as is_remedial
		FROM quiz_sessions qs
		JOIN users u ON qs.student_id = u.id
		LEFT JOIN quiz_results qr ON qs.id = qr.session_id
		WHERE qs.quiz_id = ? AND qs.status = 'submitted'
		ORDER BY qs.student_id, qs.attempt_number DESC
	`

	if err := config.DB.Raw(query, quizID).Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengambil data nilai"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": results,
	})
}
