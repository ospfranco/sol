import clsx from 'clsx'
import {BlurView} from 'components/BlurView'
import {FullCalendar} from 'components/FullCalendar'
import {PermissionsBar} from 'components/PermissionsBar'
import {observer} from 'mobx-react-lite'
import React from 'react'
import {View} from 'react-native'
import {useStore} from 'store'
import {Widget} from 'stores/ui.store'
import {ClipboardWidget} from 'widgets/clipboard.widget'
import {CreateItemWidget} from 'widgets/createItem.widget'
import {EmojisWidget} from 'widgets/emojis.widget'
import {FileSearchWidget} from 'widgets/fileSearch.widget'
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

  if (widget === Widget.FILE_SEARCH) {
    return (
      <BlurView
        materialName="popover"
        disabled={blurDisabled}
        className="h-full rounded-lg border-window">
        <View className="bg-window h-full">
          <FileSearchWidget />
        </View>
      </BlurView>
    )
  }
  if (widget === Widget.CLIPBOARD) {
    return (
      <BlurView
        materialName="popover"
        disabled={blurDisabled}
        className="h-full rounded-lg border-window">
        <View className="bg-window h-full">
          <ClipboardWidget />
        </View>
      </BlurView>
    )
  }

  if (widget === Widget.EMOJIS) {
    return (
      <BlurView
        materialName="popover"
        disabled={blurDisabled}
        className="h-full rounded-lg border-window">
        <View className="bg-window h-full">
          <EmojisWidget />
        </View>
      </BlurView>
    )
  }

  if (widget === Widget.SCRATCHPAD) {
    return (
      <BlurView
        materialName="popover"
        disabled={blurDisabled}
        className="h-full rounded-lg border-window">
        <View className="bg-window h-full">
          <ScratchpadWidget />
        </View>
      </BlurView>
    )
  }

  if (widget === Widget.CREATE_ITEM) {
    return (
      <BlurView
        materialName="popover"
        disabled={blurDisabled}
        className="h-full rounded-lg border-window">
        <View className="bg-window h-full">
          <CreateItemWidget />
        </View>
      </BlurView>
    )
  }

  if (widget === Widget.ONBOARDING) {
    return (
      <BlurView
        materialName="popover"
        disabled={blurDisabled}
        className="h-full rounded-lg border-window">
        <View className="bg-window h-full">
          <OnboardingWidget />
        </View>
      </BlurView>
    )
  }

  if (widget === Widget.TRANSLATION) {
    return (
      <BlurView
        materialName="popover"
        disabled={blurDisabled}
        className="h-full rounded-lg border-window">
        <View className="bg-window h-full">
          <TranslationWidget />
        </View>
      </BlurView>
    )
  }

  if (widget === Widget.SETTINGS) {
    return (
      <BlurView
        materialName="popover"
        disabled={blurDisabled}
        className="h-full rounded-lg border-window">
        <View className="bg-window h-full">
          <SettingsWidget />
        </View>
      </BlurView>
    )
  }

  if (widget === Widget.PROCESSES) {
    return (
      <BlurView
        materialName="popover"
        disabled={blurDisabled}
        className="h-full rounded-lg border-window">
        <View className="bg-window h-full">
          <ProcessesWidget />
        </View>
      </BlurView>
    )
  }

  return (
    <BlurView
      materialName="popover"
      className={clsx('rounded-xl dark:border dark:border-window', {
        'h-full':
          !!store.ui.query ||
          (store.ui.calendarEnabled &&
            store.ui.calendarAuthorizationStatus === 'authorized'),
      })}>
      <View
        className={clsx('bg-window', {
          'h-full':
            !!store.ui.query ||
            (store.ui.calendarEnabled &&
              store.ui.calendarAuthorizationStatus === 'authorized'),
        })}>
        <SearchWidget />

        {!store.ui.query && store.ui.calendarEnabled && <FullCalendar />}

        <PermissionsBar />
      </View>
    </BlurView>
  )
})
