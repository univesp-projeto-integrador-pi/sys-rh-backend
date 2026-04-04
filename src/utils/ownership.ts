import { AppError } from '../middlewares/errorHandler.middleware';

export function assertOwnership(
  resourceOwnerId: string,
  requestingUserId: string,
  message = 'Acesso negado a este recurso'
): void {
  if (resourceOwnerId !== requestingUserId) {
    throw new AppError(message, 403);
  }
}