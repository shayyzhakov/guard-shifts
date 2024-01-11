import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Request, Response, NextFunction } from 'express';

export function authenticateUser() {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.AWS_USER_POOL_ID ?? '',
    tokenUse: 'access',
    clientId: process.env.AWS_USER_POOL_CLIENT_ID ?? '',
  });
  verifier.hydrate();

  const authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new Error('Authorization header missing');
      }

      if (!authHeader.startsWith('Bearer ')) {
        throw new Error('Authorization header missing Bearer prefix');
      }

      const accessToken = authHeader.substring(7);
      if (!accessToken?.length) {
        throw new Error('Authorization header missing access token');
      }

      await verifier.verify(accessToken);

      next();
    } catch (err) {
      console.log('Token not valid:', err instanceof Error ? err.message : err);
      res.status(401).json({ message: 'Unauthorized' });
    }
  };

  return authenticateUser;
}
