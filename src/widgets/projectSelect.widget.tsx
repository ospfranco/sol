import {DateTime} from 'luxon'
import {observer} from 'mobx-react-lite'
import React, {FC} from 'react'
import {FlatList, StyleProp, Text, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

const DAY_WEEK_TO_TEXT = {
  0: 'Mo',
  1: 'Tu',
  2: 'We',
  3: 'Th',
  4: 'Fr',
  5: 'Sa',
  6: 'Su',
}

interface IProps {
  style?: StyleProp<ViewStyle>
}

export const ProjectSelectWidget: FC<IProps> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()

  const selectedIndex = store.ui.selectedIndex

  const lNow = DateTime.now()
  const lThreeMonthsAgo = lNow.minus({month: 3}).startOf('week')
  let lastDays: DateTime[] = []
  let ii = 0
  while (
    Math.floor(lNow.diff(lThreeMonthsAgo.plus({days: ii}), 'days').days) >= 0
  ) {
    lastDays.push(lThreeMonthsAgo.plus({day: ii}))
    ii = ii + 1
  }

  return (
    <View
      style={tw.style(
        `flex-1 p-6`,
        //@ts-ignore
        style,
      )}>
      <Text style={tw`font-medium`}>Track work time</Text>
      <FlatList
        style={tw`flex-1 w-full mt-4`}
        data={store.ui.projects.slice()}
        ListEmptyComponent={() => {
          return <Text style={tw`text-gray-500`}>No projects</Text>
        }}
        renderItem={({item, index}) => {
          const selected = index === selectedIndex

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

          const aggregation = item.periods.reduce((acc, p) => {
            const lDay = DateTime.fromMillis(p.start).startOf('day')
            const startDayMillis = lDay.toMillis()
            if (DateTime.now().diff(lDay, 'days').days > 10) {
              return acc
            }

            const lStart = DateTime.fromMillis(p.start)
            const lEnd = p.end ? DateTime.fromMillis(p.end) : DateTime.now()

            if (!acc[startDayMillis]) {
              acc[startDayMillis] = {
                date: lDay,
                time: 0,
              }
            }

            acc[startDayMillis].time += lEnd.diff(lStart, 'minutes').minutes
            return acc
          }, {} as Record<string, {date: DateTime; time: number}>)

          // INSERT RANDOM JUNK
          // let randomDay = lNow.minus({day: 30})
          // aggregation[randomDay.startOf('day').toMillis()] = {
          //   date: randomDay,
          //   time: 180,
          // }

          return (
            <View
              style={tw.style(
                `px-3 py-2 rounded w-full border border-transparent`,
                {
                  'bg-highlight bg-opacity-50 dark:bg-gray-500 dark:bg-opacity-20 border-buttonBorder dark:border-darkBorder':
                    selectedIndex === index,
                },
              )}>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`flex-1`}>{item.name}</Text>
                <Text style={tw`font-medium text-sm w-20`}>
                  {Math.ceil(todayTime / 60)}h{' '}
                  <Text style={tw`font-normal text-sm text-gray-500`}>
                    today
                  </Text>
                </Text>

                <Text style={tw`font-medium text-sm pl-4 w-24`}>
                  {Math.ceil(monthTime / 60)}h{' '}
                  <Text style={tw`font-normal text-sm text-gray-500`}>
                    month
                  </Text>
                </Text>
              </View>
              {selected && (
                <View style={tw`h-[154px] mt-4 flex-wrap`}>
                  {new Array(7).fill(0).map((day, idx) => {
                    return (
                      <View
                        style={tw`h-[20px] pb-[3px] w-10 pr-[3px]`}
                        key={`label-${idx}`}>
                        <Text style={tw`text-xs text-right pr-2`}>
                          {/* @ts-ignore */}
                          {DAY_WEEK_TO_TEXT[idx]}
                        </Text>
                      </View>
                    )
                  })}
                  {lastDays.map((lDate, idx) => {
                    const entry = aggregation[lDate.startOf('day').toMillis()]
                    if (!entry) {
                      return (
                        <View
                          style={tw`h-[20px] pb-[3px] w-10 pr-[3px]`}
                          key={idx}>
                          <View
                            style={tw`w-full h-full border-gray-600 rounded-sm bg-gray-400 dark:bg-gray-900`}
                          />
                        </View>
                      )
                    }

                    const monthIndex = Math.floor(
                      lNow.diff(lDate, 'months').months,
                    )

                    let baseColor = 'indigo'

                    if (monthIndex === 1) {
                      baseColor = 'blue'
                    }
                    if (monthIndex === 2) {
                      baseColor = 'green'
                    }

                    let bgColor = `bg-${baseColor}-400`

                    switch (true) {
                      case entry.time >= 420:
                        bgColor = `bg-${baseColor}-800`
                        break
                      case entry.time >= 360:
                        bgColor = `bg-${baseColor}-700`
                        break
                      case entry.time >= 240:
                        bgColor = `bg-${baseColor}-600`
                        break
                      case entry.time >= 120:
                        bgColor = `bg-${baseColor}-500`
                        break
                    }

                    return (
                      <View
                        style={tw`h-[20px] pb-[3px] w-10 pr-[3px]`}
                        key={idx}>
                        <View
                          style={tw.style(
                            `w-full h-full rounded-sm items-center justify-center `,
                            bgColor,
                          )}>
                          <Text style={tw`text-xs pb-2 text-white`}>
                            {Math.floor(entry.time / 60)}:
                            {Math.round(entry.time % 60)}
                          </Text>
                        </View>
                      </View>
                    )
                  })}
                </View>
              )}
            </View>
          )
        }}
      />
    </View>
  )
})
