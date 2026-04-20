import {useState} from 'react'
import {Image, View} from 'react-native'

const Favicon = ({
  url,
  fallback,
  style,
  className,
}: {
  url: string
  fallback: any
  style?: any
  className?: string
}) => {
  const [firstFail, failedFirst] = useState(false)
  const [secondFail, failedSecond] = useState(false)
  const domain = (() => {
    try {
      return url.replace(/^https?:\/\//, '').split('/')[0].split(':')[0]
    } catch {
      return url
    }
  })()

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  const fallbackUrl = `https://${domain}/favicon.ico` // Local asset or remote placeholder

  if (secondFail) {
    return (
      <Image
        source={fallback}
        style={style}
        className={`w-5 h-5 rounded-lg ${className}`}
        resizeMode="contain"
        onError={() => failedSecond(true)}
      />
    )
  }

  return (
    <View className="relative dark:bg-transparent">
      <Image
        source={{uri: firstFail ? fallbackUrl : faviconUrl}}
        className={`w-5 h-5 rounded ${className}`}
        style={style}
        resizeMode="contain"
        onError={() => failedFirst(true)}
      />
      <Image
        source={fallback}
        className="absolute w-4 h-4 rounded-lg -bottom-1 -right-1"
        resizeMode="contain"
      />
    </View>
  )
}

export default Favicon
