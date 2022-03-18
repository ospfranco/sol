import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'

interface IProps {
  style?: ViewStyle
}

export const GeneralWidget: FC<IProps> = observer(({style}) => {
  const store = useStore()

  return (
    <View style={tw.style(`px-6 pt-1 pb-2 text-gray-200 flex-row`, style)}>
      {/* <Text style={tw`text-xs`}>🎵</Text> */}
      {/* <Image
        source={{uri: store.ui.track?.artwork}}
        style={tw`h-12 w-12 rounded-lg`}
      /> */}

      {store.ui.track?.title == null && (
        <Text style={tw`text-xs pl-2 font-medium`}>-</Text>
      )}
      <Text style={tw`w-48`} numberOfLines={1}>
        <Text style={tw`text-xs pl-1 font-medium`}>
          {store.ui.track?.title}
        </Text>{' '}
        {!!store.ui.track?.artist && (
          <Text style={tw`dark:text-gray-400 text-gray-600 text-xs`}>
            · {store.ui.track?.artist}
          </Text>
        )}
      </Text>
      <View style={tw`flex-1`} />
      {!!store.ui.currentlyTrackedProject && (
        <>
          <Text style={tw`text-xs font-bold pl-1`}>
            {store.ui.currentlyTrackedProject.project.name}
          </Text>
          <Text style={tw`text-xs dark:text-gray-400 text-gray-600 pl-1`}>
            · {Math.floor(store.ui.currentlyTrackedProject.todayTime / 60)}h{' '}
            {store.ui.currentlyTrackedProject.todayTime % 60}m
          </Text>
        </>
      )}
      <View style={tw`flex-1`} />
      <Text style={tw`w-48 text-right`}>
        <Text style={tw`text-xs font-bold`}>{store.ui.currentTemp}°</Text>{' '}
        <Text style={tw`text-xs dark:text-gray-400 text-gray-600`}>
          · {store.ui.nextHourForecast}
        </Text>
      </Text>
    </View>
  )
})
