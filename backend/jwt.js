const crypto = require("crypto");
require("dotenv").config({ path: "../.env" });

function base64urlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(input) {
  console.log(input);
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4;
  if (pad) input += "=".repeat(4 - pad);
  return Buffer.from(input, "base64").toString();
}

function createJWT(email, expSeconds = 8400) {
  let header = {
    alg: "HS256",
    typ: "JWT",
  };
  let payload = {
    email,
    exp: Math.floor(Date.now() / 1000) + expSeconds,
  };
  header = base64urlEncode(JSON.stringify(header));
  payload = base64urlEncode(JSON.stringify(payload));
  let signature = crypto
    .createHmac("sha256", process.env.JWT_SK)
    .update(`${header}.${payload}`)
    .digest();
  signature = base64urlEncode(signature);
  const jwt = `${header}.${payload}.${signature}`;
  return jwt;
}

function verifyJWT(token) {
  try {
    const [headerEnc, payloadEnc, signatureEnc] = token.split(".");

    const signatureCheck = crypto
      .createHmac("sha256", process.env.JWT_SK)
      .update(`${headerEnc}.${payloadEnc}`)
      .digest();
    const signatureCheckEnc = base64urlEncode(signatureCheck);

    const payload = JSON.parse(base64urlDecode(payloadEnc));

    if (signatureCheckEnc !== signatureEnc)
      return { valid: false, message: "Bad signature" };

    if (payload.exp < Math.floor(Date.now() / 1000))
      return { valid: false, message: "Token expired" };

    return { valid: true, email: payload.email };
  } catch (err) {
    return { valid: false, message: "Invalid token: " + err };
  }
}

module.exports = { verifyJWT, createJWT };
