import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync';
import { successResponse, errorResponse } from '../utils/response';
import { prisma } from '../config/db'; 


const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json(errorResponse("Conflict", ["Email already in use"]));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
    select: { id: true, name: true, email: true, role: true }
  });

  res.status(201).json(successResponse("User registered successfully", newUser));
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json(errorResponse("Invalid credentials"));
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

  res.json(successResponse("Login successful", { token, user: { id: user.id, name: user.name, role: user.role } }));
});