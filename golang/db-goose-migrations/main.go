package main

import (
	"context"
	"database/sql"
	"embed"
	"log"

	"github.com/pressly/goose/v3"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

var (
	dir = "migrations"
	//go:embed migrations/*.go
	embedMigrations embed.FS
	DB              *sql.DB // любая БД
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
	defer closeDb()

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

	if err := goose.RunWithOptionsContext(ctx, cmd, DB, dir, arguments, goose.WithAllowMissing()); err != nil {
		log.Fatalf("goose %v: %v", cmd, err)
	}
}

func closeDb() {
	if err := DB.Close(); err != nil {
		log.Fatalf("failed to close DB: %v\n", err)
	}
}
