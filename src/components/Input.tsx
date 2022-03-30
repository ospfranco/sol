import {useBoolean} from 'hooks'
import React, {FC, MutableRefObject} from 'react'
import {Appearance, TextInput, TextInputProps, View} from 'react-native'
import tw from 'tailwind'

interface Props extends TextInputProps {
  inputRef?: MutableRefObject<TextInput | null>
}

export const Input: FC<Props> = ({inputRef, ...props}) => {
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
        ref={inputRef}
        selectionColor="#0ea5e9"
        onFocus={focusOn}
        onBlur={focusOff}
        {...props}
      />
    </View>
  )
}
