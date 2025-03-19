import Database from "better-sqlite3";
import { DatabaseError } from "@/lib/errors";
import { SQLErrorCodes } from "@/lib/errors";

export const db = new Database("devdb.sqlite", { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    user_password TEXT NOT NULL,
    user_name TEXT NOT NULL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    company_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    UNIQUE (company_name, user_id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_closing_rate FLOAT NOT NULL ,
    product_price FLOAT NOT NULL,
    product_description TEXT NOT NULL,
    product_quantity INTEGER NOT NULL,
    product_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE  (product_name, company_id)
  );
`);

export function db_getUserByEmail(email) {
  try {

    const query = db.prepare("SELECT * FROM users WHERE user_email = ?");
    console.info("[DB INFO] Successfull selection");
    return query.get(email) || null;

  } catch (err) {

    console.error("[DB ERROR] db_getUserByEmail: ", err.message);
    return null;
  }
}

export async function db_createUser({ email, password, name }) {
  try {

    const stmt = db.prepare(
      `INSERT INTO users (
         user_name,
         user_email,
         user_password
       ) VALUES (?, ?, ?)`);

    const info = stmt.run(name, email, password);

    console.info("[DB INFO] Successfull insertion");
    return info.changes > 0;

  } catch (err) {

    console.error("[DB ERROR] db_createUser: ", err.message);
    return false;
  }
}

export async function db_createCompany({ company_name, user_id }) {

  try {

    const stmt = db.prepare(
      `INSERT INTO companies (
         company_name,
         user_id
       ) VALUES (?, ?)`);
    const info = stmt.run(company_name, user_id );

    console.info("[DB INFO] Successfull insertion");
    return info.changes > 0;

  } catch (err) {

    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      console.warn("[DB WARN] Rejected insertion", err.message);
      throw new DatabaseError(err.message, SQLErrorCodes.SQLITE_CONSTRAINT_UNIQUE);
    }

    console.error("[DB ERROR] db_createCompany: ", err.message);
    throw err;
  }
}

export async function db_createProduct({ 
  company_id,
  product_name,
  product_closing_rate,
  product_price,
  product_description,
  product_quantity 
}) {

  try {

    const stmt = db.prepare(
      `INSERT INTO products (
         company_id,
         product_name,
         product_price,
         product_description,
         product_quantity,
         product_closing_rate
       ) VALUES (?, ?, ?, ?, ?, ?)`);

    const info = stmt.run(
      company_id,
      product_name,
      product_price,
      product_description,
      product_quantity,
      product_closing_rate
    );

    console.info("[DB INFO] Successfull insertion");

    return info.changes > 0;

  } catch (err) {

    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      console.warn("[DB WARN] Rejected insertion", err.message);
      throw new DatabaseError(err.message, SQLErrorCodes.SQLITE_CONSTRAINT_UNIQUE);
    }

    console.error("[DB ERROR] db_createProduct: ", err.message);
    return false;
  }
}


export async function db_editProduct({ 
  company_id,
  product_name,
  product_closing_rate,
  product_price,
  product_description,
  product_quantity 
}) {

  try {

    const stmt = db.prepare(`
      UPDATE products 
      SET 
        company_id = ?, 
        product_name = ?, 
        product_price = ?, 
        product_description = ?, 
        product_quantity = ?, 
        product_closing_rate = ?
      WHERE product_id = ?
    `);

    const info = stmt.run(
      company_id,
      product_name,
      product_price,
      product_description,
      product_quantity,
      product_closing_rate
    );

    console.info("[DB INFO] Successfull update");
    return info.changes > 0;

  } catch (err) {

    console.error("[DB ERROR] db_createProduct: ", err.message);
    return false;
  }
}

export async function db_deleteProduct(product_id) {
  try {

    const stmt = db.prepare("DELETE FROM products WHERE product_id = ?");
    const info = stmt.run(product_id);

    return info.changes > 0;

  } catch (err) {

    console.error("[DB ERROR] db_deleteProduct: ", err.message);
    return false;
  }
}

export async function db_getProducts(company_id) {
  try {
    const query = db.prepare("SELECT * FROM products WHERE company_id = ?");
    const products = query.all(company_id);
    console.info("[DB INFO] Successfull selection");

    return products;

  } catch (err) {

    console.error("[DB ERROR] db_getProducts: ", err.message);
    throw new DatabaseError(err.message, err.code);
  }
}


export function db_getProductByID(product_id) {
  try {

    console.log("AQUI ESTA EL PRODUCT ID = ", product_id);
    const query = db.prepare("SELECT * FROM products WHERE product_id = ?");
    const product = query.get(product_id);

    if (!product)  {
      const error = DatabaseError(
        `Product with ID ${product_id} NOT FOUND`,
        SQLErrorCodes.CUSTOM_NOT_FOUND
      );

      console.error(error.message);
      throw error;
    }

    console.info("[DB INFO] Successfull selection");
    return product.product_id;

  } catch (err) {

    console.error("[DB ERROR] db_getProductByID: ", err.message);
    throw new DatabaseError(err.message, err.code);
  }
}


export async function db_deleteCompany(company_id) {
  try {
    const deleteProductsStmt = db.prepare("DELETE FROM products WHERE company_id = ?");
    deleteProductsStmt.run(company_id);

    const deleteCompanyStmt = db.prepare("DELETE FROM companies WHERE company_id = ?");
    const info = deleteCompanyStmt.run(company_id);

    return info.changes > 0;

  } catch (err) {
    console.error("[DB ERROR] db_deleteCompany: ", err.message);
    return false;
  }
}

export async function db_getCompanies(user_id) {

  try {

    const query = db.prepare("SELECT company_id, company_name FROM companies WHERE user_id = ?");
    const companies = query.all(user_id);

    console.info("[DB INFO] Successfull selection");
    return companies;

  } catch (err) {

    console.error("[DB ERROR] db_getCompanies: ", err.message);
    throw new DatabaseError(err.message, err.code);
  }
}

export async function db_getProductsAndCompanies(user_id) {
  try {
    const query = db.prepare(`
      WITH filtered_companies AS (
        SELECT * FROM companies WHERE user_id = ?
      )
      SELECT p.*, c.*
      FROM products p
      INNER JOIN filtered_companies c ON p.company_id = c.company_id;
`);

    const joinedTable = query.all(user_id);
    console.log(joinedTable);

    console.info("[DB INFO] Successfull selection");
    return joinedTable;
  } catch (err) {
    console.error("[DB ERROR] db_getCompanies: ", err.message);
    throw new DatabaseError(err.message, err.code);
  }
}

export function db_getCompanyByID(company_id) {
  try {

    const query = db.prepare("SELECT * FROM companies WHERE company_id = ?");
    const company = query.get(company_id);

    if (!company)  {
      const error = DatabaseError(
        `Company with ID ${company_id} NOT FOUND`,
        SQLErrorCodes.CUSTOM_NOT_FOUND
      );

      console.error(error.message);
      throw error;
    }

    console.info("[DB INFO] Successfull selection");
    return company.company_id;

  } catch (err) {

    console.error("[DB ERROR] db_getCompanyByID: ", err.message);
    throw new DatabaseError(err.message, err.code);
  }
}
