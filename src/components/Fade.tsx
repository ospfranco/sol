import React, {FC, useEffect, useRef} from 'react'
import {Animated, ViewProps, ViewStyle} from 'react-native'

interface Props extends ViewProps {
  visible: boolean
  style?: ViewStyle
  duration?: number
}

export const Fade: FC<Props> = ({
  visible,
  style,
  children,
  duration = 100,
  ...rest
}) => {
  const visibilityRef = useRef(new Animated.Value(0))
  useEffect(() => {
    Animated.timing(visibilityRef.current, {
      toValue: visible ? 1 : 0,
      duration: duration,
      useNativeDriver: true,
    }).start()
  }, [visible])

  const containerStyle = {
    opacity: visibilityRef.current.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  }

  const combinedStyle = [containerStyle, style]
  return (
    <Animated.View style={combinedStyle} {...rest}>
      {children}
    </Animated.View>
  )
}
