import {LogBox} from 'react-native'

LogBox.ignoreLogs(['Clipboard ', 'Component', 'Require cycle:'])

export const FUSE_OPTIONS = {
  threshold: 0.2,
  ignoreLocation: true,
  keys: ['name', 'url'],
}
