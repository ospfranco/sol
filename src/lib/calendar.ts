import {CONSTANTS} from './constants'

export const MEETING_PROVIDERS_URLS = [
  'https://us01web.zoom.us',
  'https://us02web.zoom.us',
  'https://us03web.zoom.us',
  'https://us04web.zoom.us',
  'https://us05web.zoom.us',
  'https://us06web.zoom.us',
  'https://meet.google.com',
  'https://meet.ffmuc.net',
  'https://teams.microsoft.com',
]

export function extractMeetingLink(text?: string, location?: string) {
  let link = text
    ?.replace(/\n/g, ' ')
    .split(' ')
    .filter(token => CONSTANTS.REGEX_VALID_URL.test(token))
    .find(link =>
      MEETING_PROVIDERS_URLS.some(baseUrl => link.includes(baseUrl)),
    )

  if (!link && !!location) {
    const isLocationUrl = CONSTANTS.REGEX_VALID_URL.test(location)
    if (isLocationUrl) {
      link = location
    }
  }

  return link
}
