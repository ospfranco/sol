import {Assets} from 'assets'
import {Fade} from 'components/Fade'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useState} from 'react'
import {Appearance, Image, Switch, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget} from 'stores'
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
  const colorScheme = Appearance.getColorScheme()
  const [visible, setVisible] = useState(true)
  const [onboardingStep, setOnboardingStep] = useState(store.ui.onboardingStep)

  useEffect(() => {
    if (store.ui.onboardingStep === 'v1_completed') {
      setTimeout(() => {
        store.ui.focusWidget(FocusableWidget.SEARCH)
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
    <View style={tw.style(`flex-1 items-center p-6 justify-center`, style)}>
      {onboardingStep === 'v1_start' && (
        <Fade visible={visible} style={tw`items-center`} duration={250}>
          <Image
            source={Assets.Logo}
            style={tw.style(`mt-16 h-16 w-32`, {
              tintColor: colorScheme === 'dark' ? 'white' : 'black',
            })}
          />
          <Text style={tw`font-thin text-3xl`}>SOL</Text>
          <View style={tw`flex-1 justify-center`}>
            <Text>Welcome to your new macOS launcher</Text>
          </View>
          <Text style={tw`font-bold`}>Press ↩ to continue</Text>
        </Fade>
      )}
      {onboardingStep === 'v1_shortcut' && (
        <Fade visible={visible} style={tw`items-center`} duration={250}>
          <Text style={tw`mt-16`}>Pick a global shortcut</Text>
          <View style={tw`flex-1 justify-center`}>
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

          <Text style={tw`font-bold`}>Press ↩ to continue</Text>
        </Fade>
      )}

      {onboardingStep === 'v1_quick_actions' && (
        <Fade visible={visible} style={tw`items-center`} duration={250}>
          <View style={tw`flex-1 justify-center items-center`}>
            <Text>
              <Text style={tw`font-bold`}>⌘ ⇧ V</Text> Clipboard manager
            </Text>
            <Text style={tw`mt-4`}>
              <Text style={tw`font-bold`}>⌘ ⌃ Space</Text> Emoji picker
            </Text>
            <Text style={tw`mt-4`}>
              <Text style={tw`font-bold`}>⌘ ⇧ Space</Text> Scratchpad
            </Text>

            <View
              style={tw`border-b w-32 border-lightBorder dark:border-darkBorder my-8`}
            />

            <Text>
              <Text style={tw`font-bold`}>^ ⌥ ↩</Text> Fullscreen front-most
              window
            </Text>
            <Text style={tw`mt-4`}>
              <Text style={tw`font-bold`}>^ ⌥ →</Text> Resize front-most window
              to the right
            </Text>
            <Text style={tw`mt-4`}>
              <Text style={tw`font-bold`}>^ ⌥ ←</Text> Resize front-most window
              to the left
            </Text>
          </View>
          <Text style={tw`font-bold`}>Press ↩ to continue</Text>
        </Fade>
      )}
    </View>
  )
})
