import { observer } from 'mobx-react-lite'
import { FC, useState } from 'react'
import { View } from 'react-native'
import { About } from './settings/about'
import { General } from './settings/general'
import { Items } from './settings/items'
import { Sidebar } from './settings/sidebar'
import { Translate } from './settings/translate'
import { Scripts } from './settings/scripts'
import { useStore } from 'store'
import { KeyboardShortcutRecorderView } from 'components/KeyboardShortcutRecorderView'

type ITEM = 'ABOUT' | 'GENERAL' | 'TRANSLATE' | 'ITEMS' | 'SCRIPTS'

export const SettingsWidget: FC = observer(() => {
  const store = useStore()
  const showKeyboardRecorder = store.ui.showKeyboardRecorder
  const [selected, setSelected] = useState<ITEM>('GENERAL')
  return (
    <View className="flex-1 flex-row">
      <Sidebar setSelected={setSelected as any} selected={selected} />
      <View className="flex-1 h-full bg-neutral-100 dark:bg-neutral-800">
        {selected === 'GENERAL' && <General />}
        {selected === 'ABOUT' && <About />}
        {selected === 'ITEMS' && <Items />}
        {selected === 'TRANSLATE' && <Translate />}
        {selected === 'SCRIPTS' && <Scripts />}
      </View>
      {showKeyboardRecorder && (
        <View className="absolute top-0 bottom-0 left-0 right-0 bg-black/80 items-center justify-center">
          <KeyboardShortcutRecorderView
            className={'w-80 h-24'}
            onShortcutChange={e => {
              store.ui.setShortcutFromUI(e.nativeEvent.shortcut)
            }}
            onCancel={() => {
              store.ui.closeKeyboardRecorder()
            }}
          />
        </View>
      )}
    </View>
  )
})
