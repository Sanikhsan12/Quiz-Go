package routes

import (
	"quizgo-backend/controllers"
	"quizgo-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupTeacherRoutes(r *gin.Engine) {
	teacherGroup := r.Group("/api/v1/teacher")
	
	teacherGroup.Use(middlewares.AuthMiddleware())
	teacherGroup.Use(middlewares.RoleMiddleware("teacher"))
	
	// Middleware to check if teacher is approved could be added here
	
	{
		teacherGroup.GET("/stats", controllers.GetTeacherStats)
		teacherGroup.GET("/quizzes", controllers.GetTeacherQuizzes)
		teacherGroup.POST("/quizzes", controllers.CreateQuiz)
		teacherGroup.GET("/quizzes/:quizId", controllers.GetQuizDetail)
		teacherGroup.GET("/quizzes/:quizId/results", controllers.GetQuizResultsOverview)
		teacherGroup.PUT("/quizzes/:quizId", controllers.UpdateQuiz)
		teacherGroup.PATCH("/quizzes/:quizId/publish", controllers.PublishQuiz)
		teacherGroup.PATCH("/quizzes/:quizId/unpublish", controllers.UnpublishQuiz)
		teacherGroup.DELETE("/quizzes/:quizId", controllers.DeleteQuiz)

		teacherGroup.POST("/quizzes/:quizId/questions", controllers.AddQuestion)
		// teacherGroup.PUT("/quizzes/:quizId/questions/:questionId", controllers.UpdateQuestion)
		// teacherGroup.DELETE("/quizzes/:quizId/questions/:questionId", controllers.DeleteQuestion)
	}
}
