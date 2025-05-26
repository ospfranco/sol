import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {useEffect, useRef} from 'react'
import {Animated, useColorScheme} from 'react-native'
import {useStore} from 'store'

export const LoadingBar = observer(() => {
  const store = useStore()
  const isDarkMode = store.ui.isDarkMode
  const animatedBorderRef = useRef(new Animated.Value(0))
  const accentColor = solNative.accentColor

  useEffect(() => {
    Animated.timing(animatedBorderRef.current, {
      toValue: store.ui.isLoading ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start()
  }, [store.ui.isLoading])

  return (
    <Animated.View
      className="border-b"
      style={{
        borderColor: animatedBorderRef.current.interpolate({
          inputRange: [0, 1],
          outputRange: [
            isDarkMode ? 'rgba(255, 255, 255, .1)' : 'rgba(0, 0, 0, .1)',
            accentColor,
          ],
        }),
      }}
    />
  )
})
