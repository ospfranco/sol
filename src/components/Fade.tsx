import React, {FC, useEffect, useRef} from 'react'
import {Animated, ViewProps, ViewStyle} from 'react-native'

interface IProps extends ViewProps {
  visible: boolean
  style?: ViewStyle
}

export const Fade: FC<IProps> = ({visible, style, children, ...rest}) => {
  const visibilityRef = useRef(new Animated.Value(visible ? 1 : 0))
  useEffect(() => {
    Animated.timing(visibilityRef.current, {
      toValue: visible ? 1 : 0,
      duration: 100,
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
    <Animated.View style={visible ? combinedStyle : containerStyle} {...rest}>
      {visible ? children : null}
    </Animated.View>
  )
}
