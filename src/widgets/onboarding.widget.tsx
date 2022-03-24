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
    label: (
      <Text>
        <Text style={tw`font-bold text-base`}>⌘</Text> then{' '}
        <Text style={tw`font-bold`}>Space</Text>
      </Text>
    ),
  },
  {
    label: (
      <Text>
        <Text style={tw`font-bold text-base`}>⌥</Text> then{' '}
        <Text style={tw`font-bold`}>Space</Text>
      </Text>
    ),
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
      }, 500)
    }
    if (store.ui.onboardingStep !== 'v1_start') {
      setVisible(false)
    }
    setTimeout(() => {
      setVisible(true)
      setOnboardingStep(store.ui.onboardingStep)
    }, 1000)
  }, [store.ui.onboardingStep])

  return (
    <View style={tw.style(`flex-1 items-center p-6 justify-center`, style)}>
      {onboardingStep === 'v1_start' && (
        <Fade visible={visible} style={tw`items-center`} duration={500}>
          <Image
            source={Assets.Logo}
            style={tw.style(`h-32 w-32`, {
              tintColor: colorScheme === 'dark' ? 'white' : 'black',
            })}
          />
          <Text style={tw`font-thin text-3xl`}>SOL</Text>
          <Text style={tw`mt-20`}>Welcome to your new macOS launcher.</Text>
          <Text style={tw`mt-20 font-bold`}>Press enter to continue</Text>
        </Fade>
      )}
      {onboardingStep === 'v1_shortcut' && (
        <Fade visible={visible} style={tw`items-center`} duration={500}>
          <Image
            source={Assets.Logo}
            style={tw.style(`h-32 w-32`, {
              tintColor: colorScheme === 'dark' ? 'white' : 'black',
            })}
          />
          <Text style={tw``}>Pick a global shortcut</Text>
          <View style={tw`mt-20`}>
            {SHORTCUTS.map((item, index) => {
              return (
                <View
                  style={tw.style(
                    `flex-row items-center px-3 py-2 rounded border border-transparent`,
                    {
                      'bg-highlight bg-opacity-50 dark:bg-gray-500 dark:bg-opacity-30 border-buttonBorder dark:border-darkBorder ':
                        store.ui.selectedIndex === index,
                    },
                  )}>
                  {item.label}
                </View>
              )
            })}
          </View>

          <Text style={tw`mt-20 font-bold`}>Press enter to continue</Text>
        </Fade>
      )}

      {onboardingStep === 'v1_quick_actions' && (
        <Fade visible={visible} style={tw`items-center`} duration={500}>
          <Image
            source={Assets.Logo}
            style={tw.style(`h-32 w-32`, {
              tintColor: colorScheme === 'dark' ? 'white' : 'black',
            })}
          />
          <Text style={tw`mt-20`}>
            Press <Text style={tw`font-bold text-base`}>⌘</Text> at any time to
            see quick actions.
          </Text>
          <Text style={tw`mt-2`}>
            Then the corresponding number to execute them. E.g. ⌘ then 1
          </Text>
          <View
            style={tw`border-b w-32 border-lightBorder dark:border-darkBorder my-8`}
          />
          <View style={tw`flex-row items-center`}>
            <Text style={tw`pr-10`}>Launch at login</Text>
            <Switch
              value={store.ui.launchAtLogin}
              onValueChange={store.ui.setLaunchAtLogin}
            />
          </View>
          <Text style={tw`mt-20 font-bold`}>Press enter to continue</Text>
        </Fade>
      )}
    </View>
  )
})
