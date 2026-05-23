import type { Response } from "express"

type TResponse<T> = {
  statusCode: number
  success: boolean
  message: string,
  data?: T,
  errors?: unknown
}

export const sendResponse = <T>(
  res: Response,
  payload: TResponse<T>
) => {
  const { statusCode, success, message, data, errors } = payload

  const responseData: Record<string, unknown> = {
    success,
    message,
  }

  if (success) {
    if (data !== undefined) responseData.data = data;
  } else {
    if (errors !== undefined) responseData.errors = errors;
  }

  return res.status(statusCode).json(responseData)
}