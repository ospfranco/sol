import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {useEffect} from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget} from 'stores'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import {CalendarWidget} from 'widgets/calendar.widget'
import {CreateItemWidget} from 'widgets/createItem.widget'
import {GeneralWidget} from 'widgets/general.widget'
import {OnboardingWidget} from 'widgets/onboarding.widget'
import {ProjectCreationWidget} from 'widgets/projectCreation.widget'
import {ProjectSelectWidget} from 'widgets/projectSelect.widget'
import {SearchWidget} from 'widgets/search.widget'
import {SettingsWidget} from 'widgets/settings.widget'
import {TranslationWidget} from 'widgets/translation.widget'

export const RootContainer = observer(() => {
  useDeviceContext(tw)
  const store = useStore()
  const mainStyle = tw`bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-60 flex-1`
  const calendarVisible =
    store.ui.calendarAuthorizationStatus === 'authorized' ||
    store.ui.calendarAuthorizationStatus === 'notDetermined'
  const generalVisible =
    store.ui.track?.title ||
    store.ui.currentTemp ||
    !!store.ui.currentlyTrackedProject

  useEffect(() => {
    return () => {
      store.ui.cleanUp()
    }
  }, [])

  if (store.ui.focusedWidget === FocusableWidget.CREATE_ITEM) {
    return <CreateItemWidget style={mainStyle} />
  }

  if (store.ui.focusedWidget === FocusableWidget.ONBOARDING) {
    return <OnboardingWidget style={mainStyle} />
  }

  if (store.ui.focusedWidget === FocusableWidget.PROJECT_CREATION) {
    return <ProjectCreationWidget style={mainStyle} />
  }

  if (store.ui.focusedWidget === FocusableWidget.PROJECT_SELECT) {
    return <ProjectSelectWidget style={mainStyle} />
  }

  if (store.ui.focusedWidget === FocusableWidget.TRANSLATION) {
    return <TranslationWidget style={mainStyle} />
  }

  if (store.ui.focusedWidget === FocusableWidget.SETTINGS) {
    return <SettingsWidget style={mainStyle} />
  }

  return (
    <View style={tw.style(`flex-1`)}>
      <SearchWidget style={mainStyle} />

      <View
        style={tw.style(
          `border-t bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30 border-lightBorder dark:border-darkBorder px-6 py-1`,
        )}>
        <GeneralWidget />
        {generalVisible && calendarVisible && (
          <View
            style={tw.style(
              `w-full border-lightBorder dark:border-darkBorder border-t my-[7]`,
            )}
          />
        )}
        {calendarVisible && <CalendarWidget />}
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
              <Text style={tw`text-highlight text-xs pb-1`}>
                Click to grant accessibility access
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
})
