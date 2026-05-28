package controllers

import (
	"net/http"

	"quizgo-backend/config"
	"quizgo-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetUsers(c *gin.Context) {
	var users []models.User
	query := config.DB

	role := c.Query("role")
	if role != "" {
		query = query.Where("role = ?", role)
	}

	search := c.Query("search")
	if search != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": gin.H{"users": users}})
}

func ApproveTeacher(c *gin.Context) {
	teacherID := c.Param("teacherId")

	var user models.User
	if err := config.DB.First(&user, "id = ?", teacherID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Teacher not found"})
		return
	}

	if user.Role != models.RoleTeacher {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "User is not a teacher"})
		return
	}

	user.IsApproved = true
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to approve teacher"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"message": "Akun teacher berhasil disetujui.",
		"data": gin.H{
			"id": user.ID,
			"name": user.Name,
			"is_approved": user.IsApproved,
			"updated_at": user.UpdatedAt,
		},
	})
}

func GetAdminStats(c *gin.Context) {
	var totalUsers int64
	config.DB.Model(&models.User{}).Where("role = 'student'").Count(&totalUsers)

	var totalTeachers int64
	config.DB.Model(&models.User{}).Where("role = 'teacher'").Count(&totalTeachers)

	var totalQuizzes int64
	config.DB.Model(&models.Quiz{}).Count(&totalQuizzes)

	type TeacherStat struct {
		TeacherID    uuid.UUID `json:"teacher_id"`
		TeacherName  string    `json:"teacher_name"`
		TotalQuizzes int       `json:"total_quizzes"`
		AverageScore float64   `json:"average_score"`
	}

	var teacherStats []TeacherStat
	
	config.DB.Raw(`
		SELECT 
			u.id as teacher_id, 
			u.name as teacher_name, 
			COUNT(DISTINCT q.id) as total_quizzes,
			COALESCE(AVG(qr.score_percentage), 0) as average_score
		FROM users u
		LEFT JOIN quizzes q ON q.teacher_id = u.id
		LEFT JOIN quiz_results qr ON qr.quiz_id = q.id
		WHERE u.role = 'teacher'
		GROUP BY u.id, u.name
		ORDER BY total_quizzes DESC, average_score DESC
	`).Scan(&teacherStats)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"total_students": totalUsers,
			"total_teachers": totalTeachers,
			"total_quizzes":  totalQuizzes,
			"teacher_stats":  teacherStats,
		},
	})
}
