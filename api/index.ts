import { Request, Response } from 'express';
import { createApp } from '../backend/src/app';

const app = createApp();

export default function handler(req: Request, res: Response) {
  return app(req, res);
}
