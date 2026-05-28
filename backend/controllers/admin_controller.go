package controllers

import (
	"net/http"

	"quizgo-backend/config"
	"quizgo-backend/models"

	"github.com/gin-gonic/gin"
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
