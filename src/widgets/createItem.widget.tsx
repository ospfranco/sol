import {Input} from 'components/Input'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef, useState} from 'react'
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

export const CreateItemWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()
  const inputRef = useRef<TextInput | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <View style={tw.style(`flex-1 items-center p-6 justify-center`, style)}>
      <View style={tw`w-92`}>
        <Text style={tw`font-medium`}>Create Link/Shortcut</Text>

        <Input
          inputRef={inputRef}
          // @ts-ignore
          enableFocusRing={false}
          value={store.ui.tempProjectName}
          onChangeText={store.ui.setTempProjectName}
          placeholder="Item name"
          style={tw`w-full`}
        />

        <TouchableOpacity
          onPress={async () => {
            const importedPath = await solNative.importImage()
            setImageUrl(importedPath)
          }}>
          <Text>Select a file</Text>
        </TouchableOpacity>
        {!!imageUrl && <Image source={{uri: imageUrl}} style={tw`h-20 w-20`} />}
      </View>
    </View>
  )
})
