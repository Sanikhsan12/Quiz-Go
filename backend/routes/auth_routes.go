package routes

import (
	"quizgo-backend/controllers"
	"quizgo-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupAuthRoutes(r *gin.Engine) {
	authGroup := r.Group("/api/v1/auth")
	{
		authGroup.POST("/register", controllers.Register)
		authGroup.POST("/login", controllers.Login)

		// Protected routes
		authGroup.Use(middlewares.AuthMiddleware())
		authGroup.GET("/me", controllers.GetMe)
	}
}
