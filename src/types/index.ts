import { Request } from 'express';
import { User } from '../users/entities/user.entity';

export interface RequestWithUser extends Request {
  user: User;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
