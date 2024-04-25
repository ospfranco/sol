import clsx from 'clsx'
import {GradientView} from 'components/GradientView'
import {Key} from 'components/Key'
import {MainInput} from 'components/MainInput'
import {useFullSize} from 'hooks/useFullSize'
import {observer} from 'mobx-react-lite'
import prettyBytes from 'pretty-bytes'
import React, {FC, useEffect, useRef} from 'react'
import {FlatList, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import {Process} from 'stores/processes.store'
import customColors from '../colors'

interface Props {
  style?: ViewStyle
  className?: string
}

export const ProcessesWidget: FC<Props> = observer(({style}) => {
  useFullSize()

  const store = useStore()
  const data = store.processes.filteredProcesses
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

  useEffect(() => {
    store.processes.fetchProcesses()
  }, [])

  return (
    <View className="flex-1 " style={style}>
      <MainInput placeholder="Search processes..." showBackButton />
      <FlatList
        data={data}
        className="flex-1"
        contentContainerClassName="flex-grow"
        ref={listRef}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="dark:text-neutral-700 text-sm text-neutral-500">
              No items
            </Text>
          </View>
        }
        ListHeaderComponent={() => {
          return (
            <View className="flex-row px-4 py-2 border-b border-lightBorder dark:border-darkBorder ">
              <Text className="flex-1 font-semibold px-4">Process Name</Text>
              <Text className="flex-1 font-semibold px-4">Memory</Text>
              <Text className="flex-1 font-semibold px-4">CPU</Text>
            </View>
          )
        }}
        renderItem={({item, index}) => {
          const process: Process = item as any
          const isActive = index === selectedIndex
          return (
            <View className="px-2 py-1">
              <GradientView
                className={'flex-row px-2'}
                startColor={isActive ? `${customColors.accent}BB` : '#00000000'}
                endColor={isActive ? `${customColors.accent}77` : '#00000000'}
                cornerRadius={10}
                angle={90}>
                <Text
                  className={clsx(
                    'text-sm flex-1 dark:text-neutral-200 px-4 py-2',
                    {
                      'text-white': isActive,
                    },
                  )}>
                  {process.processName}
                </Text>
                <Text
                  className={clsx(
                    'text-sm flex-1 dark:text-neutral-200 px-4 py-2',
                    {
                      'text-white': isActive,
                    },
                  )}>
                  {prettyBytes(process.mem * 1024)}
                </Text>
                <Text
                  className={clsx(
                    'text-sm flex-1 dark:text-neutral-200 px-4 py-2',
                    {
                      'text-white': isActive,
                    },
                  )}>
                  {Math.round(process.cpu)}%
                </Text>
              </GradientView>
            </View>
          )
        }}
      />

      <View
        className="border-t py-2 px-4 border-lightBorder dark:border-darkBorder flex-row items-center justify-end g-1"
        style={{
          backgroundColor: store.ui.isDarkMode ? '#00000018' : '#00000005',
        }}>
        <Text className="text-sm mr-2">Kill process</Text>

        <Key symbol={'⏎'} primary />
      </View>
    </View>
  )
})
