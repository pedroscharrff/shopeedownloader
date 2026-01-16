import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || '';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign({ userId }, secret, { expiresIn } as any);
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET || '';
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign({ userId }, secret, { expiresIn } as any);
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  const secret = process.env.JWT_REFRESH_SECRET || '';
  return jwt.verify(token, secret) as { userId: string };
};
