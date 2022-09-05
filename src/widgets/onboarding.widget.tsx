import {Assets} from 'assets'
import {Fade} from 'components/Fade'
import {Key} from 'components/Key'
import {useFullSize} from 'hooks/useFullSize'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useState} from 'react'
import {Appearance, Image, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {Widget} from 'stores/ui.store'
import tw from 'tailwind'

interface Props {
  style?: ViewStyle
}

const SHORTCUTS = [
  {
    label: ({style}: {style: ViewStyle}) => (
      <Text style={tw.style(style)}>
        <Text style={tw.style(`font-bold text-base`, style)}>⌥</Text> then{' '}
        <Text style={tw.style(`font-bold`, style)}>Space</Text>
      </Text>
    ),
  },
  {
    label: ({style}: {style: ViewStyle}) => (
      <Text style={tw.style(style)}>
        <Text style={tw.style(`font-bold text-base`, style)}>⌘</Text> then{' '}
        <Text style={tw.style(`font-bold`, style)}>Space</Text>
      </Text>
    ),
    subLabel: () => {
      return (
        <Text style={tw.style(`text-xs dark:text-gray-400 text-gray-500 mt-4`)}>
          You will need to unbind Spotlight in System Preferences → Keyboard
          Shortcuts
        </Text>
      )
    },
  },
]

export const OnboardingWidget: FC<Props> = observer(({style}) => {
  const store = useStore()
  useFullSize()
  const colorScheme = Appearance.getColorScheme()
  const [visible, setVisible] = useState(true)
  const [onboardingStep, setOnboardingStep] = useState(store.ui.onboardingStep)

  useEffect(() => {
    if (store.ui.onboardingStep === 'v1_completed') {
      setTimeout(() => {
        store.ui.focusWidget(Widget.SEARCH)
      }, 350)
    }
    if (store.ui.onboardingStep !== 'v1_start') {
      setVisible(false)
    }
    setTimeout(() => {
      setVisible(true)
      setOnboardingStep(store.ui.onboardingStep)
    }, 500)
  }, [store.ui.onboardingStep])

  return (
    <View style={tw.style(`flex-1`, style)}>
      {onboardingStep === 'v1_start' && (
        <Fade visible={visible} style={tw`items-center flex-1`} duration={250}>
          <View style={tw`flex-1`} />
          <View style={tw`flex-row items-center`}>
            <Text style={tw`font-thin text-3xl`}>S</Text>
            <Image
              source={Assets.Logo}
              style={tw.style(`h-16 w-32`, {
                tintColor: colorScheme === 'dark' ? 'white' : 'black',
              })}
            />
            <Text style={tw`font-thin text-3xl`}>L</Text>
          </View>
          <View style={tw`justify-center mt-3`}>
            <Text>Welcome to your new macOS launcher</Text>
          </View>
          <View style={tw`flex-1`} />
          <View
            style={tw`w-full flex-row items-center justify-end border-t border-lightBorder dark:border-darkBorder px-3 py-2 bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30`}>
            <Text style={tw`font-bold text-sm`}>Continue</Text>
            <Key title="⏎" primary style={tw`mx-2`} />
          </View>
        </Fade>
      )}

      {onboardingStep === 'v1_shortcut' && (
        <Fade visible={visible} style={tw`items-center flex-1`} duration={250}>
          <View style={tw`flex-1`} />
          <Text>Pick a global shortcut</Text>
          <View style={tw`mt-3 justify-center`}>
            {SHORTCUTS.map((item, index) => {
              const Label = item.label
              const SubLabel = item.subLabel

              return (
                <View key={index} style={tw`items-center`}>
                  <View
                    style={tw.style(
                      `flex-row items-center px-3 py-2 rounded border border-transparent`,
                      {
                        'bg-accent bg-opacity-80 dark:bg-opacity-30 border-accentDim':
                          store.ui.selectedIndex === index,
                      },
                    )}>
                    <Label
                      style={tw.style({
                        'text-white': store.ui.selectedIndex === index,
                      })}
                    />
                  </View>
                  {!!SubLabel && store.ui.selectedIndex === index && (
                    <SubLabel />
                  )}
                </View>
              )
            })}
          </View>

          <View style={tw`flex-1`} />

          <View
            style={tw`w-full flex-row items-center justify-end border-t border-lightBorder dark:border-darkBorder px-3 py-2 bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30`}>
            <Text style={tw`font-bold text-sm`}>Select & Continue</Text>
            <Key title="⏎" primary style={tw`mx-2`} />
          </View>
        </Fade>
      )}

      {onboardingStep === 'v1_quick_actions' && (
        <Fade visible={visible} style={tw`items-center flex-1`} duration={250}>
          <View style={tw`flex-1`} />
          <View style={tw`flex-1 justify-center items-center p-12`}>
            <Text>
              Simply search for apps, commands and the web from the main window.
            </Text>
            <Text style={tw`mt-10`}>
              Sol also offers many more functionalities, here are some shortcuts
              to get you started:
            </Text>

            <View style={tw`flex-row mt-4 items-center`}>
              <Text style={tw`font-bold flex-1 text-right`}>
                Clipboard Manager
              </Text>
              <View style={tw`flex-1 flex-row items-center`}>
                <Key title="⌘" style={tw`ml-2`} />
                <Key title="⇧" style={tw`ml-1`} />
                <Key title="V" style={tw`ml-1`} />
              </View>
            </View>

            <View style={tw`flex-row mt-4 items-center`}>
              <Text style={tw`font-bold flex-1 text-right`}>Emoji Picker</Text>
              <View style={tw`flex-1 flex-row items-center`}>
                <Key title="⌘" style={tw`ml-2`} />
                <Key title="⌃" style={tw`ml-1`} />
                <Key title="Space" style={tw`ml-1`} />
              </View>
            </View>

            <View style={tw`flex-row mt-4 items-center`}>
              <Text style={tw`font-bold flex-1 text-right`}>
                Note Scratchpad
              </Text>
              <View style={tw`flex-1 flex-row items-center`}>
                <Key title="⌘" style={tw`ml-2`} />
                <Key title="⇧" style={tw`ml-1`} />
                <Key title="Space" style={tw`ml-1`} />
              </View>
            </View>

            <View style={tw`flex-row mt-4 items-center`}>
              <Text style={tw`font-bold flex-1 text-right`}>
                Fullscreen front-most window
              </Text>
              <View style={tw`flex-1 flex-row items-center`}>
                <Key title="^" style={tw`ml-2`} />
                <Key title="⌥" style={tw`ml-1`} />
                <Key title="⏎" style={tw`ml-1`} />
              </View>
            </View>

            <View style={tw`flex-row mt-4 items-center`}>
              <Text style={tw`font-bold flex-1 text-right`}>
                Resize front-most window to the right
              </Text>
              <View style={tw`flex-1 flex-row items-center`}>
                <Key title="^" style={tw`ml-2`} />
                <Key title="⌥" style={tw`ml-1`} />
                <Key title="→" style={tw`ml-1`} />
              </View>
            </View>

            <View style={tw`flex-row mt-4 items-center`}>
              <Text style={tw`font-bold flex-1 text-right`}>
                Resize front-most window to the left
              </Text>
              <View style={tw`flex-1 flex-row items-center`}>
                <Key title="^" style={tw`ml-2`} />
                <Key title="⌥" style={tw`ml-1`} />
                <Key title="←" style={tw`ml-1`} />
              </View>
            </View>
          </View>
          <View style={tw`flex-1`} />

          <View
            style={tw`w-full flex-row items-center justify-end border-t border-lightBorder dark:border-darkBorder px-3 py-2 bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30`}>
            <Text style={tw`font-bold text-sm`}>Continue</Text>
            <Key title="⏎" primary style={tw`mx-2`} />
          </View>
        </Fade>
      )}
    </View>
  )
})
