import {Assets} from 'assets'
import clsx from 'clsx'
import {useBoolean} from 'hooks'
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native'
import {SelectableButton} from './SelectableButton'
import {useState} from 'react'
import {set} from 'lodash'

interface Props<T> {
  value: T
  style?: ViewStyle
  className?: string
  onValueChange: (t: T) => void
  options: Array<{
    label: string
    value: T
  }>
  upward?: boolean
}

export const Dropdown = ({
  value,
  style,
  options,
  onValueChange,
  upward = false,
}: Props<string | number>) => {
  const [isOpen, open, close] = useBoolean()
  const [isHovered, hoverOn, hoverOff] = useBoolean()
  const colorScheme = useColorScheme()
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  return (
    <View>
      <TouchableOpacity
        onLayout={e => {
          const {
            x: layoutX,
            y: layoutY,
            width: layoutWidth,
            height: layoutHeight,
          } = e.nativeEvent.layout
          setX(layoutX)
          setY(layoutY)
          setHeight(layoutHeight)
          setWidth(layoutWidth)
        }}
        // @ts-expect-error
        onMouseEnter={hoverOn}
        onMouseLeave={hoverOff}
        enableFocusRing={false}
        onPress={() => {
          isOpen ? close() : open()
        }}
        className={clsx(
          `w-48 rounded justify-center items-center border flex-row py-1 border-neutral-300 dark:border-neutral-700`,
          {
            'dark:bg-neutral-700': isHovered,
            'border-accent': isOpen,
          },
        )}
        style={style}>
        <Text className="flex-1 text-sm ml-2">
          {options.find(o => o.value === value)?.label ?? ''}
        </Text>
        <Image
          source={isOpen ? Assets.ChevronUp : Assets.ChevronDown}
          className="h-4 w-4 mr-2"
          style={{
            tintColor: colorScheme === 'dark' ? '#777' : 'black',
          }}
        />
      </TouchableOpacity>
      {isOpen && (
        <ScrollView
          className={clsx(
            `w-48 mt-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 max-h-32 absolute`,
          )}
          style={{
            top: y + height + 1,
            left: x,
            width: width,
          }}
          contentContainerClassName="gap-1 py-1 px-1.5"
          showsVerticalScrollIndicator={false}>
          {options.map((o, i) => (
            <SelectableButton
              title={o.label}
              key={`option-${i}`}
              selected={false}
              onPress={() => {
                onValueChange(o.value)
                close()
              }}
            />
          ))}
        </ScrollView>
      )}
    </View>
  )
}
