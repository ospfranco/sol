import {Assets, Icons} from 'assets'
import {Input} from 'components/Input'
import {MySwitch} from 'components/MySwitch'
import {SolButton} from 'components/SolButton'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useState} from 'react'
import {Image, Text, TouchableOpacity, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {ItemType} from 'stores'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
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

export const CreateItemWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()
  const [icon, setIcon] = useState('Apple')
  const [color, setColor] = useState(USER_COLOR_PALETTE[0])
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
    <View style={tw.style(`flex-1`, style)}>
      <TouchableOpacity
        style={tw` p-3 flex-row items-center`}
        onPress={() => {
          store.ui.onHide()
        }}>
        <Image
          source={Assets.ChevronLeft}
          style={tw`dark:tint-white h-5 w-5`}
        />
        <Text style={tw``}>Create Shortcut</Text>
      </TouchableOpacity>
      {!iconSelectorOpen && (
        <View
          style={tw.style(`flex-1`, {
            'pt-10': isApplescript,
            'justify-center': !isApplescript,
          })}>
          <View style={tw`flex-row items-center py-2`}>
            <Text style={tw`mr-2 flex-1 text-right`}>Icon</Text>
            <View style={tw`flex-1.5`}>
              <TouchableOpacity
                onPress={() => setIconSelectorOpen(!iconSelectorOpen)}
                style={tw.style(
                  `h-6 w-6 justify-center items-center border border-lightBorder dark:border-darkBorder rounded`,
                  {
                    'bg-blue-500': iconSelectorOpen,
                  },
                )}>
                {!!icon ? (
                  <Image
                    // @ts-ignore
                    source={Icons[icon]}
                    style={tw.style(`h-4 w-4`, {
                      tintColor: color,
                    })}
                  />
                ) : (
                  <View style={tw`h-2 w-2 bg-white`} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={tw`flex-row items-center py-2`}>
            <Text style={tw`mr-2 flex-1 text-right`}>Name</Text>
            <View style={tw`flex-1.5`}>
              <Input
                placeholder="My favorite shortcut..."
                bordered
                style={tw`w-64`}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
          <View style={tw`flex-row items-center py-2`}>
            <Text style={tw`mr-2 flex-1 text-right`}>Applescript</Text>
            <View style={tw`flex-1.5`}>
              <MySwitch
                value={isApplescript}
                onValueChange={setIsAppleScript}
              />
            </View>
          </View>
          <View
            style={tw.style(`flex-row py-2`, {
              'items-start': isApplescript,
              'items-center': !isApplescript,
            })}>
            <Text style={tw`mr-2 flex-1 text-right`}>
              {isApplescript ? 'Script' : 'Link'}
            </Text>
            <View style={tw`flex-1.5`}>
              <Input
                placeholder="Link or script..."
                bordered
                multiline={isApplescript}
                style={tw.style(`w-64`, {
                  'h-48': isApplescript,
                })}
                value={text}
                onChangeText={setText}
              />
            </View>
          </View>
        </View>
      )}
      {iconSelectorOpen && (
        <View style={tw.style(`flex-1 px-10 items-center justify-center`)}>
          <View
            style={tw`w-full border-lightBorder dark:border-darkBorder flex-row px-2`}>
            {USER_COLOR_PALETTE.map(c => (
              <TouchableOpacity
                onPress={() => {
                  setColor(c)
                }}
                style={tw.style(
                  'p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700',
                  {
                    'bg-gray-100 dark:bg-gray-700': c === 'blah',
                  },
                )}
                key={c}>
                <View
                  style={tw.style(`w-4 h-4 rounded-full`, {
                    backgroundColor: c,
                  })}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={tw` flex-wrap flex-row p-2`}>
            {Object.entries(Icons).map(([key, icon], idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setIconSelectorOpen(false)
                    setIcon(key)
                  }}
                  style={tw`p-2`}>
                  <Image
                    source={icon}
                    style={tw.style(`h-6 w-6`, {
                      tintColor: color,
                    })}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )}
      <View
        style={tw`border-t border-lightBorder dark:border-darkBorder items-end px-3 py-2 bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30`}>
        <SolButton title="Create" onPress={commit} />
      </View>
    </View>
  )
})
