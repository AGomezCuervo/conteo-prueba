"use server"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { SignJWT, decodeJwt } from "jose";
import { 
  db_getUserByEmail,
  db_createUser,
  db_createCompany,
  db_createProduct,
  db_getCompanyByID,
  db_getProducts,
  db_editProduct,
  db_deleteProduct,
  db_getCompanies,
  db_getProductsAndCompanies,
  db_getProductByID,
  db_deleteCompany
} from "@/lib/db";
import { ErrorCodes, SQLErrorCodes } from "@/lib/errors";
import { makeResponse } from "@/lib/utils";

/* TODO: CHECK NANS */
/* TODO: remove dev secret */
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const makeError = (errorCode) => makeResponse(false, errorCode);
const makePayload = (payload) => makeResponse(true, ErrorCodes.NO_ERROR, payload);

export async function login(formData) {
  const email = formData.get("email")?.trim();
  const password = formData.get("password");
  const secret = new TextEncoder().encode(JWT_SECRET);
  let user = null;
  let token = null;
  let cookieStore = null;


  if (!email || !password)
    return makeError(ErrorCodes.INCOMPLETE_FORM);

  user = await db_getUserByEmail(email);

  if (!user)
    return makeError(ErrorCodes.USER_NOT_FOUND);

  try {

    let isMatched = await bcrypt.compare(password, user.user_password);
    if (!isMatched)
      return makeError(ErrorCodes.INVALID_CREDENTIALS);

  } catch(err) {
    console.error("[HASH ERROR] login:", err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  token = await new SignJWT({
    id: user.user_id,
    name: user.user_name,
    email: user.user_email
  })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("1d")
  .sign(secret);

  cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  redirect("/dashboard");
}


export async function logout() {
  let cookieStore = null;

  cookieStore = await cookies();
  cookieStore.set("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });

  redirect("/login");
}


export async function signup(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");
  let user = null;
  let success = null;
  let hashedPassword = null;

  if (!email || !password || !name)
    return makeError(ErrorCodes.INCOMPLETE_FORM);

  user = await db_getUserByEmail(email);

  if (user)
    return makeError(ErrorCodes.EMAIL_ALREADY_IN_USE);

  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch(err) {
    console.error("[HASH ERROR] signup:", err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  success = await db_createUser({email,
    password: hashedPassword,
    name: name.toLowerCase()});

  if (!success)
    return makeError(ErrorCodes.SERVER_ERROR);

  redirect("/dashboard");
}

export async function deleteCompany(company_id) {
  if (!company_id || isNaN(company_id)) {
    console.error("[SERVER ERROR] deleteCompany: ", "Unexpected arguments, expected: deleteCompany(company_id:number)");
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  company_id = parseInt(company_id);

  try {
    await db_getCompanyByID(company_id);
    await db_deleteCompany(company_id);
    return makeResponse(true);
  } catch (err) {
    console.error("[SERVER ERROR] deletecompany: ", err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}

export async function createCompany(formData) {
  let user_id = formData.get("user_id");
  const company_name = formData.get("company_name")?.trim();

  user_id = parseInt(user_id);

  if (!user_id || !company_name)
    return makeError(ErrorCodes.INCOMPLETE_FORM);

  try {
    await db_createCompany({company_name, user_id});
    return makeResponse(true);
  } catch (err) {
    if (err.name === "databaseError") {
      if (err.code === SQLErrorCodes.SQLITE_CONSTRAINT_UNIQUE)
        return makeError(ErrorCodes.COMPANY_ALREADY_REGISTERED);
    }

    console.error("[SERVER ERROR] db_createCompany: ", err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


export async function getCompanies(user_id) {
  if (!user_id || isNaN(user_id)) {
    console.error("[SERVER ERROR] getProducts: ", "Unexpected arguments, expected: getCompanies(user_id:number)");
    return makeError(ErrorCodes.SERVER_ERROR);
  }
  user_id = parseInt(user_id);

  try {

    const companies = await db_getCompanies(user_id);
    return makePayload(companies);

  } catch (err) {

    console.error("[SERVER ERROR] getCompanies: ", err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


export async function deleteProduct(product_id) {
  if (!product_id || isNaN(product_id)) {
    console.error("[SERVER ERROR] deleteProduct: ", "Unexpected arguments, expected: deleteProduct(product_id:number)");
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  product_id = parseInt(product_id);

  try {
    await db_getProductByID(product_id);
    await db_deleteProduct(product_id);
    return makeResponse(true);
  } catch (err) {
    console.error("[SERVER ERROR] deleteProduct: ", err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


export async function createProduct(formData) {
  const product_name = formData.get("product_name")?.trim();
  let company_id = formData.get("company_id");
  let product_price = formData.get("product_price");

  /* The following two are optional */
  let product_description = formData.get("product_description")?.trim();
  let product_closing_rate = formData.get("product_closing_rate");
  let product_quantity = formData.get("product_quantity");

  product_price = parseFloat(product_price);
  product_closing_rate ? product_closing_rate = parseFloat(product_closing_rate) : null;
  product_quantity ? product_quantity = parseInt(product_quantity) : null;
  company_id ? company_id = parseInt(company_id) : null;

  if (!company_id || !product_name || !product_price)
    return makeError(ErrorCodes.INCOMPLETE_FORM);

  if (!product_description)
    product_description = "";

  if (!product_closing_rate)
    product_closing_rate = 0.0;

  if (!product_quantity)
    product_quantity = 0;
    

  try {
    await db_getCompanyByID(company_id);
    await db_createProduct({
      company_id,
      product_name,
      product_price,
      product_description,
      product_closing_rate,
      product_quantity
    });

    return makeResponse(true);
  } catch (err) {
    if (err.name === "databaseError") {
      if (err.code === SQLErrorCodes.SQLITE_CONSTRAINT_UNIQUE)
        return makeError(ErrorCodes.PRODUCT_ALREADY_REGISTERED);
      
      if (err.code === SQLErrorCodes.CUSTOM_NOT_FOUND) 
        return makeError(ErrorCodes.COMPANY_NOT_FOUND);
    }

    console.error("[SERVER ERROR] createProduct: ", err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


export async function editProduct(formData) {
  const product_name = formData.get("product_name")?.trim();
  let company_id = formData.get("company_id");
  let product_price = formData.get("product_price");

  /* The following two are optional */
  let product_description = formData.get("product_description")?.trim();
  let product_closing_rate = formData.get("product_closing_rate");
  let product_quantity = formData.get("product_quantity");

  product_price = parseFloat(product_price);
  product_closing_rate ? product_closing_rate = parseFloat(product_closing_rate) : null;
  product_quantity ? product_quantity = parseInt(product_quantity) : null;
  company_id ? company_id = parseInt(company_id) : null;

  if (!company_id || !product_name || !product_price)
    return makeError(ErrorCodes.INCOMPLETE_FORM);

  if (!product_description)
    product_description = "";

  if (!product_closing_rate)
    product_closing_rate = 0.0;

  if (!product_quantity)
    product_quantity = 0;



  try {
    await db_getCompanyByID(company_id);
    await db_editProduct({
      company_id,
      product_name,
      product_price,
      product_description,
      product_closing_rate,
      product_quantity
    });

    return makeResponse(true);

  } catch (err) {

    if (err.name === "databaseError") {
      if (err.code === SQLErrorCodes.SQLITE_CONSTRAINT_UNIQUE)
        return makeError(ErrorCodes.PRODUCT_ALREADY_REGISTERED);

      if (err.code === SQLErrorCodes.CUSTOM_NOT_FOUND) 
        return makeError(ErrorCodes.COMPANY_NOT_FOUND);
    }

    console.error("[SERVER ERROR] editProduct: ", err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }

}

export async function getProducts(company_id) {
  if (!company_id || isNaN(company_id)) {
    console.error("[SERVER ERROR] getProducts: ", "Unexpected arguments, expected: getProducts(company_id:number)");
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  company_id = parseInt(company_id);

  try {
    await db_getCompanyByID(company_id);
    const products = await db_getProducts(company_id);
    return makePayload(products);
  } catch (err) {
    console.error("[SERVER ERROR] getProducts: ", err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


export async function getProductsAndCompanies(user_id) {

  if (!user_id || isNaN(user_id)) {
    console.error(
      "[SERVER ERROR] getProducts: ",
      "Unexpected arguments, expected: getProductsAndCompanies(user_id:number)"
    );
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  user_id = parseInt(user_id);

  try {

    const productsAndCompanies = await db_getProductsAndCompanies(user_id);
    return makePayload(productsAndCompanies);

  } catch (err) {

    console.error("[SERVER ERROR] getProductsAndCompanies: ", err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}



/* TODO: Check what happen the session is expired */
export async function getCurrentUserID() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const userID = decodeJwt(token).id;
  return makePayload(userID);
}
