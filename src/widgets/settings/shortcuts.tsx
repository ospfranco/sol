import {Icons} from 'assets'
import clsx from 'clsx'
import {FileIcon} from 'components/FileIcon'
import {observer} from 'mobx-react-lite'
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {useStore} from 'store'
import {ItemType} from 'stores/ui.store'

export const Shortcuts = observer(() => {
  const store = useStore()
  const shortcuts = store.ui.shortcuts
  const validatedShortcuts = store.ui.validatedShortcuts
  let items = store.ui.items
  items.sort((a, b) => (a.name > b.name ? 1 : -1))

  return (
    <View className="flex-1 h-full gap-2 subBg">
      <View className="flex-row gap-8 p-4">
        <Text className="text-xs flex-1">
          You can set your own global keyboard shortcuts. Follow the syntax
          "[cmd + shift + option] + [letter]".
        </Text>
        <TouchableOpacity onPress={store.ui.restoreDefaultShorcuts}>
          <Text className="text-blue-500 text-sm">Restore Defaults</Text>
        </TouchableOpacity>
      </View>
      <View className="px-4 pt-4">
        <View className="flex-row items-center py-1.5 px-3 rounded-sm bg-gray-100 dark:bg-neutral-800">
          <Text className="font-bold flex-1">Item</Text>
          <Text className="font-bold">Shortcut</Text>
        </View>
      </View>
      <FlatList
        contentContainerClassName="pl-4 pb-4"
        data={items}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => {
          return (
            <View
              className={clsx(
                'flex-row items-center py-1.5 px-3 rounded-sm gap-2',
                {
                  'bg-gray-200 dark:bg-neutral-800': index % 2 === 1,
                },
              )}>
              {!!item.url && <FileIcon url={item.url} className={'w-6 h-6'} />}
              {item.type !== ItemType.CUSTOM && !!item.icon && (
                <Text>{item.icon}</Text>
              )}

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
              {!!shortcuts[item.id] ? (
                validatedShortcuts[item.id].valid ? (
                  <View className="w-2 h-2 rounded-full bg-green-500" />
                ) : (
                  <View className="w-2 h-2 rounded-full bg-red-500" />
                )
              ) : null}
              <TextInput
                className="w-40 text-xs rounded border border-lightBorder dark:border-darkBorder px-1"
                placeholder="Not set"
                value={shortcuts[item.id] ?? ''}
                onChangeText={t => store.ui.setShorcut(item.id, t)}
              />
            </View>
          )
        }}
      />
    </View>
  )
})
