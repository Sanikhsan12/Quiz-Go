package routes

import (
	"quizgo-backend/controllers"
	"quizgo-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupStudentRoutes(r *gin.Engine) {
	studentGroup := r.Group("/api/v1/student")
	
	studentGroup.Use(middlewares.AuthMiddleware())
	studentGroup.Use(middlewares.RoleMiddleware("student"))
	
	{
		studentGroup.GET("/quizzes", controllers.GetStudentQuizzes)
		// studentGroup.GET("/quizzes/:quizId", controllers.GetQuizDetailStudent) // to be added if needed
		studentGroup.POST("/quizzes/:quizId/start", controllers.StartQuizSession)
		studentGroup.PUT("/sessions/:sessionId/answers", controllers.SaveAnswer)
		studentGroup.POST("/sessions/:sessionId/submit", controllers.SubmitQuiz)
		
		// History API
		studentGroup.GET("/sessions", controllers.GetStudentHistory)
	}
}
