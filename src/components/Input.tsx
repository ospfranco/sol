import {useBoolean} from 'hooks'
import React, {FC, MutableRefObject} from 'react'
import {TextInput, TextInputProps, View, ViewStyle} from 'react-native'
import tw from 'tailwind'

interface Props extends TextInputProps {
  inputRef?: MutableRefObject<TextInput | null>
  style?: ViewStyle
  inputStyle?: ViewStyle
  bordered?: boolean
}

export const Input: FC<Props> = ({
  inputRef,
  style,
  inputStyle,
  bordered,
  ...props
}) => {
  const [focused, focusOn, focusOff] = useBoolean(props.autoFocus)
  return (
    <View
      style={tw.style(
        'w-full rounded bg-transparent px-2 h-8 justify-center',
        {
          'border border-lightBorder dark:border-darkBorder': !!bordered,
          'border-blue-500 dark:border-blue-500': !!bordered && !!focused,
        },

        style,
      )}>
      <TextInput
        // @ts-ignore
        enableFocusRing={false}
        ref={inputRef}
        selectionColor="#0ea5e9"
        onFocus={focusOn}
        onBlur={focusOff}
        style={inputStyle}
        {...props}
      />
    </View>
  )
}
