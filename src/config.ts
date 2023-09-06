import {LogBox} from 'react-native'
import Fuse from 'fuse.js'
import * as Sentry from '@sentry/react-native'

LogBox.ignoreLogs(['Clipboard ', 'Component', 'Require cycle:'])

export const FUSE_OPTIONS: Fuse.IFuseOptions<any> = {
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
    dsn: 'https://51f61feb4c66446e88e4211a6aebf0b7@o386747.ingest.sentry.io/6377873',
  })
}
