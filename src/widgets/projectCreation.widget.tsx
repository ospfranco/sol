import {observer} from 'mobx-react-lite'
import React, {FC, useState} from 'react'
import {StyleProp, Text, TextInput, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface IProps {
  style?: StyleProp<ViewStyle>
}

export const ProjectCreationWidget: FC<IProps> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()

  return (
    <View
      style={tw.style(
        `flex-1 items-center p-6`,
        //@ts-ignore
        style,
      )}>
      <View style={tw`w-92`}>
        <Text style={tw`font-medium self-center`}>Create Tracking Project</Text>
        <TextInput
          autoFocus
          // @ts-ignore
          enableFocusRing={false}
          value={store.ui.tempProjectName}
          onChangeText={store.ui.setTempProjectName}
          placeholder="Project name"
          style={tw`w-full rounded border border-gray-500 bg-transparent px-2 py-2 mt-8`}
        />
      </View>
    </View>
  )
})
