import sqlite3 from "sqlite3";
import * as sql from "sqlite";
import os from "os";
import path from "path";
import * as t from "io-ts";
import { decode } from "./io-ts-utils";
import logger from "./logger";

const log = logger("db");

const TODOS_TABLE = "todos";
const INIT = `CREATE TABLE IF NOT EXISTS ${TODOS_TABLE} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author TEXT NOT NULL,
  body TEXT NOT NULL
);`;

type CountOfTable = t.TypeOf<typeof CountOfTable>;
const CountOfTable = t.type({ count: t.number });
const getCountOfTable = (db: sql.Database, table: string) =>
  db.get(`SELECT COUNT(*) as count FROM ${table}`).then(decode(CountOfTable));

const insertIntoTodos = (
  db: sql.Database,
  { author, body }: { author: string; body: string }
) =>
  db.run(
    `INSERT INTO ${TODOS_TABLE} (author, body) VALUES (?, ?)`,
    author,
    body
  );

const SQLITE_FILE_PATH = path.resolve(os.tmpdir(), "typed-project.sqlite");
log(`Using ${SQLITE_FILE_PATH} for sqlite database`);

const db = sql
  .open({
    driver: sqlite3.Database,
    filename: SQLITE_FILE_PATH,
  })
  .then(async (db) => {
    log("doing init things for database");
    await db.exec(INIT);

    const { count } = await getCountOfTable(db, TODOS_TABLE);
    if (count === 0) {
      log("Database was empty, adding test data");
      await insertIntoTodos(db, { author: "Henrik", body: "Test body 1" });
      await insertIntoTodos(db, { author: "Henrik", body: "Test body 2" });
    } else {
      log("Found existing data in database");
    }

    return db;
  });
