import {Input} from 'components/Input'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface IProps {
  style?: ViewStyle
}

export const ProjectCreationWidget: FC<IProps> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()

  return (
    <View style={tw.style(`flex-1 items-center p-6 justify-center`, style)}>
      <View style={tw`w-92`}>
        <Text style={tw`font-medium`}>Create Tracking Project</Text>
        <View
          style={tw`w-full rounded border border-gray-500 dark:border-gray-700 bg-transparent px-2 py-2 mt-4`}>
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
    </View>
  )
})
