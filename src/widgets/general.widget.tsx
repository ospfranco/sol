import {Assets} from 'assets'
import {FileIcon} from 'components/FileIcon'
import {Key} from 'components/Key'
import {useBoolean} from 'hooks'
import {observer} from 'mobx-react-lite'
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
        'bg-accent bg-opacity-30 rounded': isHovered,
      })}
      onPress={() => {
        store.ui.focusWidget(Widget.SETTINGS)
      }}>
      <Image
        source={Assets.SolWhiteSmall}
        style={tw.style('h-6 w-6 mx-1', {
          tintColor:
            colorScheme === 'dark'
              ? tw.color('text-gray-300')!
              : tw.color('text-gray-700')!,
        })}
      />
    </TouchableOpacity>
  )
}

export const GeneralWidget: FC<Props> = observer(({style}) => {
  const store = useStore()
  return (
    <View
      style={tw.style(
        `flex-row items-center border-t border-lightBorder dark:border-darkBorder px-3 py-2 bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30`,
        style,
      )}>
      <SolIcon />

      {!!store.ui.track?.title && (
        <View
          style={tw`border-r border-lightBorder dark:border-darkBorder h-4 ml-2 mr-3`}
        />
      )}

      {!!store.ui.track?.title && (
        <View style={tw`flex-row items-center`}>
          {!!store.ui.track?.artwork ? (
            <Image
              source={{uri: store.ui.track?.artwork}}
              style={tw`h-6 w-6 rounded-lg`}
            />
          ) : (
            <FileIcon
              url={store.ui.track?.url!}
              style={tw`h-6 w-6 rounded-lg`}
            />
          )}

          <View style={tw`pl-2 flex-row items-center`}>
            <Text style={tw`text-sm max-w-52`} numberOfLines={1}>
              {store.ui.track?.title}
            </Text>
            {!!store.ui.track?.artist && (
              <Text
                style={tw`dark:text-gray-400 text-gray-400 text-sm ml-1`}
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
      {store.ui.focusedWidget !== Widget.CALENDAR &&
        !store.ui.query &&
        !!store.ui.filteredEvents.length && (
          <>
            <Text style={tw`text-xs font-semibold mr-1`}>Appointments</Text>
            <Key title="tab" />
          </>
        )}
      {store.ui.focusedWidget === Widget.SEARCH &&
        !!store.ui.query &&
        store.ui.currentItem?.type === ItemType.CUSTOM && (
          <>
            <Text style={tw`text-xs font-semibold mr-1`}>Delete Shortcut</Text>
            <Key title="⇧ ⌦" />
          </>
        )}
      {store.ui.focusedWidget === Widget.SEARCH && !!store.ui.query && (
        <>
          <Text style={tw`text-xs font-semibold mx-1`}>Open</Text>
          <Key title="⏎" primary />
        </>
      )}
      {store.ui.focusedWidget === Widget.CALENDAR && (
        <>
          <Text style={tw`text-xs font-semibold mr-1`}>
            {store.ui.currentItem?.url ? 'Join' : 'Open  '}
          </Text>
          <Key title="⏎" primary />
        </>
      )}
    </View>
  )
})
