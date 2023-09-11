import clsx from 'clsx'
import {FileIcon} from 'components/FileIcon'
import {GradientView} from 'components/GradientView'
import {Key} from 'components/Key'
import {LoadingBar} from 'components/LoadingBar'
import {StyledFlatList} from 'components/StyledFlatList'
import {useFullSize} from 'hooks/useFullSize'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {FlatList, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import customColors from '../colors'
import {MainInput} from 'components/MainInput'

interface Props {
  style?: ViewStyle
  className?: string
}

export const ClipboardWidget: FC<Props> = observer(({style}) => {
  useFullSize()

  const store = useStore()
  const data = store.clipboard.clipboardItems
  const selectedIndex = store.ui.selectedIndex
  const listRef = useRef<FlatList | null>(null)

  useEffect(() => {
    if (data.length > 0) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 80,
      })
    }
  }, [selectedIndex])

  return (
    <View className="flex-1 " style={style}>
      <MainInput placeholder="Search pasteboard history..." showBackButton />
      <LoadingBar />
      <StyledFlatList
        data={data}
        className="flex-1"
        contentContainerStyle="flex-grow"
        ref={listRef}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="dark:text-neutral-700 text-sm text-neutral-500">
              No items
            </Text>
          </View>
        }
        renderItem={({item, index}: any) => {
          const isActive = index === selectedIndex
          return (
            <View className="p-2">
              <GradientView
                className={'flex-row px-2'}
                startColor={isActive ? `${customColors.accent}BB` : '#00000000'}
                endColor={isActive ? `${customColors.accent}77` : '#00000000'}
                cornerRadius={10}
                angle={90}>
                <FileIcon
                  url={decodeURIComponent(item.bundle?.replace('file://', ''))}
                  className="h-6 w-6 mt-3"
                />
                <Text
                  className={clsx('text-sm flex-1 dark:text-neutral-200 p-4', {
                    'text-white': isActive,
                  })}>
                  {item.text.substring(0, 256)}
                </Text>
              </GradientView>
            </View>
          )
        }}
      />
    </View>
  )
})
