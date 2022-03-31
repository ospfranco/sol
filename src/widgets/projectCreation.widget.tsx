import {Input} from 'components/Input'
import {SolButton} from 'components/SolButton'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {Text, TouchableOpacity, View, ViewStyle} from 'react-native'
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
    <View style={tw.style(`flex-1`, style)}>
      <TouchableOpacity
        style={tw`border-b border-lightBorder dark:border-darkBorder p-3`}
        onPress={() => {
          store.ui.onHide()
        }}>
        <Text style={tw``}>
          <Text style={tw`text-gray-500`}>←</Text> Create Tracking Project
        </Text>
      </TouchableOpacity>
      <View style={tw`p-3 flex-1`}>
        <Input
          autoFocus
          value={store.ui.tempProjectName}
          onChangeText={store.ui.setTempProjectName}
          placeholder="Project name"
          style={tw`w-full`}
          inputStyle={tw`text-lg`}
        />
      </View>
      <View
        style={tw`border-t border-lightBorder dark:border-darkBorder items-end px-3 py-2`}>
        <SolButton
          title="Create"
          onPress={() => {
            store.ui.createTrackingProject()
          }}
        />
      </View>
    </View>
  )
})
