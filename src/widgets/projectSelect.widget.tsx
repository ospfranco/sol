import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {FlatList, StyleProp, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface IProps {
  style?: StyleProp<ViewStyle>
}

export const ProjectSelectWidget: FC<IProps> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()

  const selectedIndex = store.ui.selectedIndex

  return (
    <View
      style={tw.style(
        `flex-1 p-6`,
        //@ts-ignore
        style,
      )}>
      <Text style={tw`font-medium text-gray-500`}>Track work time</Text>
      <FlatList
        style={tw`flex-1 w-full mt-4`}
        data={store.ui.projects.slice()}
        ListEmptyComponent={() => {
          return <Text style={tw`text-gray-500`}>No projects</Text>
        }}
        renderItem={({item, index}) => {
          let todayTime = 0
          let monthTime = 0
          const todayStart = DateTime.now().startOf('day').valueOf()
          const monthStart = DateTime.now().startOf('month').valueOf()
          item.periods.forEach(({start, end}) => {
            const lStart = DateTime.fromMillis(start)
            const lEnd = end ? DateTime.fromMillis(end) : null

            if (lStart.startOf('day').valueOf() === todayStart) {
              if (lEnd) {
                todayTime += lEnd.diff(lStart, 'minutes').minutes
              } else {
                todayTime += DateTime.now().diff(lStart, 'minutes').minutes
              }
            }

            if (lStart.startOf('month').valueOf() === monthStart) {
              if (lEnd) {
                monthTime += lEnd.diff(lStart, 'minutes').minutes
              } else {
                monthTime += DateTime.now().diff(lStart, 'minutes').minutes
              }
            }
          })
          return (
            <View
              style={tw.style(
                `flex-row items-center px-3 py-2 rounded w-full`,
                {
                  'bg-highlight bg-opacity-50 dark:bg-gray-500 dark:bg-opacity-30':
                    selectedIndex === index,
                },
              )}>
              <Text style={tw`flex-1`}>{item.name}</Text>
              <Text style={tw`font-medium text-sm`}>
                <Text style={tw`font-normal text-sm text-gray-500`}>
                  Today:
                </Text>{' '}
                {Math.ceil(todayTime / 60)}
              </Text>

              <Text style={tw`font-medium text-sm pl-4`}>
                <Text style={tw`font-normal text-sm text-gray-500`}>
                  Month:
                </Text>{' '}
                {Math.ceil(monthTime / 60)}
              </Text>
            </View>
          )
        }}
      />
    </View>
  )
})
