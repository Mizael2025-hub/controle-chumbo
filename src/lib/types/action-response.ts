export type ActionResponse<T = void> = {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}
