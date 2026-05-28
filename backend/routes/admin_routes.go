package routes

import (
	"quizgo-backend/controllers"
	"quizgo-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupAdminRoutes(r *gin.Engine) {
	adminGroup := r.Group("/api/v1/admin")
	
	// Apply Auth and Role middleware to restrict access to Admins only
	adminGroup.Use(middlewares.AuthMiddleware())
	adminGroup.Use(middlewares.RoleMiddleware("admin"))
	{
		adminGroup.GET("/users", controllers.GetUsers)
		adminGroup.PATCH("/teachers/:teacherId/approve", controllers.ApproveTeacher)
	}
}
