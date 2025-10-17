import clsx from 'clsx'
import { useBoolean } from 'hooks'
import { FC, MutableRefObject } from 'react'
import { TextInput, TextInputProps, View, ViewStyle } from 'react-native'
import colors from 'tailwindcss/colors'

interface Props extends TextInputProps {
  inputRef?: MutableRefObject<TextInput | null>
  style?: ViewStyle
  inputStyle?: ViewStyle
  inputClassName?: string
  bordered?: boolean
  className?: string
  autoFocus?: boolean
}

export const Input: FC<Props> = ({
  inputRef,
  style,
  inputStyle,
  bordered = false,
  autoFocus,
  inputClassName,
  className,
  ...props
}) => {
  const [focused, focusOn, focusOff] = useBoolean(autoFocus)
  const [hovered, hoverOn, hoverOff] = useBoolean(false)
  const defaultStyles = "flex align-center justify-center px-2 py-1 h-8"

  return (
    <View
      //@ts-ignore
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      style={style}
      className={clsx(
        `${defaultStyles} ${className}`,
        {
          'border border-color rounded':
            bordered && !focused && !hovered,
          'border border-accent rounded': bordered && !!focused,
          'border border-neutral-500 dark:border-white rounded':
            bordered && !focused && !!hovered,
        },
      )}>
      <TextInput
        // @ts-ignore
        enableFocusRing={false}
        ref={inputRef}
        onFocus={focusOn}
        onBlur={focusOff}
        className={`text-sm flex-1 ${inputClassName}`}
        style={inputStyle}
        autoFocus={autoFocus}
        placeholderTextColor={colors.neutral[400]}
        placeholder={props.placeholder}
        value={props.value}
        onChangeText={props.onChangeText}
        readOnly={props.readOnly}
        textAlign={props.textAlign}
      />
    </View>
  )
}
