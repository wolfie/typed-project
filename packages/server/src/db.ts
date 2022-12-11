import sqlite3 from "sqlite3";
import * as sql from "sqlite";
import os from "os";
import path from "path";
import * as t from "io-ts";
import * as fs from "fs";

import logger from "./logger";
import { ioTsUtils, LoginResponse, Todo } from "typed-project-common";

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

const SQLITE_FILE_PATH = path.resolve(os.tmpdir(), "typed-project.sqlite");

class DB {
  public readonly db: Promise<sql.Database<sqlite3.Database, sqlite3.Statement>>;

  constructor() {
    log(`Using ${SQLITE_FILE_PATH} for sqlite database`);
    const fileExistsAlready = fs.existsSync(SQLITE_FILE_PATH);
    this.db = sql
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
  }

  getTodo = async (id: number) =>
    (await this.db)
      .get(
        `SELECT todos.id, username, body, done FROM todos LEFT JOIN users ON todos.author_id = users.id WHERE todos.id = ?`,
        id
      )
      .then(ioTsUtils.decodeIfNotUndefined(Todo));

  getAllTodos = async () =>
    (await this.db)
      .all(`SELECT todos.id, username, body, done FROM todos LEFT JOIN users ON todos.author_id = users.id`)
      .then(ioTsUtils.decode(t.array(Todo)));

  updateTodo = async (id: number, updates: { body?: string; done?: boolean }) => {
    const entries = Object.entries(updates).map(e => (e[0] === "done" ? ["done", e[1] ? 1 : 0] : e));
    if (entries.length === 0) return;

    (await this.db).run(`UPDATE ${TODOS_TABLE} SET ${entries.map(e => `${e[0]} = ?`)} WHERE id = ?`, [
      ...entries.map(e => e[1]),
      id,
    ]);
  };

  checkIfUserExists = async (username: string, password: string) => {
    const result = await (await this.db)
      .get(`SELECT username ,id FROM users WHERE username = ? AND password = ?`, username, password)
      .then(ioTsUtils.decode(t.union([t.undefined, t.type({ username: t.string, id: t.string })])));
    return result;
  };

  createTodo = async (authorId: string, body: string) => {
    (await this.db).run(`INSERT INTO ${TODOS_TABLE} (author_id, body) VALUES (?, ?)`, [authorId, body]);
  };

  deleteDoneTodos = async () => {
    (await this.db).exec(`DELETE FROM ${TODOS_TABLE} WHERE done = 1`);
  };
}

const db = new DB();

export default db;
