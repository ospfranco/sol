import { solNative } from 'lib/SolNative'
import { create } from 'twrnc'
const config = require('../tailwind.config.js')

config.theme.extend.colors.highlight = solNative.accentColor

const tw = create(config)

export default tw
