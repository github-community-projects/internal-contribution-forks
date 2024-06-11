import { personalOctokit } from 'bot/octokit'
import { AuthOptions, Profile } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { logger } from '../../../../utils/logger'
import { JWT } from 'next-auth/jwt'

import 'utils/proxy'

const authLogger = logger.child({ name: 'auth' })

/**
 * Converts seconds until expiration to date in milliseconds
 * @param seconds Seconds until expiration to convert
 * @returns number — Expiration date in milliseconds
 */
const normalizeExpirationDate = (seconds: number) => {
  return Date.now() + seconds * 1000
}

/**
 * Checks the session against the github API to see if the session is valid
 * @param token Token of the session
 * @returns boolean — Whether the session is valid
 */
export const verifySession = async (token: string | undefined) => {
  if (!token) return false

  const octokit = personalOctokit(token)
  try {
    await octokit.rest.users.getAuthenticated()
    return true
  } catch (error) {
    return false
  }
}

/**
 * Refresh access token
 * @param clientId Client ID
 * @param clientSecret Client Secret
 * @param refreshToken Refresh token
 * @returns object — New access token and refresh token
 */
export const refreshAccessToken = async (
  token: JWT,
  clientId: string,
  clientSecret: string,
  refreshToken: string,
) => {
  try {
    authLogger.debug('Refreshing access token for: ' + clientId)

    const url =
      'https://github.com/login/oauth/access_token?' +
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      })

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    }).then(async (res) => {
      const responseText = await res.text()
      const entries = new URLSearchParams(responseText)
      const params = Object.fromEntries(entries)

      if (params.error) {
        throw new Error(params.error_description)
      }

      return params
    })

    return {
      accessToken: response.access_token,
      // Access token expiration is provided as number in seconds until expiration (value is always 8 hours)
      accessTokenExpires: normalizeExpirationDate(Number(response.expires_in)),
      refreshToken: response.refresh_token,
      // Refresh token expiration is provided as number of seconds until expiration (value is always 6 months)
      refreshTokenExpires: normalizeExpirationDate(
        Number(response.refresh_token_expires_in),
      ),
    }
  } catch (error) {
    authLogger.error(new Error('Error refreshing access token'))

    // Return the original token with an error if we failed to refresh the token so the user gets signed out
    return {
      ...token,
      error: 'RefreshAccessTokenError' as const,
    }
  }
}

export const nextAuthOptions: AuthOptions = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'repo, user, read:org' },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  logger: {
    error(code, metadata) {
      if (!(metadata instanceof Error) && metadata.provider) {
        // redact the provider secret here
        delete metadata.provider

        authLogger.error('Auth error', {
          code,
          metadata,
        })
      } else {
        authLogger.error('Auth error', {
          code,
          metadata,
        })
      }
    },
    warn(code) {
      authLogger.warn(code)
    },
    debug(code, metadata) {
      authLogger.debug('Auth debug', {
        code,
        metadata,
      })
    },
  },
  callbacks: {
    signIn: async (params) => {
      authLogger.debug('Sign in callback')

      const profile = params.profile as Profile & { login?: string }
      const allowedHandles = (
        process.env.ALLOWED_HANDLES?.split(',') ?? []
      ).filter((handle) => handle !== '')

      if (allowedHandles.length === 0) {
        authLogger.info(
          'No allowed handles specified via ALLOWED_HANDLES, allowing all users.',
        )
        return true
      }

      if (!profile?.login) {
        return false
      }

      authLogger.debug('Trying to sign in with handle: ' + profile.login)

      if (allowedHandles.includes(profile.login)) {
        return true
      }

      authLogger.warn(
        `User "${profile.login}" is not in the allowed handles list`,
      )

      return false
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.name = token.name as string
        session.user.image = token.image as string
        session.user.email = token.email as string
        session.user.accessToken = token.accessToken as string
        session.expires = new Date(
          token.accessTokenExpires as number,
        ).toISOString()
        session.error = token.error
      }

      return session
    },
    jwt: async ({ token, user, account }) => {
      // Initial sign in
      if (user && account) {
        authLogger.debug('Initial sign in')
        token = {
          accessToken: account.access_token as string,
          // Access token expiration is provided as number in seconds since epoch (value is always 8 hours)
          // Convert to milliseconds
          accessTokenExpires: (account.expires_at as number) * 1000,
          refreshToken: account.refresh_token as string,
          // Refresh token expiration is provided as number of seconds until expiration (value is always 6 months)
          refreshTokenExpires: normalizeExpirationDate(
            account.refresh_token_expires_in as number,
          ),
          ...user,
        }

        return token
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        authLogger.debug('Access token valid')
        return token
      }

      authLogger.debug('Access token has expired')

      // Return previous token if the refresh token has expired
      if (Date.now() >= (token.refreshTokenExpires as number)) {
        authLogger.warn('Refresh token has expired')
        return token
      }

      // Refresh the access token
      const refreshedToken = await refreshAccessToken(
        token,
        process.env.GITHUB_CLIENT_ID!,
        process.env.GITHUB_CLIENT_SECRET!,
        token.refreshToken as string,
      )

      // Return the previous token if we failed to refresh the token
      if (!refreshedToken) {
        return token
      }

      // Return the new token
      token = {
        ...refreshedToken,
        ...user,
      }

      return token
    },
  },
}
