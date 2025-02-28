import cors from "cors";
import { Request, Response, NextFunction } from "express";

export const corsMiddleware = [
  cors({
    origin: ["http://localhost:5173","http://localhost:5174" ], // Allow requests from your frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
    credentials: true, // Allow sending credentials like cookies
  }),
  // Custom middleware to add the Cross-Origin-Resource-Policy header
  (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  }
];
