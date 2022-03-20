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

  const lNow = DateTime.now()
  const last30Days = new Array(90)
    .fill(0)
    .map((_, index) => lNow.minus({days: index}))
    .reverse()

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
              )}
              key={index}
            >
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
                <View style={tw`h-32 mt-4 flex-wrap`}>
                  {last30Days.map(lDate => {
                    const entry = aggregation[lDate.startOf('day').toMillis()]
                    if (!entry) {
                      return (
                        <View style={tw`h-5 pb-1 w-10 pr-1`}>
                          <View
                            style={tw`w-full h-full border-gray-600 rounded-sm bg-gray-900`}
                          />
                        </View>
                      )
                    }

                    const monthIndex = Math.floor(
                      lNow.diff(lDate, 'months').months,
                    )
                    // console.warn('monthIndex', monthIndex, entry)

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
                      <View style={tw`h-5 pb-1 w-10 pr-1`}>
                        <View
                          style={tw.style(
                            `w-full h-full rounded-sm items-center justify-center`,
                            bgColor,
                          )}>
                          <Text style={tw`text-xs pb-2`}>
                            {Math.floor(entry.time / 60)}:
                            {Math.round(entry.time % 60)}
                          </Text>
                        </View>
                      </View>
                    )
                  })}
                </View>
              )}
              {/* {selected && (
                <View style={tw`h-32 flex-row mt-4`}>
                  <View
                    style={tw`border-gray-400 dark:border-gray-600 flex-1 flex-row`}>
                    {last30Days.map(lDate => {
                      const entry = aggregation[lDate.startOf('day').toMillis()]

                      if (!entry) {
                        return (
                          <View
                            key={lDate.toISO()}
                            style={tw`h-full items-center`}>
                            <View
                              style={tw`flex-1 border-b w-6 border-gray-600`}
                            />
                            <Text
                              style={tw`text-xs dark:text-gray-400 text-center`}>
                              {lDate.toFormat('dd')}
                            </Text>
                          </View>
                        )
                      }

                      return (
                        <View
                          style={tw`h-full items-center`}
                          key={lDate.toISO()}>
                          <View style={tw`flex-1`} />
                          <View
                            style={tw`w-6 border-b border-gray-600 items-center`}>
                            <Text style={tw`text-xs pb-2`}>
                              {Math.floor(entry.time / 60)}:
                              {Math.round(entry.time % 60)}
                            </Text>
                            <View
                              style={tw`w-2 h-2 rounded-full bg-indigo-600`}
                            />
                            <View
                              style={tw.style(`w-[1px] bg-indigo-600`, {
                                height: Math.ceil(entry.time / 60) * 7,
                              })}
                            />
                          </View>
                          <Text
                            style={tw`text-xs dark:text-gray-400 text-center`}>
                            {entry.date.toFormat('dd')}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                </View>
              )} */}
            </View>
          )
        }}
      />
    </View>
  )
})
