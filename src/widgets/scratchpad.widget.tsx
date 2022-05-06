import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {ScrollView, Text, TextInput, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

export const ScratchpadWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()

  return (
    <ScrollView
      style={tw.style(`flex-1`, style)}
      contentContainerStyle={tw`px-6`}>
      <TextInput
        placeholder="A new entry..."
        autoFocus
        // @ts-expect-error
        enableFocusRing={false}
        selectionColor={solNative.accentColor}
        placeholderTextColor={tw.color('text-gray-500')}
      />
      <View style={tw`w-full border-b dark:border-accent mt-2`} />
      <Text
        style={tw`my-4 dark:text-gray-400`}>{`About the metaphysics of random coin tosses\nNeed to make up my mind if god plays the dice with my coin tosses or not!`}</Text>
      <View style={tw`w-full border-b dark:border-darkBorder`} />
      <Text
        style={tw`my-4 dark:text-gray-400`}>{`Remember to call Lena\n\nNeed to ask if we are going to bike riding on Sunday`}</Text>
      <View style={tw`w-full border-b dark:border-darkBorder`} />
    </ScrollView>
  )
})
