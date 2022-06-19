import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {Image, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {FileIcon} from 'components/FileIcon'

interface Props {
  style?: ViewStyle
}

export const GeneralWidget: FC<Props> = observer(({style}) => {
  const store = useStore()

  if (
    !store.ui.track &&
    !store.ui.currentTemp &&
    !store.ui.currentlyTrackedProject
  ) {
    return null
  }

  return (
    <View
      style={tw.style(
        `text-gray-200 flex-row items-center border-t border-lightBorder dark:border-darkBorder mx-3 p-3`,
        style,
      )}>
      {!!store.ui.track?.artwork ? (
        <Image
          source={{uri: store.ui.track?.artwork}}
          style={tw`h-10 w-10 rounded-lg`}
        />
      ) : (
        <FileIcon url={store.ui.track?.url!} style={tw`h-10 w-10 rounded-lg`} />
      )}

      {!!store.ui.track?.title && (
        <View style={tw`pl-1`}>
          <Text style={tw`text-sm max-w-42`} numberOfLines={1}>
            {store.ui.track?.title}{' '}
          </Text>
          {!!store.ui.track?.artist && (
            <Text
              style={tw`dark:text-gray-400 text-gray-500 text-sm`}
              numberOfLines={1}>
              {store.ui.track?.artist}
            </Text>
          )}
        </View>
      )}

      {!!store.ui.track?.title && !!store.ui.currentTemp && (
        <View
          style={tw`border-l border-lightBorder dark:border-darkBorder h-full mx-4 mt-1`}
        />
      )}

      {!!store.ui.currentTemp && (
        <View>
          <Text style={tw`text-sm`}>{store.ui.currentTemp}°</Text>
          <Text style={tw`text-sm dark:text-gray-400 text-gray-500 capitalize`}>
            {store.ui.nextHourForecast}
          </Text>
        </View>
      )}

      {!!store.ui.currentTemp && !!store.ui.currentlyTrackedProject && (
        <View
          style={tw`border-l border-lightBorder dark:border-darkBorder h-3 mx-4 mt-1`}
        />
      )}

      {!!store.ui.currentlyTrackedProject ? (
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-sm dark:text-gray-400 text-gray-500 pl-1`}>
            {store.ui.currentlyTrackedProject.project.name}
          </Text>
          <Text style={tw`text-sm dark:text-gray-400 text-gray-500 pl-1`}>
            · {Math.floor(store.ui.currentlyTrackedProject.todayTime / 60)}h{' '}
            {store.ui.currentlyTrackedProject.todayTime % 60}m
          </Text>
        </View>
      ) : (
        <View />
      )}
    </View>
  )
})
