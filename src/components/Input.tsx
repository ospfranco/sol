import React, {FC} from 'react'
import {Appearance, TextInput, TextInputProps} from 'react-native'

interface IProps extends TextInputProps {}

export const Input: FC<IProps> = props => {
  const colorScheme = Appearance.getColorScheme()
  return (
    <TextInput
      // selectionColor="#1068FF"
      selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
      {...props}
    />
  )
}
