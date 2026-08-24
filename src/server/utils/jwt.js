import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || "secret", {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || "refresh_secret", {
    expiresIn: "7d",
  });
};
