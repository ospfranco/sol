import {useState} from 'react'
import {Image, View} from 'react-native'

const Favicon = ({url, fallback}: {url: string; fallback: any}) => {
  const [firstFail, failedFirst] = useState(false)
  const [secondFail, failedSecond] = useState(false)
  const parsedUrl = new URL(url)

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${parsedUrl.host}&sz=64`
  const fallbackUrl = `https://${parsedUrl.host}/favicon.ico` // Local asset or remote placeholder

  if (secondFail) {
    return (
      <Image
        source={fallback}
        className="w-5 h-5 rounded-lg"
        resizeMode="contain"
        onError={() => failedSecond(true)}
      />
    )
  }

  return (
    <View className="relative dark:bg-transparent">
      <Image
        source={{uri: firstFail ? fallbackUrl : faviconUrl}}
        className="w-5 h-5 rounded"
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
