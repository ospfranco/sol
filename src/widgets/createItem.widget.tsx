import {Icons} from 'assets'
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
        style={tw`border-b dark:border-highlightDark p-3`}
        onPress={() => {
          store.ui.onHide()
        }}>
        <Text style={tw``}>
          <Text style={tw`text-gray-500`}>←</Text> Create Link/Shortcut
        </Text>
      </TouchableOpacity>
      <View style={tw`flex-row py-3 px-6 flex-1`}>
        <View style={tw`pt-1`}>
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
        {iconSelectorOpen && (
          <View style={tw.style(`ml-3`)}>
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
            <View style={tw`w-[120] flex-wrap flex-row p-2`}>
              {Object.entries(Icons).map(([key, icon], idx) => {
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setIconSelectorOpen(false)
                      setIcon(key)
                    }}
                    style={tw`p-1`}>
                    <Image
                      source={icon}
                      style={tw.style(`h-4 w-4`, {
                        tintColor: color,
                      })}
                    />
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}
        {!iconSelectorOpen && (
          <View style={tw.style(`flex-1 ml-2`)}>
            <Input
              autoFocus
              value={name}
              onChangeText={setName}
              placeholder="Item name..."
              inputStyle={tw`text-lg`}
            />

            <View style={tw`flex-row items-start`}>
              <Input
                value={text}
                onChangeText={setText}
                placeholder={
                  isApplescript
                    ? 'Type your Applescript...'
                    : 'Type your link (https or app protocol)...'
                }
                numberOfLines={isApplescript ? 1000 : 1}
                multiline={isApplescript}
                style={tw.style('flex-1', {
                  'h-40': isApplescript,
                })}
                inputStyle={tw.style({
                  'h-38': isApplescript,
                })}
                blurOnSubmit={false}
              />
              <View style={tw`flex-row items-center flex-shrink-0 pt-2`}>
                <MySwitch
                  value={isApplescript}
                  onValueChange={setIsAppleScript}
                />
                <Text style={tw`ml-1 text-gray-400 text-xs`}>Applescript</Text>
              </View>
            </View>

            <View style={tw`flex-row`}></View>
          </View>
        )}
      </View>
      <View style={tw`border-t dark:border-highlightDark items-end px-3 py-2`}>
        <SolButton title="Create" onPress={commit} />
      </View>
    </View>
  )
})
