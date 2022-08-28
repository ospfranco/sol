declare module '*.png' {
  const value: import('react-native').ImageSourcePropType
  export default value
}

declare module '*.jpeg' {
  const value: import('react-native').ImageSourcePropType
  export default value
}

declare var global: {
  __SolProxy: {
    setHeight: (height: number) => void
    resetWindowSize: () => void
    hideWindow: () => void
    getMediaInfo: () => Promise<
      | {
          title: string
          artist: string
          artwork: string
          bundleIdentifier: string
          url: string
        }
      | null
      | undefined
    >
    searchFiles: (query: string) => void
  }
}
