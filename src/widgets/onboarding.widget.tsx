import {Assets} from 'assets'
import clsx from 'clsx'
import {Fade} from 'components/Fade'
import {Key} from 'components/Key'
import {useFullSize} from 'hooks/useFullSize'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useState} from 'react'
import {Appearance, Image, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {Widget} from 'stores/ui.store'

interface Props {
  style?: ViewStyle
}

const SHORTCUTS = [
  {
    label: ({style}: {style?: any; className: string}) => (
      <Text style={style}>
        <Text className="font-bold text-base" style={style}>
          ⌥
        </Text>{' '}
        then{' '}
        <Text className="font-bold" style={style}>
          Space
        </Text>
      </Text>
    ),
  },
  {
    label: ({style}: {style?: any; className: string}) => (
      <Text style={style}>
        <Text className="font-bold text-base" style={style}>
          ⌃
        </Text>{' '}
        then{' '}
        <Text className="font-bold" style={style}>
          Space
        </Text>
      </Text>
    ),
  },
  {
    label: ({style}: {style?: any; className: string}) => (
      <Text style={style}>
        <Text className="font-bold text-base" style={style}>
          ⌘
        </Text>{' '}
        then{' '}
        <Text className="font-bold" style={style}>
          Space
        </Text>
      </Text>
    ),
    subLabel: () => {
      return (
        <View className="absolute bottom-[-120px] w-96">
          <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-8 text-center">
            Unbind the Spotlight shortcut in:
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-200 mt-2 text-center">
            System Preferences → Keyboard Shortcuts → Spotlight
          </Text>
        </View>
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
    <View className="flex-1" style={style}>
      {onboardingStep === 'v1_start' && (
        <Fade visible={visible} className="items-center flex-1" duration={250}>
          <View className="flex-1" />
          <View className="flex-row items-center">
            <Text className="text-3xl">S</Text>
            <Image
              source={Assets.Logo}
              className="h-16 w-32"
              style={{
                tintColor: colorScheme === 'dark' ? 'white' : 'black',
              }}
            />
            <Text className="text-3xl">L</Text>
          </View>

          <Text className="mt-3 dark:text-neutral-400">
            Welcome to your new macOS launcher
          </Text>

          <View className="flex-1" />
          <View className="w-full flex-row items-center justify-end border-t border-lightBorder dark:border-darkBorder px-3 py-2 bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30">
            <Text className="text-sm">Continue</Text>
            <Key title="return" primary className="mx-2" />
          </View>
        </Fade>
      )}

      {onboardingStep === 'v1_shortcut' && (
        <Fade visible={visible} className="items-center flex-1 " duration={250}>
          <View className="flex-1 justify-center relative">
            <Text className="dark:text-neutral-300 mb-4">
              Pick a global shortcut
            </Text>

            {SHORTCUTS.map((item, index) => {
              const Label = item.label
              const SubLabel = item.subLabel

              return (
                <View key={index} className="items-center">
                  <View
                    className={clsx(
                      `flex-row items-center px-3 py-2 rounded-r border-l-2 border-transparent`,
                      {
                        'bg-lightHighlight border-black dark:bg-darkHighlight dark:border-white':
                          store.ui.selectedIndex === index,
                      },
                    )}>
                    <Label
                      className={clsx({
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

          <View className="w-full flex-row items-center justify-end border-t border-lightBorder dark:border-darkBorder px-3 py-2 bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30">
            <Text className="text-sm">Select & Continue</Text>
            <Key title="return" primary className="mx-2" />
          </View>
        </Fade>
      )}

      {onboardingStep === 'v1_quick_actions' && (
        <Fade visible={visible} className="items-center flex-1" duration={250}>
          <View className="flex-1" />
          <View className="flex-1 justify-center items-center p-12">
            <Text>
              Search for apps, commands and the web from the main window
            </Text>
            <Text className="mt-10 dark:text-neutral-400">
              Here are some shortcuts to get you started:
            </Text>

            <View className="flex-row mt-4 items-center">
              <Text className="flex-1 text-right">Clipboard Manager</Text>
              <View className="flex-1 flex-row items-center">
                <Key title="⌘" className="ml-2" />
                <Key title="⇧" className="ml-1" />
                <Key title="V" className="ml-1" />
              </View>
            </View>

            <View className="flex-row mt-4 items-center">
              <Text className="flex-1 text-right">Emoji Picker</Text>
              <View className="flex-1 flex-row items-center">
                <Key title="⌘" className="ml-2" />
                <Key title="⌃" className="ml-1" />
                <Key title="Space" className="ml-1" />
              </View>
            </View>

            <View className="flex-row mt-4 items-center">
              <Text className="flex-1 text-right">Note Scratchpad</Text>
              <View className="flex-1 flex-row items-center">
                <Key title="⌘" className="ml-2" />
                <Key title="⇧" className="ml-1" />
                <Key title="Space" className="ml-1" />
              </View>
            </View>

            <View className="flex-row mt-4 items-center">
              <Text className="flex-1 text-right">
                Fullscreen front-most window
              </Text>
              <View className="flex-1 flex-row items-center">
                <Key title="^" className="ml-2" />
                <Key title="⌥" className="ml-1" />
                <Key title="⏎" className="ml-1" />
              </View>
            </View>

            <View className="flex-row mt-4 items-center">
              <Text className="flex-1 text-right">
                Resize front-most window to the right
              </Text>
              <View className="flex-1 flex-row items-center">
                <Key title="^" className="ml-2" />
                <Key title="⌥" className="ml-1" />
                <Key title="→" className="ml-1" />
              </View>
            </View>

            <View className="flex-row mt-4 items-center">
              <Text className="flex-1 text-right">
                Resize front-most window to the left
              </Text>
              <View className="flex-1 flex-row items-center">
                <Key title="^" className="ml-2" />
                <Key title="⌥" className="ml-1" />
                <Key title="←" className="ml-1" />
              </View>
            </View>
          </View>
          <View className="flex-1" />

          <View className="w-full flex-row items-center justify-end border-t border-lightBorder dark:border-darkBorder px-3 py-2 bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30">
            <Text className="font-bold text-sm">Continue</Text>
            <Key title="⏎" primary className="mx-2" />
          </View>
        </Fade>
      )}
    </View>
  )
})
