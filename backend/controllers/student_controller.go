package controllers

import (
	"net/http"

	"quizgo-backend/config"
	"quizgo-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetStudentQuizzes(c *gin.Context) {
	var quizzes []models.Quiz
	query := config.DB.Where("status = ?", models.StatusPublished)

	topic := c.Query("topic")
	if topic != "" {
		query = query.Where("topic = ?", topic)
	}

	search := c.Query("search")
	if search != "" {
		query = query.Where("title ILIKE ?", "%"+search+"%")
	}

	if err := query.Find(&quizzes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to fetch quizzes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": gin.H{"quizzes": quizzes}})
}

func StartQuizSession(c *gin.Context) {
	quizIDStr := c.Param("quizId")
	studentID, _ := c.Get("userID")

	var quiz models.Quiz
	if err := config.DB.Preload("Questions.Options").First(&quiz, "id = ? AND status = ?", quizIDStr, models.StatusPublished).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Kuis tidak ditemukan atau belum dipublish"})
		return
	}

	studentUUID := studentID.(uuid.UUID)
	quizUUID := quiz.ID

	// Check existing sessions and attempts
	var sessions []models.QuizSession
	config.DB.Where("student_id = ? AND quiz_id = ?", studentUUID, quizUUID).Order("attempt_number asc").Find(&sessions)

	var existingSession *models.QuizSession
	for i, s := range sessions {
		if s.Status == models.SessionOngoing {
			existingSession = &sessions[i]
			break
		}
	}

	var session models.QuizSession
	if existingSession != nil {
		session = *existingSession
	} else {
		attemptNumber := 1
		if len(sessions) > 0 {
			attemptNumber = len(sessions) + 1
		}

		if attemptNumber > 2 {
			c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "Anda telah mencapai batas maksimal remedial."})
			return
		}

		if attemptNumber == 2 {
			var prevResult models.QuizResult
			if err := config.DB.First(&prevResult, "session_id = ?", sessions[0].ID).Error; err == nil {
				if prevResult.GradeCategory == "A" || prevResult.GradeCategory == "AB" {
					c.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "Nilai Anda sudah memenuhi syarat dan tidak bisa diremedial."})
					return
				}
			}
		}

		session = models.QuizSession{
			StudentID:     studentUUID,
			QuizID:        quizUUID,
			Status:        models.SessionOngoing,
			AttemptNumber: attemptNumber,
		}

		if err := config.DB.Create(&session).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memulai sesi"})
			return
		}
	}

	type OptionResp struct {
		ID         uuid.UUID `json:"id"`
		OptionText string    `json:"option_text"`
	}
	type QuestionResp struct {
		ID           uuid.UUID    `json:"id"`
		QuestionText string       `json:"question_text"`
		Options      []OptionResp `json:"options"`
	}

	var questionsResp []QuestionResp
	for _, q := range quiz.Questions {
		var optsResp []OptionResp
		for _, o := range q.Options {
			optsResp = append(optsResp, OptionResp{ID: o.ID, OptionText: o.OptionText})
		}
		questionsResp = append(questionsResp, QuestionResp{
			ID:           q.ID,
			QuestionText: q.QuestionText,
			Options:      optsResp,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Sesi kuis berhasil diambil.",
		"data": gin.H{
			"session": gin.H{
				"id":             session.ID,
				"attempt_number": session.AttemptNumber,
				"started_at":     session.StartedAt,
			},
			"quiz": gin.H{
				"id":                 quiz.ID,
				"title":              quiz.Title,
				"time_limit_minutes": quiz.TimeLimitMinutes,
				"questions":          questionsResp,
			},
		},
	})
}

func GetStudentHistory(c *gin.Context) {
	studentID, _ := c.Get("userID")

	var sessions []models.QuizSession
	if err := config.DB.Preload("Quiz").Preload("Result").Where("student_id = ?", studentID).Order("started_at desc").Find(&sessions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Failed to fetch history"})
		return
	}

	var sessionList []gin.H
	for _, s := range sessions {
		canRemedial := false
		grade := ""
		score := float64(0)
		correctAnswers := 0
		totalWrong := 0

		if s.Result != nil {
			grade = s.Result.GradeCategory
			score = s.Result.ScorePercentage
			correctAnswers = s.Result.TotalCorrect
			totalWrong = s.Result.TotalWrong
			if !s.Result.IsRemedial && (grade == "D" || grade == "C" || grade == "BC" || grade == "B") {
				canRemedial = true
			}
		}

		sessionData := gin.H{
			"id":              s.ID,
			"quiz_id":         s.QuizID,
			"attempt_number":  s.AttemptNumber,
			"status":          s.Status,
			"started_at":      s.StartedAt,
			"ended_at":        s.EndedAt,
			"quiz": gin.H{
				"title": s.Quiz.Title,
			},
			"score":           score,
			"grade":           grade,
			"correct_answers": correctAnswers,
			"total_wrong":     totalWrong,
			"total_questions": correctAnswers + totalWrong,
			"can_remedial":    canRemedial,
		}
		sessionList = append(sessionList, sessionData)
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"sessions": sessionList,
		},
	})
}
