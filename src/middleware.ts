import { type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Por ahora, solo dejar pasar todo
  return
}

export const config = {
  matcher: [],
}