import {LogBox} from 'react-native'
import Fuse, {IFuseOptions} from 'fuse.js'
import * as Sentry from '@sentry/react-native'
import {SentryDSN} from './env'

LogBox.ignoreLogs(['Clipboard ', 'Component', 'Require cycle:'])

export const FUSE_OPTIONS: IFuseOptions<any> = {
  threshold: 0.15,
  ignoreLocation: true,
  findAllMatches: true,
  keys: [
    {name: 'name', weight: 0.9},
    {name: 'alias', weight: 0.1},
  ],
}

if (!__DEV__) {
  Sentry.init({
    dsn: SentryDSN,
    enableAppHangTracking: false,
  })
}
