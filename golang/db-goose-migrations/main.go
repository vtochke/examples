package main

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"io"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/pkg/errors"
	"github.com/pressly/goose/v3"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

var (
	dir = "migrations"
	//go:embed migrations/*.go
	embedMigrations embed.FS
	ctx             context.Context
)

func init() {
	flagset := pflag.NewFlagSet("configs", pflag.ExitOnError)
	flagset.StringP("command", "c", "migrate", "use command for tools")

	pflag.CommandLine.AddFlagSet(flagset)
	pflag.Parse()

	viper.BindPFlags(pflag.CommandLine)
}

func main() {

	command := viper.GetString("command")

	args := pflag.Args()

	log.Println("tools in args...", pflag.Args())
	log.Println("command in args...", command)

	switch command {
	case "migrate":
		migration(args)
	default:
		log.Println("undefined command see main.go, maybe migrate, cron and etc...")
	}
}

func migration(args []string) {

	db := openDB()
	defer closeDB(db)

	goose.SetBaseFS(embedMigrations)

	cmd := "up"
	if len(args) > 0 {
		cmd = args[0] //up, down, status
	}

	// отрежем все остальные аргументы, если они есть
	// т.е. все что после ./main --command=migrate up
	arguments := []string{}
	if len(args) > 1 {
		arguments = append(arguments, args[1:]...)
	}

	log.Println("migrate arguments...", arguments)

	if err := goose.RunWithOptionsContext(ctx, cmd, db, dir, arguments, goose.WithAllowMissing()); err != nil {
		log.Fatalf("goose %v: %v", cmd, err)
	}

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig
}

func openDB() *sql.DB {
	db, err := sql.Open("postgres", fmt.Sprintf(
		"user=%s password=%s dbname=%s host=%s sslmode=%s port=%d",
		"postgres", "postgres", "postgres", "localhost", "disable", 5432),
	)
	if err != nil {
		log.Fatal(err)
	}

	return db
}

func closeDB(db io.Closer) {
	if err := db.Close(); err != nil {
		log.Println(errors.Wrap(err, "err closing db connection"))
	} else {
		log.Println("db connection gracefully closed")
	}
}
