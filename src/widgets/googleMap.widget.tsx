import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {View, ViewStyle} from 'react-native'
import {WebView} from 'react-native-webview'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

export const GoogleMapWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()

  return (
    <View style={tw`flex-1`}>
      <WebView
        source={{
          uri: `https://www.google.com/maps/search/${store.ui.query}`,
        }}
        style={tw`flex-1`}
      />
    </View>
  )
})
