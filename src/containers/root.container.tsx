import clsx from 'clsx'
import {FullCalendar} from 'components/FullCalendar'
import {PermissionsBar} from 'components/PermissionsBar'
import {observer} from 'mobx-react-lite'
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

export const RootContainer = observer(() => {
  const store = useStore()
  const widget = store.ui.focusedWidget

  let subWindow = (
    <View
      className={clsx({
        fullWindow:
          !!store.ui.query ||
          (store.ui.calendarEnabled && store.calendar.events.length > 0),
      })}>
      <SearchWidget />

      {!store.ui.query && store.ui.calendarEnabled && <FullCalendar />}

      <PermissionsBar />
    </View>
  )

  if (widget === Widget.FILE_SEARCH) {
    subWindow = (
      <View className="fullWindow">
        <FileSearchWidget />
      </View>
    )
  }
  if (widget === Widget.CLIPBOARD) {
    subWindow = (
      <View className="fullWindow">
        <ClipboardWidget />
      </View>
    )
  }

  if (widget === Widget.EMOJIS) {
    subWindow = (
      <View className="fullWindow">
        <EmojisWidget />
      </View>
    )
  }

  if (widget === Widget.SCRATCHPAD) {
    subWindow = (
      <View className="fullWindow">
        <ScratchpadWidget />
      </View>
    )
  }

  if (widget === Widget.CREATE_ITEM) {
    subWindow = (
      <View className="fullWindow">
        <CreateItemWidget />
      </View>
    )
  }

  if (widget === Widget.ONBOARDING) {
    subWindow = (
      <View className="fullWindow">
        <OnboardingWidget />
      </View>
    )
  }

  if (widget === Widget.TRANSLATION) {
    subWindow = (
      <View className="fullWindow">
        <TranslationWidget />
      </View>
    )
  }

  if (widget === Widget.SETTINGS) {
    subWindow = (
      <View className="fullWindow">
        <SettingsWidget />
      </View>
    )
  }

  if (widget === Widget.PROCESSES) {
    subWindow = (
      <View className="fullWindow">
        <ProcessesWidget />
      </View>
    )
  }

  return <View onLayout={store.ui.setWindowHeight}>{subWindow}</View>
})
