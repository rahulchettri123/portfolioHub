import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function signJWT(payload: any) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d" // 7 days
  })
}

export async function verifyJWT(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
} 