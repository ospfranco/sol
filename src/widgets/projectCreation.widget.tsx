import {Input} from 'components/Input'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

export const ProjectCreationWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()

  return (
    <View style={tw.style(`flex-1 items-center p-6 justify-center`, style)}>
      <View style={tw`w-92`}>
        <Text style={tw`font-medium`}>Create Tracking Project</Text>

        <Input
          autoFocus
          // @ts-ignore
          enableFocusRing={false}
          value={store.ui.tempProjectName}
          onChangeText={store.ui.setTempProjectName}
          placeholder="Project name"
          style={tw`w-full`}
        />
      </View>
    </View>
  )
})
