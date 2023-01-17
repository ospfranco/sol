import {LogBox} from 'react-native'
import Fuse from 'fuse.js'

LogBox.ignoreLogs(['Clipboard ', 'Component', 'Require cycle:'])

export const FUSE_OPTIONS: Fuse.IFuseOptions<any> = {
  threshold: 0.15,
  ignoreLocation: true,
  findAllMatches: true,
  keys: [{name: 'name', weight: 3}, 'url'],
}
