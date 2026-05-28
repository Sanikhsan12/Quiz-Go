package config

import (
	"fmt"
	"log"
	"os"

	"quizgo-backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC", host, user, password, dbname, port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	DB = db

	// Run Migrations
	err = DB.AutoMigrate(
		&models.User{},
		&models.Quiz{},
		&models.Question{},
		&models.Option{},
		&models.QuizSession{},
		&models.StudentAnswer{},
		&models.QuizResult{},
	)
	if err != nil {
		log.Fatalf("Failed to auto migrate: %v", err)
	}

	// Create triggers for updated_at (we can do it via raw sql or let gorm handle autoUpdateTime)
	// Gorm handles autoUpdateTime by default on updates.
}
