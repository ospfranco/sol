const {
  createEsbuildCommands,
  esmCustomMainFieldResolverPlugin,
} = require('react-native-esbuild')

const commands = createEsbuildCommands(({plugins, ...rest}) => ({
  ...rest,
  plugins: plugins.concat(esmCustomMainFieldResolverPlugin()),
  resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
    .map(extension => [
      `.macos${extension}`,
      `.ios${extension}`,
      `.native${extension}`,
      `.react-native${extension}`,
      extension,
    ])
    .flat(),
}))

module.exports = {
  commands,
}
