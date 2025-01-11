import {useFullSize} from 'hooks/useFullSize'
import {observer} from 'mobx-react-lite'
import {FC, useState} from 'react'
import {View} from 'react-native'
import {About} from './settings/about'
import {General} from './settings/general'
import {Shortcuts} from './settings/shortcuts'
import {Sidebar} from './settings/sidebar'
import {Translate} from './settings/translate'

type ITEM = 'ABOUT' | 'GENERAL' | 'TRANSLATE' | 'SHORTCUTS'

export const SettingsWidget: FC = observer(() => {
  useFullSize()
  const [selected, setSelected] = useState<ITEM>('GENERAL')
  return (
    <View className="h-full flex-row w-full">
      <Sidebar setSelected={setSelected as any} selected={selected} />
      <View className="flex-1 h-full bg-white dark:bg-neutral-900">
        {selected === 'GENERAL' && <General />}
        {selected === 'ABOUT' && <About />}
        {selected === 'SHORTCUTS' && <Shortcuts />}
        {selected === 'TRANSLATE' && <Translate />}
      </View>
    </View>
  )
})
