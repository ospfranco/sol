import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import {FC, useEffect} from 'react'
import {TextInput, View} from 'react-native'
import {useStore} from 'store'
import colors from 'tailwindcss/colors'

export const ScratchpadWidget: FC = observer(() => {
  let store = useStore()

  useEffect(() => {
    solNative.turnOffVerticalArrowsListeners()
    solNative.turnOffEnterListener()
    return () => {
      solNative.turnOnEnterListener()
      solNative.turnOnVerticalArrowsListeners()
    }
  }, [])

  return (
    <View className="flex-1">
      <TextInput
        autoFocus
        value={store.ui.note}
        onChangeText={store.ui.setNote}
        // @ts-expect-error
        enableFocusRing={false}
        placeholderTextColor={colors.neutral[400]}
        placeholder="Write something..."
        className="flex-1 p-4 -mt-8"
        multiline
      />
    </View>
  )
})
