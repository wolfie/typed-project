import sqlite3 from "sqlite3";
import * as sql from "sqlite";
import type { ISqlite } from "sqlite/build/interfaces";
import os from "os";
import path from "path";
import * as t from "io-ts";

import logger from "./logger";
import SecureError from "./SecureError";
import { ioTsUtils } from "typed-project-common";

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
  db.get(`SELECT COUNT(*) as count FROM ${table}`).then(ioTsUtils.decode(CountOfTable));

const expectOneRowChanged = (result: ISqlite.RunResult) => {
  if (result.changes !== 1)
    throw new SecureError(`Expected 1 row changed, but got ${result.changes}`, "Database error");
};

export type Todo = t.TypeOf<typeof Todo>;
export const Todo = t.type({ id: t.number, body: t.string, author: t.string });

export const insertIntoTodos = (db: sql.Database, { author, body }: Omit<Todo, "id">) =>
  db.run(`INSERT INTO ${TODOS_TABLE} (author, body) VALUES (?, ?)`, author, body).then(expectOneRowChanged);

export const updateTodoBody = (db: sql.Database, { id, body }: Omit<Todo, "author">) =>
  db.run(`UPDATE ${TODOS_TABLE} SET body = ? WHERE id = ?`, body, id).then(expectOneRowChanged);

export const getAllTodos = (db: sql.Database): Promise<Todo[]> =>
  db.all(`SELECT * FROM ${TODOS_TABLE}`).then(ioTsUtils.decode(t.array(Todo)));

export const getTodo = (db: sql.Database, id: number): Promise<Todo | undefined> =>
  db.get(`SELECT * FROM ${TODOS_TABLE} WHERE id = ?`, id).then(ioTsUtils.decodeIfNotUndefined(Todo));

const SQLITE_FILE_PATH = path.resolve(os.tmpdir(), "typed-project.sqlite");
log(`Using ${SQLITE_FILE_PATH} for sqlite database`);

const db = sql
  .open({
    driver: sqlite3.Database,
    filename: SQLITE_FILE_PATH,
  })
  .then(async db => {
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

export const withDb = <FN extends (database: Awaited<typeof db>) => any>(
  fn: FN
): Promise<Awaited<ReturnType<typeof fn>>> => db.then(fn);

export default db;
