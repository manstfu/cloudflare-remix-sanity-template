import {createCookie} from '@remix-run/cloudflare'

export const themePreferenceCookie = createCookie(`themePreference`, {
  path: '/',
})
