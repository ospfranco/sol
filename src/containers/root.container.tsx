import {observer} from 'mobx-react-lite'
import React from 'react'
import {View} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget} from 'stores'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import {AboutWidget} from 'widgets/about.widget'
import {CalendarWidget} from 'widgets/calendar.widget'
import {GeneralWidget} from 'widgets/general.widget'
import {OnboardingWidget} from 'widgets/onboarding.widget'
import {ProjectCreationWidget} from 'widgets/projectCreation.widget'
import {ProjectSelectWidget} from 'widgets/projectSelect.widget'
import {SearchWidget} from 'widgets/search.widget'
import {TranslationWidget} from 'widgets/translation.widget'
import {WeatherWidget} from 'widgets/weather.widget'

export const RootContainer = observer(() => {
  useDeviceContext(tw)
  const store = useStore()
  const mainStyle = tw`bg-gray-100 dark:bg-black bg-opacity-70 dark:bg-opacity-50 flex-1`

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

  if (store.ui.focusedWidget === FocusableWidget.WEATHER_CONFIG) {
    return <WeatherWidget style={mainStyle} />
  }

  if (store.ui.focusedWidget === FocusableWidget.ABOUT) {
    return <AboutWidget style={mainStyle} />
  }

  return (
    <View style={tw`flex-1`}>
      <SearchWidget style={mainStyle} />

      <CalendarWidget
        style={tw`border-t w-full bg-white dark:bg-black bg-opacity-70 dark:bg-opacity-60 border-lightBorder dark:border-darkBorder`}
      />
      <GeneralWidget
        style={tw`border-t w-full bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-70 border-lightBorder dark:border-darkBorder`}
      />
    </View>
  )
})
