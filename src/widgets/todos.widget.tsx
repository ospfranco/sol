import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {
  FlatList,
  Image,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import {FocusableWidget} from 'stores'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'
import inbox from '../assets/inbox.png'
import todo from '../assets/todo.png'

interface IProps {
  style?: StyleProp<ViewStyle>
}

const Todo = ({
  text,
  focused,
  cb,
  index,
}: {
  text: string
  focused: boolean
  cb: () => void
  index: number
}) => {
  return (
    <TouchableOpacity
      style={tw.style(`flex-row items-center px-2 py-1`, {
        'bg-gray-300 dark:bg-highlightDark rounded': focused,
      })}
      onPress={cb}>
      <View style={tw`w-3 h-3 border rounded dark:border-gray-500`} />
      <Text style={tw`ml-2`}>{text}</Text>
    </TouchableOpacity>
  )
}

export const TodosWidget: FC<IProps> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()
  const focused = store.ui.focusedWidget === FocusableWidget.TODOS
  const selectedIndex = store.ui.selectedIndex

  return (
    <View
      style={tw.style(
        `p-3 bg-light dark:bg-dark rounded-lg border border-gray-100 dark:border-gray-800 flex-1 h-44`,
        // @ts-ignore
        style,
      )}>
      {!store.ui.minimalistMode && (
        <Text style={tw`pb-3 text-xs text-gray-400`}>Todos</Text>
      )}

      <FlatList
        style={tw`flex-1`}
        data={[...store.ui.todos]}
        renderItem={({item, index}) => {
          return (
            <Todo
              index={index}
              focused={focused && selectedIndex === index}
              text={item.text}
              cb={() => {
                store.ui.markTodoDone(index)
                if (store.ui.focusedWidget !== FocusableWidget.TODOS) {
                  store.ui.setFocus(FocusableWidget.TODOS)
                }
              }}
            />
          )
        }}
        keyExtractor={({id}) => id}
        contentContainerStyle={tw`flex-grow-1`}
        ListEmptyComponent={
          <View
            style={tw.style(
              `text-gray-500 items-center justify-center flex-1`,
              {
                'bg-highlightDark rounded': focused,
              },
            )}>
            <Image source={inbox} style={tw`h-10`} resizeMode="contain" />
          </View>
        }
      />
    </View>
  )
})
