import {Assets} from 'assets'
import {FileIcon} from 'components/FileIcon'
import {Key} from 'components/Key'
import {useBoolean} from 'hooks'
import {observer} from 'mobx-react-lite'
import {styled} from 'nativewind'
import React, {FC} from 'react'
import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import {ItemType, Widget} from 'stores/ui.store'
import tw from 'tailwind'

interface Props {
  style?: ViewStyle
}

const StyledFileIcon = styled(FileIcon)

const SolIcon = () => {
  const store = useStore()
  const colorScheme = useColorScheme()
  const [isHovered, hoverOn, hoverOff] = useBoolean()

  return (
    <TouchableOpacity
      // @ts-expect-error
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      style={tw.style({
        'dark:bg-proGray-900 dark:border-neutral-300 rounded': isHovered,
      })}
      onPress={() => {
        store.ui.focusWidget(Widget.SETTINGS)
      }}>
      <Image
        source={Assets.SolWhiteSmall}
        className="h-6 w-6 mx-1"
        style={{
          tintColor:
            colorScheme === 'dark'
              ? tw.color('text-gray-300')!
              : tw.color('text-gray-700')!,
        }}
      />
    </TouchableOpacity>
  )
}

export const GeneralWidget: FC<Props> = observer(({style}) => {
  const store = useStore()
  return (
    <View className="flex-row items-center border-t border-lightBorder dark:border-darkBorder pl-2 pr-2 py-1 bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30">
      <SolIcon />

      {!!store.ui.track?.title && (
        <View className="border-r border-lightBorder dark:border-darkBorder h-4 ml-2 mr-3" />
      )}

      {!!store.ui.track?.title && (
        <View className="flex-row items-center">
          {!!store.ui.track?.artwork ? (
            <Image
              source={{uri: store.ui.track?.artwork}}
              className="h-6 w-6 rounded-lg"
            />
          ) : (
            <StyledFileIcon
              url={store.ui.track?.url!}
              className="h-6 w-6 rounded-lg"
            />
          )}

          <View className="pl-2 flex-row items-center">
            <Text className="text-sm max-w-52" numberOfLines={1}>
              {store.ui.track?.title}
            </Text>
            {!!store.ui.track?.artist && (
              <Text
                className="dark:text-gray-400 text-gray-400 text-sm ml-1"
                numberOfLines={1}>
                {store.ui.track?.artist}
              </Text>
            )}
          </View>
        </View>
      )}

      {!!store.ui.track?.title && !!store.ui.currentTemp && (
        <View className="border-l border-lightBorder dark:border-darkBorder h-full mx-4" />
      )}

      {!!store.ui.currentTemp && (
        <View>
          <Text className="text-sm">{store.ui.currentTemp}°</Text>
          <Text className="text-sm dark:text-gray-400 text-gray-500 capitalize">
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

      <View className="flex-1" />
      {store.ui.focusedWidget !== Widget.CALENDAR &&
        !store.ui.query &&
        !!store.ui.filteredEvents.length && (
          <>
            <Text className="text-xxs mr-1">Appointments</Text>
            <Key title="tab" brRounded />
          </>
        )}
      {!!store.ui.upcomingEvent &&
        store.ui.focusedWidget === Widget.SEARCH &&
        !store.ui.query && (
          <>
            <Text className="text-xxs dark:text-white ml-3 mr-1">
              Join "{store.ui.upcomingEvent.title}"
            </Text>
            <Key title="return" primary />
          </>
        )}
      {store.ui.focusedWidget === Widget.SEARCH &&
        !!store.ui.query &&
        store.ui.currentItem?.type === ItemType.CUSTOM && (
          <>
            <Text className="text-xxs dark:text-white mr-1">Delete</Text>
            <Key title="⇧ ⌦" />
          </>
        )}

      {store.ui.focusedWidget === Widget.SEARCH && !!store.ui.query && (
        <>
          <Text className="text-xxs dark:text-white mx-1">Open</Text>
          <Key title="⏎" primary brRounded />
        </>
      )}
      {store.ui.focusedWidget === Widget.CALENDAR && (
        <>
          <Text className="text-xxs dark:text-white mr-1">
            {store.ui.currentItem?.url ? 'Join' : 'Open  '}
          </Text>
          <Key title="⏎" primary brRounded />
        </>
      )}
    </View>
  )
})
