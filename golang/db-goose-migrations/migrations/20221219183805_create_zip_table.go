package migrations

import (
	"context"
	"database/sql"
	"log"

	"github.com/pressly/goose/v3"
)

func init() {
	goose.AddMigrationContext(upCreateZipTable, downCreateZipTable)
}

func upCreateZipTable(ctx context.Context, tx *sql.Tx) error {
	_, err := tx.Exec(`create table if not exists zip
		(
			zip varchar(55) not null,
			code varchar(55) not null,
			country varchar(55) not null,
			created_at        timestamp default CURRENT_TIMESTAMP not null,
			updated_at        timestamp default CURRENT_TIMESTAMP not null,
			PRIMARY KEY (zip, country)
		)`)

	if err != nil {
		log.Fatal("Unable to create `zip` table. $v", err)
	}
	return nil
}

func downCreateZipTable(ctx context.Context, tx *sql.Tx) error {
	_, err := tx.Exec(`drop table if exists zip;`)

	if err != nil {
		log.Fatalf("Unable to delete `zip` table. %v\n", err)
	}
	return nil
}
