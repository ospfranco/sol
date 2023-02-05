import {Assets} from 'assets'
import clsx from 'clsx'
import {useBoolean} from 'hooks'
import React from 'react'
import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native'
import {SelectableButton} from './SelectableButton'
import {StyledScrollView} from './StyledScrollView'

interface Props<T> {
  value: T
  style?: ViewStyle
  className?: string
  onValueChange: (t: T) => void
  options: Array<{
    label: string
    value: T
  }>
  upward?: boolean
}

export const Dropdown = ({
  value,
  style,
  options,
  onValueChange,
  upward = false,
}: Props<string | number>) => {
  const [isOpen, open, close] = useBoolean()
  const [isHovered, hoverOn, hoverOff] = useBoolean()
  const colorScheme = useColorScheme()

  return (
    <View className="relative">
      <TouchableOpacity
        // @ts-expect-error
        onMouseEnter={hoverOn}
        onMouseLeave={hoverOff}
        enableFocusRing={false}
        onPress={() => {
          isOpen ? close() : open()
        }}
        className={clsx(
          `w-32 rounded justify-center items-center border flex-row py-1`,
          {
            'border-accent': isOpen,
            'dark:border-gray-200': isHovered,
            'border-neutral-300 dark:border-neutral-700': !isHovered,
          },
        )}
        style={style}>
        <Text className="flex-1 text-sm ml-2">
          {options.find(o => o.value === value)?.label ?? ''}
        </Text>
        <Image
          source={isOpen ? Assets.ChevronUp : Assets.ChevronDown}
          className="h-4 w-4 mr-2"
          style={{
            tintColor: colorScheme === 'dark' ? 'white' : 'black',
          }}
        />
      </TouchableOpacity>
      {isOpen && (
        <StyledScrollView
          className={clsx(
            `w-32 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 max-h-32 absolute`,
            {
              'top-7': !upward,
              'bottom-7': upward,
            },
          )}
          style={style}
          contentContainerStyle="justify-center items-center"
          showsVerticalScrollIndicator={false}>
          {options.map((o, i) => (
            <SelectableButton
              title={o.label}
              key={`option-${i}`}
              selected={false}
              onPress={() => {
                onValueChange(o.value)
                close()
              }}
            />
          ))}
        </StyledScrollView>
      )}
    </View>
  )
}
