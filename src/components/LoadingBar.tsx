import {observer} from 'mobx-react-lite'
import React, {useEffect, useRef} from 'react'
import {Animated, useColorScheme} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'

export const LoadingBar = observer(() => {
  const colorScheme = useColorScheme()
  const store = useStore()
  const animatedBorderRef = useRef(
    new Animated.Value(store.ui.isLoading ? 1 : 0),
  )
  const accentColor = tw.color('text-accent')!

  useEffect(() => {
    Animated.timing(animatedBorderRef.current, {
      toValue: store.ui.isLoading ? 1 : 0,
      duration: store.ui.isLoading ? 500 : 100,
      useNativeDriver: false,
    }).start()
  }, [store.ui.isLoading])

  return (
    <Animated.View
      style={[
        tw.style(`border-b`),
        {
          borderColor: animatedBorderRef.current.interpolate({
            inputRange: [0, 1],
            outputRange: [
              colorScheme === 'dark'
                ? 'rgba(255, 255, 255, .2)'
                : 'rgba(0, 0, 0, .1)',
              accentColor,
            ],
          }),
        },
      ]}
    />
  )
})
