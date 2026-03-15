import {LegendList, LegendListRef} from '@legendapp/list'
import clsx from 'clsx'
import {FileIcon} from 'components/FileIcon'
import {Key} from 'components/Key'
import {LoadingBar} from 'components/LoadingBar'
import {MainInput} from 'components/MainInput'
import {observer} from 'mobx-react-lite'
import {FC, useEffect, useMemo, useRef} from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {solNative} from 'lib/SolNative'
import {useStore} from 'store'
import {FileSearchMode} from 'stores/ui.store'

const MODES = [
  {mode: FileSearchMode.FUZZY, label: 'Fuzzy', key: '1'},
  {mode: FileSearchMode.PATH, label: 'Path', key: '2'},
  {mode: FileSearchMode.REGEX, label: 'Regex', key: '3'},
] as const

const PLACEHOLDERS: Record<FileSearchMode, string> = {
  [FileSearchMode.FUZZY]: 'Search files by name...',
  [FileSearchMode.PATH]: 'Search by path (e.g. src/comp/Button)...',
  [FileSearchMode.REGEX]: 'Regex pattern (e.g. .*test.*\\.ts$)...',
}

interface Props {
  className?: string
}

const RenderItem = observer(({item, index}: any) => {
  const store = useStore()
  const selectedIndex = store.ui.selectedIndex

  const isActive = index === selectedIndex
  return (
    <View
      className={clsx('flex-row items-center rounded-lg h-12', {
        highlight: isActive,
      })}>
      <View className="flex-1 flex-row items-center px-6 h-9">
        {!!item.url && (
          <View className="gap-1 items-center flex-row">
            <FileIcon url={item.url} className={'w-6 h-6'} />
          </View>
        )}
        <Text
          numberOfLines={1}
          className={clsx('ml-3 flex-1', {
            'text-white dark:text-white': isActive,
          })}>
          {item.name}
        </Text>
        <Text
          className={clsx('darker-text text-xs', {
            'text-white dark:text-white': isActive,
          })}>
          {item.url!.slice(0, 45)}
        </Text>
      </View>
    </View>
  )
})

const CHUNK_SIZE = 50

export const FileSearchWidget: FC<Props> = observer(() => {
  const store = useStore()
  const data = store.ui.files
  const selectedIndex = store.ui.selectedIndex
  const listRef = useRef<LegendListRef | null>(null)
  const placeholder = PLACEHOLDERS[store.ui.fileSearchMode]

  // Progressive loading: render CHUNK_SIZE items ahead of selection
  const visibleCount = useMemo(
    () => Math.min(selectedIndex + CHUNK_SIZE, data.length),
    [selectedIndex, data.length],
  )
  const displayedData = useMemo(
    () => data.slice(0, visibleCount),
    [data, visibleCount],
  )

  useEffect(() => {
    if (displayedData.length && selectedIndex < displayedData.length) {
      listRef.current?.scrollToIndex({
        index: selectedIndex,
        animated: true,
        viewPosition: 0.5,
      })
    }
  }, [selectedIndex])

  // Debounced Quick Look update — wait for navigation to settle
  useEffect(() => {
    const file = data[selectedIndex]
    if (!file?.url) return
    const timer = setTimeout(() => {
      solNative.updateQuickLook(file.url)
    }, 200)
    return () => clearTimeout(timer)
  }, [selectedIndex, data])

  return (
    <View className="flex-1">
      <View className="flex-row px-3">
        <MainInput placeholder={placeholder} showBackButton />
      </View>
      <LoadingBar />
      <View className="flex-1">
        <LegendList
          data={displayedData}
          className="flex-1"
          contentContainerStyle={STYLES.contentContainer}
          ref={listRef}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center">
              <Text className="dark:text-neutral-700 text-sm text-neutral-500">
                No items
              </Text>
            </View>
          }
          drawDistance={500}
          keyExtractor={(_, index) => index.toString()}
          renderItem={RenderItem}
        />
      </View>

      <View className="py-2 px-4 flex-row items-center justify-end gap-1 subBg border-t border-color">
        <View style={{position: 'relative'}}>
          {store.ui.fileSearchMenuOpen && (
            <View
              style={{
                position: 'absolute',
                bottom: 36,
                left: 0,
                zIndex: 10,
              }}>
              <View
                className="rounded-lg p-1 border border-color"
                style={{
                  minWidth: 200,
                  backgroundColor: store.ui.isDarkMode
                    ? 'rgba(50,50,50,0.95)'
                    : 'rgba(235,235,235,0.95)',
                }}>
                <Text className="text-xs darker-text px-3 py-1.5 font-semibold">
                  Search Mode
                </Text>
                {MODES.map(({mode, label, key}, index) => {
                  const isHighlighted = store.ui.fileSearchMenuIndex === index
                  return (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => {
                        store.ui.setFileSearchMode(mode)
                        store.ui.closeFileSearchMenu()
                      }}
                      className={clsx(
                        'flex-row items-center gap-2 px-3 py-1.5 rounded',
                        {
                          'bg-accent': isHighlighted,
                        },
                      )}>
                      <Text
                        className={clsx('text-sm flex-1', {
                          'text-white': isHighlighted,
                        })}>
                        {label}
                        {store.ui.fileSearchMode === mode ? ' \u2713' : ''}
                      </Text>
                      <Key symbol={'⌘'} />
                      <Key symbol={key} />
                    </TouchableOpacity>
                  )
                })}
                <View className="border-t border-color my-1" />
                <TouchableOpacity
                  onPress={() => {
                    const file = data[selectedIndex]
                    if (file?.url) {
                      solNative.toggleQuickLook(file.url)
                    }
                    store.ui.closeFileSearchMenu()
                  }}
                  className={clsx(
                    'flex-row items-center gap-2 px-3 py-1.5 rounded',
                    {
                      'bg-accent': store.ui.fileSearchMenuIndex === 3,
                    },
                  )}>
                  <Text
                    className={clsx('text-sm flex-1', {
                      'text-white': store.ui.fileSearchMenuIndex === 3,
                    })}>
                    Preview
                  </Text>
                  <Key symbol={'⌘'} />
                  <Key symbol={'Y'} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <Text className="text-xs darker-text mr-1">More</Text>
            <Key symbol={'⌘'} />
            <Key symbol={'K'} />
          </View>
        </View>
        <View className="mx-2" />
        <Text className="text-xs darker-text mr-1">Open Folder</Text>
        <Key symbol={'⇧'} />
        <Key symbol={'⏎'} />
        <View className="mx-2" />
        <Text className="text-xs mr-1">Open</Text>
        <Key symbol={'⏎'} primary />
      </View>
    </View>
  )
})

const STYLES = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
})
