import {LegendList} from '@legendapp/list'
import {Assets, Icons} from 'assets'
import clsx from 'clsx'
import {FileIcon} from 'components/FileIcon'
import {renderToKeys} from 'lib/shorcuts'
import {observer} from 'mobx-react-lite'
import {
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import {useStore} from 'store'
import {ItemType} from 'stores/ui.store'

const RenderItem = observer(({item, index}: any) => {
  const store = useStore()
  const itemShortcut = store.ui.shortcuts[item.id]

  return (
    <View
      className={clsx('flex-row items-center py-1.5 px-3 rounded-sm gap-2', {
        'bg-gray-200 dark:subBg': index % 2 === 1,
      })}>
      {!!item.url && <FileIcon url={item.url} className={'w-6 h-6'} />}
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
      <Text className="flex-1">{item.name}</Text>

      <TouchableWithoutFeedback
        onPress={() => {
          store.ui.setShowKeyboardRecorderForItem(true, item.id)
        }}>
        <View className="flex-row gap-1">
          <View className="flex-row gap-1 items-center">
            {itemShortcut ? (
              <View className="flex-row items-center">
                {renderToKeys(itemShortcut)}
                <TouchableOpacity
                  onPress={() => {
                    store.ui.setShortcut(item.id, '')
                  }}>
                  <Image
                    source={Assets.close}
                    className="h-4 w-4 ml-2"
                    style={{tintColor: 'red'}}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <Text className="text-xs darker-text">Click to set</Text>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
})

export const Shortcuts = observer(() => {
  const store = useStore()

  let items = store.ui.items
  items.sort((a, b) => (a.name > b.name ? 1 : -1))

  return (
    <View className="flex-1 h-full gap-1">
      <View className="flex-row gap-8 p-4">
        <View className="flex-1">
          <Text className="text">System Wide Shortcuts</Text>
        </View>
        <TouchableOpacity onPress={store.ui.restoreDefaultShorcuts}>
          <Text className="text-blue-500 text-sm">Restore Defaults</Text>
        </TouchableOpacity>
      </View>
      <LegendList
        contentContainerClassName="px-4 pb-4"
        data={items}
        keyExtractor={item => item.id}
        renderItem={RenderItem}
      />
    </View>
  )
})
