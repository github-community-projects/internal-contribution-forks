import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      accessToken: string | undefined
    } & DefaultSession['user']
  }
}
