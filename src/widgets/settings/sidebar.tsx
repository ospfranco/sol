import {Assets} from 'assets'
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
    <View className="p-3 w-56">
      <BackButton
        onPress={() => store.ui.focusWidget(Widget.SEARCH)}
        className="mb-2"
      />
      <SelectableButton
        icon={Assets.macosSettings}
        selected={selected === 'GENERAL'}
        onPress={() => setSelected('GENERAL')}
        title="General"
      />
      <SelectableButton
        icon={Assets.translate}
        selected={selected === 'TRANSLATE'}
        onPress={() => setSelected('TRANSLATE')}
        title="Translation"
      />
      <SelectableButton
        icon={Assets.shortcuts}
        className="items-center "
        selected={selected === 'SHORTCUTS'}
        onPress={() => setSelected('SHORTCUTS')}
        title="Shortcuts"
      />
      <SelectableButton
        icon={Assets.smallLogo}
        className="items-center "
        selected={selected === 'ABOUT'}
        onPress={() => setSelected('ABOUT')}
        title="About"
      />
    </View>
  )
}
