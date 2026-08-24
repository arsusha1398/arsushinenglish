import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

const prisma = new PrismaClient();

export const register = async (email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.user.create({
    data: { email, password: hashedPassword },
  });
};

export const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user: { id: user.id, email: user.email, role: user.role }, accessToken, refreshToken };
};
