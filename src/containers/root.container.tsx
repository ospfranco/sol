import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { View } from 'react-native'
import { useStore } from 'store'
import { FocusableWidget } from 'stores'
import tw from 'tailwind'
import { useDeviceContext } from 'twrnc'
import { CalendarWidget } from 'widgets/calendar.widget'
import { CreateItemWidget } from 'widgets/createItem.widget'
import { GeneralWidget } from 'widgets/general.widget'
import { OnboardingWidget } from 'widgets/onboarding.widget'
import { ProjectCreationWidget } from 'widgets/projectCreation.widget'
import { ProjectSelectWidget } from 'widgets/projectSelect.widget'
import { SearchWidget } from 'widgets/search.widget'
import { SettingsWidget } from 'widgets/settings.widget'
import { TranslationWidget } from 'widgets/translation.widget'

export const RootContainer = observer(() => {
  useDeviceContext(tw)
  const store = useStore()
  const mainStyle = tw`bg-white dark:bg-black bg-opacity-70 dark:bg-opacity-50 flex-1`

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
    <View style={tw`flex-1`}>
      <SearchWidget style={mainStyle} />
      
      <GeneralWidget
        style={tw`border-t border-lightBorder dark:border-darkBorder bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-60`}
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
