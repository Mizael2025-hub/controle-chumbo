export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }

  static notFound(entity: string): AppError {
    return new AppError(`${entity} não encontrado.`, 'NOT_FOUND', 404)
  }

  static unauthorized(): AppError {
    return new AppError('Acesso negado.', 'UNAUTHORIZED', 403)
  }

  static conflict(message: string): AppError {
    return new AppError(message, 'CONFLICT', 409)
  }

  static validation(message: string): AppError {
    return new AppError(message, 'VALIDATION', 422)
  }

  static offlineRequired(): AppError {
    return new AppError('Conecte-se à internet para continuar.', 'OFFLINE_REQUIRED', 503)
  }
}
