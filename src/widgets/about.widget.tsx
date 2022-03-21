import {Assets} from 'assets'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {Appearance, Image, Text, View, ViewStyle} from 'react-native'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

export const AboutWidget: FC<Props> = observer(({style}) => {
  const colorScheme = Appearance.getColorScheme()
  useDeviceContext(tw)

  return (
    <View
      style={tw.style(
        `flex-1 p-4 justify-center items-center flex-row`,
        style,
      )}>
      <Image
        source={Assets.Logo}
        style={tw.style(`h-32 w-32`, {
          tintColor: colorScheme === 'dark' ? 'white' : 'black',
        })}
      />
      <View style={tw`pl-3`}>
        <Text style={tw`font-thin text-3xl`}>SOL</Text>
        <Text style={tw``}>Beta Version</Text>
        <Text style={tw`pt-2`}>Oscar Franco</Text>
        <Text>All rights reserved 2022</Text>
      </View>
    </View>
  )
})
