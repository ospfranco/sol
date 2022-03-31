import {Icons} from 'assets'
import {Input} from 'components/Input'
import {MySwitch} from 'components/MySwitch'
import {SolButton} from 'components/SolButton'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef, useState} from 'react'
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
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

const IconSelector = ({
  icon,
  onChange,
  color,
  onColorChange,
}: {
  icon: string
  onChange: (name: string) => void
  color: string
  onColorChange: (color: string) => void
}) => {
  const [open, setOpen] = useState(false)

  return <View style={tw.style(`relative`, {zIndex: 100})}></View>
}

export const CreateItemWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  // const colorScheme = Appearance.getColorScheme()
  const store = useStore()
  const inputRef = useRef<TextInput | null>(null)
  const [icon, setIcon] = useState('Apple')
  const [color, setColor] = useState(USER_COLOR_PALETTE[0])
  const [isApplescript, setIsAppleScript] = useState(false)
  const [text, setText] = useState('')
  const [iconSelectorOpen, setIconSelectorOpen] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

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
            style={tw`h-6 w-6 justify-center items-center border border-lightBorder dark:border-darkBorder rounded`}>
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
          <View
            style={tw.style(
              `border-lightBorder dark:border-darkBorder border rounded ml-3 mt-1`,
            )}>
            <View
              style={tw`w-full border-b border-lightBorder dark:border-darkBorder flex-row p-2`}>
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
              inputRef={inputRef}
              value={store.ui.tempProjectName}
              onChangeText={store.ui.setTempProjectName}
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
      <View style={tw`border-t dark:border-highlightDark items-end p-3`}>
        <SolButton title="Create" />
      </View>
    </View>
  )
})
