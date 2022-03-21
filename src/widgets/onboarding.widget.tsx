import {Assets} from 'assets'
import {Fade} from 'components/Fade'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {Appearance, Image, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'

interface Props {
  style?: ViewStyle
}

const SHORTCUTS = [{label: '⌘ then space'}, {label: '⌥ then space'}]

export const OnboardingWidget: FC<Props> = observer(({style}) => {
  const store = useStore()
  const colorScheme = Appearance.getColorScheme()

  return (
    <View style={tw.style(`flex-1 items-center p-6 justify-center`, style)}>
      {store.ui.onboardingStep === 'v1_start' && (
        <Fade visible={true} style={tw`items-center`} duration={1000}>
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
      {store.ui.onboardingStep === 'v1_shortcut' && (
        <Fade visible={true} style={tw`items-center`} duration={1000}>
          <Image
            source={Assets.Logo}
            style={tw.style(`h-32 w-32`, {
              tintColor: colorScheme === 'dark' ? 'white' : 'black',
            })}
          />
          <Text style={tw``}>Select a global shortcut to open SOL.</Text>
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
                  <Text style={tw.style('text-sm')}>{item.label}</Text>
                </View>
              )
            })}
          </View>

          <Text style={tw`mt-20 font-bold`}>Press enter to continue</Text>
        </Fade>
      )}

      {store.ui.onboardingStep === 'v1_quick_actions' && (
        <Fade visible={true} style={tw`items-center`} duration={1000}>
          <Image
            source={Assets.Logo}
            style={tw.style(`h-32 w-32`, {
              tintColor: colorScheme === 'dark' ? 'white' : 'black',
            })}
          />
          <Text style={tw`mt-20`}>
            Press the command ⌘ key at any time to see quick actions.
          </Text>
          <Text style={tw`mt-2`}>
            Then the corresponding number to execute them. E.g. ⌘ then 1
          </Text>
          <Text style={tw`mt-20 font-bold`}>Press enter to continue</Text>
        </Fade>
      )}
    </View>
  )
})
