import jwt from "jsonwebtoken" ; 

export const generateToken = (userId, res) => {
  const token = jwt.sign({userId}, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true, // Must be true in production
    domain: process.env.COOKIE_DOMAIN || "quictalk-backend-production.up.railway.app"
  });
  
  return token;
};