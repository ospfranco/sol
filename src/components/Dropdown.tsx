import {Portal} from '@gorhom/portal'
import {Assets} from 'assets'
import {useBoolean} from 'hooks'
import React, {FC} from 'react'
import {Image, Text, TouchableOpacity, View, ViewStyle} from 'react-native'
import tw from 'tailwind'

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

  return (
    <TouchableOpacity
      // @ts-expect-error
      enableFocusRing={false}
      onPress={() => {
        isOpen ? close() : open()
      }}
      style={tw.style(
        `w-32 rounded justify-center items-center border flex-row px-2 py-1 items-center relative`,
        {
          'border-gray-400': isOpen,
          'border-gray-500': !isOpen,
        },
        style,
      )}>
      <Text style={tw`flex-1 text-sm`}>
        {options.find(o => o.value === value)?.label ?? ''}
      </Text>
      <Image
        source={isOpen ? Assets.ChevronUp : Assets.ChevronDown}
        style={tw.style('h-4 w-4 dark:tint-white')}
      />
      {isOpen && (
        <Portal hostName="CustomPortalHost">
          <View
            style={tw.style(
              `w-32 rounded justify-center items-center border border-gray-500 absolute top-7 dark:bg-black bg-red-500`,
            )}>
            {options.map((o, i) => (
              <TouchableOpacity
                style={tw`py-1`}
                key={`option-${i}`}
                onPress={() => {
                  onValueChange(o.value)
                }}>
                <Text>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Portal>
      )}
    </TouchableOpacity>
  )
}
