import {Assets} from 'assets'
import clsx from 'clsx'
import {Fade} from 'components/Fade'
import {GradientView} from 'components/GradientView'
import {Key} from 'components/Key'
import {useFullSize} from 'hooks/useFullSize'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useState} from 'react'
import {Appearance, Image, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {Widget} from 'stores/ui.store'
import customColors from '../colors'

interface Props {
  style?: ViewStyle
  className?: string
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
        <View className="w-96 absolute bottom-[-60]">
          <Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-8 text-center">
            Unbind the Spotlight shortcut via
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-200 mt-2 text-center">
            System Settings → Keyboard Shortcuts → Spotlight
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
            <Image
              source={Assets.Logo}
              style={{
                height: 120,
                width: 120,
                tintColor: colorScheme === 'dark' ? 'white' : 'black',
              }}
            />
          </View>

          <Text className="mt-6 dark:text-neutral-400">
            Welcome to your new launcher
          </Text>

          <View className="flex-1" />
          <View className="w-full flex-row items-center justify-end border-t border-lightBorder dark:border-darkBorder px-3 py-2 ">
            <Text className="text-sm">Continue</Text>
            <Key symbol="return" primary className="mx-2" />
          </View>
        </Fade>
      )}

      {onboardingStep === 'v1_shortcut' && (
        <Fade visible={visible} className="items-center flex-1" duration={250}>
          <View className="flex-1 justify-center relative">
            <Text className="text-neutral-500 dark:text-neutral-400 mb-4 self-center">
              Pick a global shortcut
            </Text>

            {SHORTCUTS.map((item, index) => {
              const Label = item.label
              const SubLabel = item.subLabel
              let isActive = store.ui.selectedIndex === index

              return (
                <View key={index} className="items-center">
                  <GradientView
                    className={'flex-row items-center px-3 py-2'}
                    startColor={
                      isActive ? `${customColors.accent}BB` : '#00000000'
                    }
                    endColor={
                      isActive ? `${customColors.accent}77` : '#00000000'
                    }
                    cornerRadius={10}
                    angle={90}>
                    <Label
                      className={clsx({
                        'text-white': store.ui.selectedIndex === index,
                      })}
                    />
                  </GradientView>
                  {!!SubLabel && store.ui.selectedIndex === index && (
                    <SubLabel />
                  )}
                </View>
              )
            })}
          </View>

          <View className="w-full flex-row items-center justify-end border-t border-lightBorder dark:border-darkBorder px-3 py-2 ">
            <Text className="text-sm">Select</Text>
            <Key symbol="return" primary className="mx-2" />
          </View>
        </Fade>
      )}

      {onboardingStep === 'v1_quick_actions' && (
        <Fade visible={visible} className="items-center flex-1" duration={250}>
          <View className="flex-1" />
          <View className="flex-1 justify-center items-center p-12">
            <Text className="mt-10">
              Here are some shortcuts to get you started
            </Text>

            <View className="flex-row mt-10 items-center">
              <Text className="flex-1 text-right font-semibold">
                Clipboard Manager
              </Text>
              <View className="flex-1 flex-row items-center">
                <Key symbol="⌘" className="ml-2" />
                <Key symbol="⇧" className="ml-1" />
                <Key symbol="V" className="ml-1" />
              </View>
            </View>

            <View className="flex-row mt-4 items-center">
              <Text className="flex-1 text-right font-semibold">
                Emoji Picker
              </Text>
              <View className="flex-1 flex-row items-center">
                <Key symbol="⌘" className="ml-2" />
                <Key symbol="⌃" className="ml-1" />
                <Key symbol="Space" className="ml-1" />
              </View>
            </View>

            <View className="flex-row mt-4 items-center">
              <Text className="flex-1 text-right font-semibold">
                Note Scratchpad
              </Text>
              <View className="flex-1 flex-row items-center">
                <Key symbol="⌘" className="ml-2" />
                <Key symbol="⇧" className="ml-1" />
                <Key symbol="Space" className="ml-1" />
              </View>
            </View>

            <View className="flex-row mt-4 items-center">
              <Text className="flex-1 text-right font-semibold">
                Fullscreen front-most window
              </Text>
              <View className="flex-1 flex-row items-center">
                <Key symbol="^" className="ml-2" />
                <Key symbol="⌥" className="ml-1" />
                <Key symbol="⏎" className="ml-1" />
              </View>
            </View>

            <View className="flex-row mt-4 items-center">
              <Text className="flex-1 text-right font-semibold">
                Resize front-most window to the right
              </Text>
              <View className="flex-1 flex-row items-center">
                <Key symbol="^" className="ml-2" />
                <Key symbol="⌥" className="ml-1" />
                <Key symbol="→" className="ml-1" />
              </View>
            </View>

            <View className="flex-row mt-4 items-center">
              <Text className="flex-1 text-right font-semibold">
                Resize front-most window to the left
              </Text>
              <View className="flex-1 flex-row items-center">
                <Key symbol="^" className="ml-2" />
                <Key symbol="⌥" className="ml-1" />
                <Key symbol="←" className="ml-1" />
              </View>
            </View>
          </View>
          <View className="flex-1" />

          <View className="w-full flex-row items-center justify-end border-t border-lightBorder dark:border-darkBorder px-3 py-2">
            <Text className="text-sm">Continue</Text>
            <Key symbol="return" primary className="mx-2" />
          </View>
        </Fade>
      )}
    </View>
  )
})
