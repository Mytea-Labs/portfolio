import type { Config } from '@netlify/functions'
import { checkPassword, createToken, isConfigured } from '../lib/auth.mts'

export default async (req: Request) => {
  if (!isConfigured()) {
    return Response.json({ error: 'Admin password is not configured on the server.' }, { status: 503 })
  }

  let password = ''
  try {
    ;({ password } = await req.json())
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (!checkPassword(password)) {
    // Small delay to slow down guessing
    await new Promise((resolve) => setTimeout(resolve, 750))
    return Response.json({ error: 'Incorrect password!' }, { status: 401 })
  }

  return Response.json(createToken())
}

export const config: Config = {
  path: '/api/admin/login',
  method: 'POST',
}
