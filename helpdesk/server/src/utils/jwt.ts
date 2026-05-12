// JWT abifunktsioonid tokenite genereerimiseks ja valideerimiseks
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};
