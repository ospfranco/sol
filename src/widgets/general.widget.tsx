import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {Image, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {FileIcon} from 'components/FileIcon'
import {FocusableWidget} from 'stores'

interface Props {
  style?: ViewStyle
}

const Key: FC<{title: string}> = ({title}) => {
  return (
    <View style={tw`py-1 px-2 rounded-sm dark:bg-neutral-700 bg-neutral-200`}>
      <Text style={tw`text-xxs dark:text-neutral-400 text-neutral-600`}>
        {title}
      </Text>
    </View>
  )
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
        `text-gray-200 flex-row items-center border-t border-lightBorder dark:border-darkBorder px-3 py-2 bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30`,
        style,
      )}>
      {!!store.ui.track?.title && (
        <View style={tw`flex-row items-center`}>
          {!!store.ui.track?.artwork ? (
            <Image
              source={{uri: store.ui.track?.artwork}}
              style={tw`h-10 w-10 rounded-lg`}
            />
          ) : (
            <FileIcon
              url={store.ui.track?.url!}
              style={tw`h-10 w-10 rounded-lg`}
            />
          )}

          <View style={tw`pl-2`}>
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
        </View>
      )}

      {!!store.ui.track?.title && !!store.ui.currentTemp && (
        <View
          style={tw`border-l border-lightBorder dark:border-darkBorder h-full mx-4`}
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
          style={tw`border-l border-lightBorder dark:border-darkBorder h-3 mx-4`}
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

      <View style={tw`flex-1`} />
      {store.ui.focusedWidget !== FocusableWidget.CALENDAR && (
        <>
          <Text style={tw`text-xs mr-2`}>Next Event</Text>
          <Key title="tab" />
        </>
      )}
      {store.ui.focusedWidget === FocusableWidget.CALENDAR && (
        <>
          <Text style={tw`text-xs mr-2`}>Join Event</Text>
          <Key title="⏎" />
        </>
      )}
    </View>
  )
})
