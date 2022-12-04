import sqlite3 from "sqlite3";
import * as sql from "sqlite";
import type { ISqlite } from "sqlite/build/interfaces";
import os from "os";
import path from "path";
import * as t from "io-ts";
import * as tt from "io-ts-types";
import * as fs from "fs";

import logger from "./logger";
import SecureError from "./SecureError";
import { ioTsUtils } from "typed-project-common";

const log = logger("db");

const TODOS_TABLE = "todos";
const USERS_TABLE = "users";
const USER_ID = "16b2f933-be81-488e-8b5e-305443f0e935";

const INIT = [
  `
CREATE TABLE IF NOT EXISTS ${USERS_TABLE} (
  id TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL
);`,
  `INSERT INTO ${USERS_TABLE} (id, username, password) VALUES ("${USER_ID}", "user", "user");`,
  `
CREATE TABLE IF NOT EXISTS ${TODOS_TABLE} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id TEXT NOT NULL,
  body TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
  FOREIGN KEY(author_id) REFERENCES ${USERS_TABLE}(id)
);`,
  `INSERT INTO ${TODOS_TABLE} (author_id, body, done) VALUES ("${USER_ID}", "Test todo 1", 0);`,
  `INSERT INTO ${TODOS_TABLE} (author_id, body, done) VALUES ("${USER_ID}", "Test todo 2", 0);`,
];

type CountOfTable = t.TypeOf<typeof CountOfTable>;
const CountOfTable = t.type({ count: t.number });
const getCountOfTable = (db: sql.Database, table: string) =>
  db.get(`SELECT COUNT(*) as count FROM ${table}`).then(ioTsUtils.decode(CountOfTable));

const expectOneRowChanged = (result: ISqlite.RunResult) => {
  if (result.changes !== 1)
    throw new SecureError(`Expected 1 row changed, but got ${result.changes}`, "Database error");
};

export type TodoRead = t.TypeOf<typeof TodoRead>;
export const TodoRead = t.type({
  id: t.number,
  username: t.string,
  body: t.string,
  done: tt.BooleanFromNumber,
});

export const updateTodo = (id: number, updates: { body?: string; done?: boolean }) => async (db: sql.Database) => {
  const entries = Object.entries(updates).map(e => (e[0] === "done" ? ["done", e[1] ? 1 : 0] : e));
  if (entries.length === 0) return;

  await db.run(`UPDATE ${TODOS_TABLE} SET ${entries.map(e => `${e[0]} = ?`)} WHERE id = ?`, [
    ...entries.map(e => e[1]),
    id,
  ]);
};

export const getAllTodos =
  () =>
  (db: sql.Database): Promise<TodoRead[]> =>
    db
      .all(`SELECT todos.id, username, body, done FROM todos LEFT JOIN users ON todos.author_id = users.id`)
      .then(ioTsUtils.decode(t.array(TodoRead)));

export const getTodo =
  (id: number) =>
  (db: sql.Database): Promise<TodoRead | undefined> =>
    db
      .get(
        `SELECT todos.id, username, body, done FROM todos LEFT JOIN users ON todos.author_id = users.id WHERE todos.id = ?`,
        id
      )
      .then(ioTsUtils.decodeIfNotUndefined(TodoRead));

const SQLITE_FILE_PATH = path.resolve(os.tmpdir(), "typed-project.sqlite");
log(`Using ${SQLITE_FILE_PATH} for sqlite database`);

const fileExistsAlready = fs.existsSync(SQLITE_FILE_PATH);

const db = sql
  .open({
    driver: sqlite3.Database,
    filename: SQLITE_FILE_PATH,
  })
  .then(async db => {
    if (!fileExistsAlready) {
      log("Initializing database");
      for (const sql of INIT) {
        log(sql);
        await db.exec(sql);
      }
    } else {
      log("Skipping initialization, database exists already");
    }

    return db;
  });

export const withDb = <FN extends (database: Awaited<typeof db>) => any>(
  fn: FN
): Promise<Awaited<ReturnType<typeof fn>>> => db.then(fn);

export default db;
