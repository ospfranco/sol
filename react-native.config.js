const {
  createEsbuildCommands,
  esmCustomMainFieldResolverPlugin,
} = require('react-native-esbuild')

const commands = createEsbuildCommands(({plugins, ...rest}) => ({
  ...rest,
  plugins: plugins.concat(esmCustomMainFieldResolverPlugin()),
}))

module.exports = {
  commands,
}
