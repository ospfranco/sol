import {FileIcon} from 'components/FileIcon'
import {solNative} from 'lib/SolNative'
import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import React, {useEffect} from 'react'
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {useStore} from 'store'
import {Widget} from 'stores/ui.store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import {CalendarWidget} from 'widgets/calendar.widget'
import {ClipboardWidget} from 'widgets/clipboard.widget'
import {CreateItemWidget} from 'widgets/createItem.widget'
import {EmojisWidget} from 'widgets/emojis.widget'
import {GeneralWidget} from 'widgets/general.widget'
import {GifsWidget} from 'widgets/gifs.widget'
import {GoogleMapWidget} from 'widgets/googleMap.widget'
import {OnboardingWidget} from 'widgets/onboarding.widget'
import {ProjectCreationWidget} from 'widgets/projectCreation.widget'
import {ProjectSelectWidget} from 'widgets/projectSelect.widget'
import {ScratchpadWidget} from 'widgets/scratchpad.widget'
import {SearchWidget} from 'widgets/search.widget'
import {SettingsWidget} from 'widgets/settings.widget'
import {TranslationWidget} from 'widgets/translation.widget'

export const RootContainer = observer(() => {
  useDeviceContext(tw)
  const store = useStore()
  const mainStyle = tw`bg-white dark:bg-dark bg-opacity-80`
  const calendarVisible =
    (store.ui.calendarAuthorizationStatus === 'authorized' ||
      store.ui.calendarAuthorizationStatus === 'notDetermined') &&
    store.ui.calendarEnabled

  const widget = store.ui.focusedWidget

  useEffect(() => {
    return () => {
      store.ui.cleanUp()
    }
  }, [])

  if (widget === Widget.CLIPBOARD) {
    return <ClipboardWidget style={mainStyle} />
  }

  if (widget === Widget.GIFS) {
    return <GifsWidget style={mainStyle} />
  }

  if (widget === Widget.EMOJIS) {
    return <EmojisWidget style={mainStyle} />
  }

  if (widget === Widget.SCRATCHPAD) {
    return <ScratchpadWidget style={mainStyle} />
  }

  if (widget === Widget.GOOGLE_MAP) {
    return <GoogleMapWidget />
  }

  if (widget === Widget.CREATE_ITEM) {
    return <CreateItemWidget style={mainStyle} />
  }

  if (widget === Widget.ONBOARDING) {
    return <OnboardingWidget style={mainStyle} />
  }

  if (widget === Widget.PROJECT_CREATION) {
    return <ProjectCreationWidget style={mainStyle} />
  }

  if (widget === Widget.PROJECT_SELECT) {
    return <ProjectSelectWidget style={mainStyle} />
  }

  if (widget === Widget.TRANSLATION) {
    return <TranslationWidget style={mainStyle} />
  }

  if (widget === Widget.SETTINGS) {
    return <SettingsWidget style={mainStyle} />
  }

  return (
    <View
      style={tw.style(mainStyle, {
        'h-[125]': !!store.ui.query,
      })}
      onLayout={e => {
        if (e.nativeEvent.layout.height !== 0) {
          if (!!store.ui.query) {
            solNative.setWindowHeight(500)
          } else {
            solNative.setWindowHeight(Math.round(e.nativeEvent.layout.height))
          }
        }
      }}>
      <SearchWidget />

      {!!store.ui.items.length &&
        !!Object.entries(store.ui.groupedEvents).length && (
          <View
            style={tw`border-t border-lightBorder dark:border-darkBorder`}
          />
        )}

      {!!store.ui.notifications.length && !store.ui.query && (
        <ScrollView
          style={tw`h-48 bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30 border-b border-lightBorder dark:border-darkBorder`}
          contentContainerStyle={tw`flex-grow-1`}>
          {store.ui.notifications.map(n => {
            return (
              <TouchableOpacity
                // @ts-expect-error
                enableFocusRing={false}
                style={tw`py-1 px-1 flex-row items-center`}
                onPress={async () => {
                  try {
                    if (!!n.iden && n.iden.includes('http')) {
                      const canOpen = await Linking.canOpenURL(n.iden)
                      if (canOpen) {
                        await Linking.openURL(
                          n.iden.replace('n#', ''),
                          // .replace('https://', 'arc://'),
                          // `arc://${n.iden}`,
                          // n.iden,
                        )
                      }
                    } else {
                      solNative.openFile(
                        decodeURI(n.url.replace('file://', '')),
                      )
                    }
                  } catch (e) {
                    console.warn('Could not open notification', e)
                  }
                }}>
                <FileIcon
                  url={n.url.replace('file://', '')}
                  style={tw`h-10 w-10`}
                />
                <View style={tw`ml-1`}>
                  <Text style={tw`text-xs font-bold`}>
                    {n.title} {n.subt}
                  </Text>
                  {!!n.text && <Text style={tw`text-xs`}>{n.text}</Text>}
                </View>
                <View style={tw`flex-1`} />

                <Text
                  style={tw`text-xs dark:text-neutral-400 text-neutral-500`}>
                  {DateTime.fromMillis(
                    n.date * 1000 + 978307200 * 1000,
                  ).toRelative()}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}
      {calendarVisible && <CalendarWidget />}
      {store.ui.showHintBar && <GeneralWidget />}
      {!store.ui.isAccessibilityTrusted && (
        <>
          <View
            style={tw.style(
              `w-full border-lightBorder dark:border-darkBorder border-t my-[7]`,
            )}
          />
          <TouchableOpacity
            onPress={() => {
              solNative.requestAccessibilityAccess()
              solNative.hideWindow()
            }}>
            <Text style={tw`text-accent text-xs px-3 pb-2`}>
              Click to grant accessibility access
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
})
