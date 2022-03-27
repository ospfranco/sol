import {useBoolean} from 'hooks'
import React, {FC} from 'react'
import {Appearance, TextInput, TextInputProps, View} from 'react-native'
import tw from 'tailwind'

interface Props extends TextInputProps {}

export const Input: FC<Props> = props => {
  const colorScheme = Appearance.getColorScheme()
  const [focused, focusOn, focusOff] = useBoolean(props.autoFocus)
  return (
    <View
      style={tw.style(
        'w-full rounded border border-gray-500 dark:border-gray-700 bg-transparent px-2 py-2 mt-4',
        {
          'border-blue-500 dark:border-blue-500': focused,
        },
      )}>
      <TextInput
        // selectionColor="#0284c7"
        onFocus={focusOn}
        onBlur={focusOff}
        selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
        {...props}
      />
    </View>
  )
}
