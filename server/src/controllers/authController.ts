import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JwtPayload } from '../types/index.js';

// ─── Register ────────────────────────────────────────────────────────────────

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role: string;
    };

    // Input validation
    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    if (!['admin', 'sales'].includes(role)) {
      res.status(400).json({ success: false, message: 'Role must be admin or sales' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }

    // Create new user (password hashed via pre-save hook)
    const user = await User.create({ name, email, password, role });

    // Generate JWT
    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const payload: JwtPayload = { id: String(user._id), role: user.role };
    // Using 'as any' here because the jwt.sign overload typing doesn't accept
    // a string for expiresIn without complex generics — value is validated above.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = jwt.sign(payload, secret, { expiresIn } as any);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    // Find user and include password field (excluded by default via toJSON)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const payload: JwtPayload = { id: String(user._id), role: user.role };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = jwt.sign(payload, secret, { expiresIn } as any);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
