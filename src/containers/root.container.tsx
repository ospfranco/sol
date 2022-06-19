import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {useEffect} from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget} from 'stores'
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
  const mainStyle = tw`rounded-lg bg-white dark:bg-black border border-lightBorder dark:border-darkBorder overflow-hidden`
  const calendarVisible =
    store.ui.calendarAuthorizationStatus === 'authorized' ||
    store.ui.calendarAuthorizationStatus === 'notDetermined'
  const generalVisible =
    (store.ui.track?.title ||
      store.ui.currentTemp ||
      !!store.ui.currentlyTrackedProject) &&
    !store.ui.query

  const widget = store.ui.focusedWidget

  useEffect(() => {
    return () => {
      store.ui.cleanUp()
    }
  }, [])

  if (widget === FocusableWidget.CLIPBOARD) {
    return <ClipboardWidget style={mainStyle} />
  }

  if (widget === FocusableWidget.GIFS) {
    return <GifsWidget style={mainStyle} />
  }

  if (widget === FocusableWidget.EMOJIS) {
    return <EmojisWidget style={mainStyle} />
  }

  if (widget === FocusableWidget.SCRATCHPAD) {
    return <ScratchpadWidget style={mainStyle} />
  }

  if (widget === FocusableWidget.GOOGLE_MAP) {
    return <GoogleMapWidget />
  }

  if (widget === FocusableWidget.CREATE_ITEM) {
    return <CreateItemWidget style={mainStyle} />
  }

  if (widget === FocusableWidget.ONBOARDING) {
    return <OnboardingWidget style={mainStyle} />
  }

  if (widget === FocusableWidget.PROJECT_CREATION) {
    return <ProjectCreationWidget style={mainStyle} />
  }

  if (widget === FocusableWidget.PROJECT_SELECT) {
    return <ProjectSelectWidget style={mainStyle} />
  }

  if (widget === FocusableWidget.TRANSLATION) {
    return <TranslationWidget style={mainStyle} />
  }

  if (widget === FocusableWidget.SETTINGS) {
    return <SettingsWidget style={mainStyle} />
  }

  return (
    <View
      style={tw.style(mainStyle, {
        'flex-1': !!store.ui.query,
      })}>
      <SearchWidget />

      {!!store.ui.items.length && (
        <View
          style={tw`border-t border-lightBorder dark:border-darkBorder mx-3`}
        />
      )}
      {calendarVisible && <CalendarWidget />}
      {generalVisible && <GeneralWidget />}
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
            <Text style={tw`text-accent text-xs pb-1`}>
              Click to grant accessibility access
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
})
