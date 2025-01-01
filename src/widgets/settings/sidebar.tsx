import {BackButton} from 'components/BackButton'
import {SelectableButton} from 'components/SelectableButton'
import {View} from 'react-native'
import {useStore} from 'store'
import {Widget} from 'stores/ui.store'

export const Sidebar = ({
  selected,
  setSelected,
}: {
  selected: string
  setSelected: (selected: string) => {}
}) => {
  const store = useStore()

  return (
    <View className="p-3 gap-1 border-r border-lightBorder dark:border-darkBorder">
      <BackButton
        onPress={() => store.ui.focusWidget(Widget.SEARCH)}
        className="mb-2"
      />
      <SelectableButton
        className="w-26 items-center"
        selected={selected === 'GENERAL'}
        onPress={() => setSelected('GENERAL')}
        title="General"
      />
      <SelectableButton
        className="w-26 items-center "
        selected={selected === 'TRANSLATE'}
        onPress={() => setSelected('TRANSLATE')}
        title="Translation"
      />
      <SelectableButton
        className="w-26 items-center "
        selected={selected === 'SHORTCUTS'}
        onPress={() => setSelected('SHORTCUTS')}
        title="Shortcuts"
      />
      <SelectableButton
        className="w-26 items-center "
        selected={selected === 'ABOUT'}
        onPress={() => setSelected('ABOUT')}
        title="About"
      />
    </View>
  )
}
