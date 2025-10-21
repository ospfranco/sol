import { LegendList } from '@legendapp/list'
import { Assets, Icons } from 'assets'
import clsx from 'clsx'
import Favicon from 'components/Favicon'
import { FileIcon } from 'components/FileIcon'
import { MySwitch } from 'components/MySwitch'
import { renderToKeys } from 'lib/shortcuts'
import { observer } from 'mobx-react-lite'
import {
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useStore } from 'store'
import { ItemType } from 'stores/ui.store'
import { useState, useEffect } from 'react'
import { Input } from 'components/Input'

const RenderItem = observer(({ item, index }: any) => {
  const store = useStore()
  const itemShortcut = store.ui.shortcuts[item.id]
  const isDisabled = store.ui.isItemDisabled(item.id)

  return (
    <View
      className={clsx('flex-row items-center py-1.5 px-3 rounded-sm gap-2', {
        'bg-gray-200 dark:subBg': index % 2 === 1,
        'opacity-50': isDisabled,
      })}>
      <View style={{ marginRight: 8 }}>
        <MySwitch
          value={!isDisabled}
          onValueChange={v => {
            if (v) {
              store.ui.enableItem(item.id)
            } else {
              store.ui.disableItem(item.id)
            }
          }}
        />
      </View>
      {!!item.url && item.type != ItemType.BOOKMARK && (
        <FileIcon url={item.url} className={'w-6 h-6'} />
      )}
      {item.type !== ItemType.CUSTOM && !!item.icon && <Text>{item.icon}</Text>}
      {item.type === ItemType.CUSTOM && !!item.icon && (
        <View className="w-6 h-6 rounded items-center justify-center bg-white dark:bg-black">
          {/* @ts-expect-error */}
          {Icons[item.icon] && (
            <Image
              // @ts-expect-error
              source={Icons[item.icon]}
              style={{
                tintColor: item.color,
                height: 16,
                width: 16,
              }}
            />
          )}
        </View>
      )}
      {!!item.iconImage && (
        <Image
          source={item.iconImage}
          className="w-6 h-6"
          resizeMode="contain"
        />
      )}
      {!!item.IconComponent && <item.IconComponent />}
      {item.type === ItemType.BOOKMARK && (
        <Favicon
          url={item.url!}
          fallback={item.faviconFallback}
          className="h-6 w-6"
        />
      )}
      <Text className="flex-1" numberOfLines={1}>
        {item.name}
      </Text>
      <TouchableWithoutFeedback
        onPress={() => {
          if (!isDisabled) {
            store.ui.setShowKeyboardRecorderForItem(true, item.id)
          }
        }}>
        <View className="flex-row gap-1">
          <View className="flex-row gap-1 items-center">
            {!isDisabled && itemShortcut ? (
              <View className="flex-row items-center gap-1">
                {renderToKeys(itemShortcut)}
                <TouchableOpacity
                  onPress={() => {
                    store.ui.setShortcut(item.id, '')
                  }}>
                  <Image
                    source={Assets.close}
                    className="h-4 w-4 ml-2"
                    style={{ tintColor: 'red' }}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-xs text-accent">{isDisabled ? 'Disabled' : 'Click to set'}</Text>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
})


export const Items = observer(() => {
  const store = useStore()
  const [query, setQuery] = useState('')

  // Clear query on unmount
  useEffect(() => {
    return () => {
      store.ui.setQuery('')
    }
  }, [])

  // Update store query for fuzzy search
  const handleQueryChange = (text: string) => {
    setQuery(text)
    store.ui.setQuery(text)
  }

  let items = store.ui.items

  return (
    <View className="flex-1 h-full p-4">
      <View className="flex-1 p-2 gap-1 subBg rounded-lg border border-lightBorder dark:border-darkBorder">
        <View className="flex-row gap-8 p-4">
          <View className="flex-1">
            <Text className="text">Global Shortcuts</Text>
          </View>
          <TouchableOpacity onPress={store.ui.restoreDefaultShorcuts}>
            <Text className="text-blue-500 text-sm">Restore Defaults</Text>
          </TouchableOpacity>
        </View>
        <View className="border-t border-lightBorder dark:border-darkBorder z-0" />
        <View className='flex-row p-3 justify-between'>
          <Text>Enable Hyper Key (Caps Lock into ⌘ + ⌥ + ⌃ + ⇧)</Text>
          <MySwitch value={store.ui.hyperKeyEnabled}
            onValueChange={store.ui.setHyperKeyEnabled} />
        </View>
        <View className="border-t border-lightBorder dark:border-darkBorder z-0 mb-3" />
        <Input
          bordered
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Type to search..."
          className="ml-2"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        <LegendList
          className="flex-1"
          contentContainerClassName="px-4 pb-4"
          data={items}
          keyExtractor={item => item.id}
          renderItem={RenderItem}
          recycleItems
        />
      </View>
    </View>
  )
})
