// auth.ts
import bcrypt from 'bcrypt';
import { generateToken } from './jwt';
import { Logger } from '../shared/logger';
import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Extend the global object to include the userManagementPool
declare global {
  var userManagementPool: Pool | undefined;
}

// Middleware to authenticate user
const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  Logger.info('Entered authenticateUser middleware');
  const { username, password } = req.body;
  const userIp = req.ip;
  Logger.info(`Attempting login for user: ${username} from IP: ${userIp}`);

  try {
    if (!global.userManagementPool) {
      throw new Error('User management pool is not initialized. Check your app setup.');
    }

    Logger.info(`Querying user_management DB for user: ${username}`);
    const response = await global.userManagementPool.query(
      'SELECT * FROM public.users WHERE username = $1',
      [username]
    );

    const user = response.rows[0];
    Logger.info(user);

    if (!user) {
      Logger.warn(`User not found: ${username} from IP: ${userIp}`);
      return res.status(401).send('User not found');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      Logger.warn(`Invalid password for user: ${username} from IP: ${userIp}`);
      return res.status(401).send('Invalid password');
    }

    const token = generateToken(user);
    Logger.info(`Token generated for user: ${username}`);
    res.locals.token = token;
    next();
  } catch (error:any) {
    Logger.error(`Internal server error for user: ${username} from IP: ${userIp}`, {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).send('Internal server error');
  }
};



export default authenticateUser;