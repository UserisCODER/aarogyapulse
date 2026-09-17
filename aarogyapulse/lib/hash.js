import crypto from "crypto";

// scrypt is built into Node, so there is no bcrypt dependency to install.
export function hashPassword(password) {
  const salt = crypto.randomBytes(8).toString("hex");
  const derived = crypto.scryptSync(password, salt, 32).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password, stored) {
  if (!stored) return false;
  const [scheme, salt, derived] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !derived) return false;
  const check = crypto.scryptSync(password, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(check, "hex"), Buffer.from(derived, "hex"));
}
