import {Assets} from 'assets'
import {useBoolean} from 'hooks'
import React from 'react'
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native'
import tw from 'tailwind'
import {SelectableButton} from './SelectableButton'

interface Props<T> {
  value: T
  style?: ViewStyle
  onValueChange: (t: T) => void
  options: Array<{
    label: string
    value: T
  }>
}

export const Dropdown = ({
  value,
  style,
  options,
  onValueChange,
}: Props<string | number>) => {
  const [isOpen, open, close] = useBoolean()
  const [isHovered, hoverOn, hoverOff] = useBoolean()

  return (
    <>
      <TouchableOpacity
        // @ts-expect-error
        onMouseEnter={hoverOn}
        onMouseLeave={hoverOff}
        enableFocusRing={false}
        onPress={() => {
          isOpen ? close() : open()
        }}
        style={tw.style(
          `w-32 rounded justify-center items-center border flex-row py-1`,
          {
            'border-accent': isOpen,
            'dark:border-white': isHovered,
            'border-gray-500': !isOpen,
          },
          style,
        )}>
        <Text style={tw`flex-1 text-sm ml-2`}>
          {options.find(o => o.value === value)?.label ?? ''}
        </Text>
        <Image
          source={isOpen ? Assets.ChevronUp : Assets.ChevronDown}
          style={tw.style('h-4 w-4 dark:tint-white mr-2')}
        />
      </TouchableOpacity>
      {isOpen && (
        <ScrollView
          style={tw.style(
            `w-32 rounded border dark:border-gray-700 dark:bg-neutral-800 max-h-32 absolute top-7`,
            style,
          )}
          contentContainerStyle={tw`justify-center items-center -ml-4`}
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
        </ScrollView>
      )}
    </>
  )
}
