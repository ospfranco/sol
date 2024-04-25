import clsx from 'clsx'
import {BlurView} from 'components/BlurView'
import {FullCalendar} from 'components/FullCalendar'
import {GradientView} from 'components/GradientView'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {useEffect} from 'react'
import {Linking, Text, TouchableOpacity, View} from 'react-native'
import {useStore} from 'store'
import {Widget} from 'stores/ui.store'
import {ClipboardWidget} from 'widgets/clipboard.widget'
import {CreateItemWidget} from 'widgets/createItem.widget'
import {EmojisWidget} from 'widgets/emojis.widget'
import {OnboardingWidget} from 'widgets/onboarding.widget'
import {ProcessesWidget} from 'widgets/processes.widget'
import {ScratchpadWidget} from 'widgets/scratchpad.widget'
import {SearchWidget} from 'widgets/search.widget'
import {SettingsWidget} from 'widgets/settings.widget'
import {TranslationWidget} from 'widgets/translation.widget'

export let RootContainer = observer(() => {
  let store = useStore()
  let widget = store.ui.focusedWidget
  let blurDisabled = store.ui.reduceTransparency

  if (widget === Widget.CLIPBOARD) {
    return (
      <BlurView disabled={blurDisabled} className="flex-1 rounded-lg">
        <ClipboardWidget />
      </BlurView>
    )
  }

  if (widget === Widget.EMOJIS) {
    return (
      <BlurView disabled={blurDisabled} className="flex-1 rounded-lg">
        <EmojisWidget />
      </BlurView>
    )
  }

  if (widget === Widget.SCRATCHPAD) {
    return (
      <BlurView disabled={blurDisabled} className="flex-1 rounded-lg">
        <ScratchpadWidget />
      </BlurView>
    )
  }

  if (widget === Widget.CREATE_ITEM) {
    return (
      <BlurView disabled={blurDisabled} className="flex-1 rounded-lg">
        <CreateItemWidget />
      </BlurView>
    )
  }

  if (widget === Widget.ONBOARDING) {
    return (
      <BlurView disabled={blurDisabled} className="flex-1 rounded-lg">
        <OnboardingWidget />
      </BlurView>
    )
  }

  if (widget === Widget.TRANSLATION) {
    return (
      <BlurView disabled={blurDisabled} className="flex-1 rounded-lg">
        <TranslationWidget />
      </BlurView>
    )
  }

  if (widget === Widget.SETTINGS) {
    return (
      <BlurView disabled={blurDisabled} className="flex-1 rounded-lg">
        <SettingsWidget />
      </BlurView>
    )
  }

  if (widget === Widget.PROCESSES) {
    return (
      <BlurView disabled={blurDisabled} className="flex-1 rounded-lg">
        <ProcessesWidget />
      </BlurView>
    )
  }

  return (
    <BlurView
      className={clsx('rounded-lg border border-color', {
        'h-18': !store.ui.query,
        'h-22': !store.ui.isAccessibilityTrusted,
        'h-24':
          !store.ui.query &&
          store.ui.calendarEnabled &&
          store.ui.calendarAuthorizationStatus === 'notDetermined',
        'h-full':
          !!store.ui.query ||
          (store.ui.calendarEnabled &&
            store.ui.calendarAuthorizationStatus === 'authorized'),
      })}>
      <SearchWidget />

      {!store.ui.query && store.ui.calendarEnabled && <FullCalendar />}

      {!store.ui.isAccessibilityTrusted && (
        <>
          <View className="w-full border-lightBorder dark:border-darkBorder border-t" />
          <TouchableOpacity
            onPress={() => {
              solNative.requestAccessibilityAccess()
              solNative.hideWindow()
            }}>
            <Text className="text-xs px-3 py-2">
              Click to grant accessibility access
            </Text>
          </TouchableOpacity>
        </>
      )}
    </BlurView>
  )
})
