import {Assets, Icons} from 'assets'
import {FileIcon} from 'components/FileIcon'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget, Item, ItemType} from 'stores'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import {WebView} from 'react-native-webview'

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
