import {observer} from 'mobx-react-lite'
import React, {useEffect} from 'react'
import {View} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget, Theme} from 'stores'
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
  const rootStyle =
    store.ui.theme === Theme.transparent ? null : `bg-white dark:bg-gray-900`
  const mainStyle = tw`bg-white dark:bg-black bg-opacity-70 dark:bg-opacity-50 flex-1`
  const theme = store.ui.theme

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
    <View style={tw.style(`flex-1`, rootStyle)}>
      <SearchWidget style={mainStyle} />

      <GeneralWidget
        style={tw.style(
          `border-t bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-60`,
          {
            'border-lightBorder dark:border-darkBorder':
              theme === Theme.transparent,
            'border-slate-100': theme === Theme.solid,
          },
        )}
      />

      {(store.ui.calendarAuthorizationStatus === 'authorized' ||
        store.ui.calendarAuthorizationStatus === 'notDetermined') && (
        <CalendarWidget
          style={tw` bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-60 `}
        />
      )}
    </View>
  )
})
