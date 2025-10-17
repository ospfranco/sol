import { Icons } from 'assets'
import clsx from 'clsx'
import { BackButton } from 'components/BackButton'
import { Input } from 'components/Input'
import { MySwitch } from 'components/MySwitch'
import { SolButton } from 'components/SolButton'
import { solNative } from 'lib/SolNative'
import { observer } from 'mobx-react-lite'
import React, { FC, useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import { useStore } from 'store'
import { ItemType } from 'stores/ui.store'

interface Props {
  style?: ViewStyle
  className?: string
}

export const USER_COLOR_PALETTE = [
  '#bec2c8',
  '#e2e2e2',
  '#5e6ad2',
  '#26b5ce',
  '#0f7488',
  '#4cb782',
  '#0f783c',
  '#f2c94c',
  '#5a450d',
  '#f2994a',
  '#db6e1f',
  '#f7c8c1',
  '#eb5757',
  '#c52828',
]

export const CreateItemWidget: FC<Props> = observer(({ style }) => {
  const store = useStore()
  const [icon, setIcon] = useState('Apple')
  const [color, setColor] = useState(
    store.ui.isDarkMode ? USER_COLOR_PALETTE[1] : USER_COLOR_PALETTE[0],
  )
  const [isApplescript, setIsAppleScript] = useState(false)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [iconSelectorOpen, setIconSelectorOpen] = useState(false)

  useEffect(() => {
    const subscription = solNative.addListener('keyDown', e => {
      if (isApplescript && e.keyCode === 36) {
        setText(text + '\n')
      }
    })
    return () => {
      subscription.remove()
    }
  }, [text, setText])

  const commit = () => {
    store.ui.createCustomItem({
      id: Math.random().toString(),
      name,
      icon,
      color,
      text,
      isApplescript,
      type: ItemType.CUSTOM,
    })
    store.ui.onHide()
  }

  return (
    <View className="flex-1" style={style}>
      <BackButton onPress={store.ui.onHide} className="p-4" />
      {!iconSelectorOpen && (
        <View className={clsx(`flex-1 p-12`)}>
          <View className="flex-row items-center py-2">
            <Text className="w-24 font-bold text-right mr-2">Icon</Text>
            <View className="flex-[1.5]">
              <TouchableOpacity
                onPress={() => setIconSelectorOpen(!iconSelectorOpen)}
                className={clsx(
                  `h-6 w-6 justify-center items-center border border-lightBorder dark:border-darkBorder rounded`,
                  {
                    'bg-blue-500': iconSelectorOpen,
                  },
                )}>
                {!!icon ? (
                  <Image
                    // @ts-ignore
                    source={Icons[icon]}
                    className={clsx(`h-4 w-4`)}
                    style={{
                      tintColor: color,
                    }}
                  />
                ) : (
                  <View className="h-2 w-2 bg-white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Text className="w-24 font-bold text-right mr-2">Name</Text>
            <View className="flex-1">
              <Input
                placeholder="Name of your link or script"
                bordered
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>
          </View>
          <View className="flex-row items-center py-2">
            <Text className="mr-2 w-24 text-right font-bold">AppleScript</Text>
            <View className="flex-1">
              <MySwitch
                value={isApplescript}
                onValueChange={setIsAppleScript}
              />
            </View>
          </View>
          <View className="flex-row py-2 items-center">
            <Text className="mr-2 w-24 text-right font-bold">
              {isApplescript ? 'Script' : 'Link'}
            </Text>

            <Input
              placeholder="Link or script..."
              bordered
              // broken on 0.71.3
              multiline={isApplescript}
              className={'flex-1'}
              value={text}
              onChangeText={setText}
            />
          </View>
        </View>
      )}
      {iconSelectorOpen && (
        <View className="flex-1 px-10 items-center justify-center">
          <View className="w-full border-lightBorder dark:border-darkBorder flex-row px-2">
            {USER_COLOR_PALETTE.map(c => (
              <TouchableOpacity
                onPress={() => {
                  setColor(c)
                }}
                className={clsx(
                  'p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700',
                  {
                    'bg-gray-100 dark:bg-gray-700': c === color,
                  },
                )}
                key={c}>
                <View
                  className={clsx(`w-4 h-4 rounded-full`)}
                  style={{
                    backgroundColor: c,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-wrap flex-row p-2">
            {Object.entries(Icons).map(([key, icon], idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setIconSelectorOpen(false)
                    setIcon(key)
                  }}
                  className="p-2">
                  <Image
                    source={icon}
                    className={clsx(`h-6 w-6`)}
                    style={{
                      tintColor: color,
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )}
      <View className="border-t border-lightBorder dark:border-darkBorder items-end px-3 py-2 bg-gray-100 dark:bg-neutral-700">
        <SolButton title="Create" onPress={commit} />
      </View>
    </View>
  )
})
