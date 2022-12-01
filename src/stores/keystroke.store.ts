import {extractMeetingLink} from 'lib/calendar'
import {EMOJIS_PER_ROW} from 'lib/emoji'
import {solNative} from 'lib/SolNative'
import {makeAutoObservable} from 'mobx'
import {Clipboard, EmitterSubscription, Linking} from 'react-native'
import {IRootStore} from 'store'
import {ItemType, Widget} from './ui.store'

const GIFS_PER_ROW = 5

let keyDownListener: EmitterSubscription | undefined
let keyUpListener: EmitterSubscription | undefined

export const createKeystrokeStore = (root: IRootStore) => {
  let store = makeAutoObservable({
    commandPressed: false,
    shiftPressed: false,

    keyDown: async ({
      keyCode,
      meta,
      shift,
    }: {
      key: string
      keyCode: number
      meta: boolean
      shift: boolean
    }) => {
      // console.warn('keyCode', keyCode)
      switch (keyCode) {
        // delete key
        case 51: {
          if (
            store.shiftPressed &&
            root.ui.focusedWidget === Widget.SEARCH &&
            root.ui.currentItem != null &&
            root.ui.currentItem.type === ItemType.CUSTOM
          ) {
            const newItems = root.ui.customItems.filter(
              c => c.name !== root.ui.currentItem!.name,
            )
            root.ui.customItems = newItems
          }
          break
        }
        // tab key
        case 48: {
          switch (root.ui.focusedWidget) {
            case Widget.SEARCH:
              if (!!root.ui.filteredEvents.length) {
                root.ui.selectedIndex = 0
                root.ui.focusedWidget = Widget.CALENDAR
              }
              break

            case Widget.CALENDAR:
              root.ui.selectedIndex = 0
              root.ui.focusedWidget = Widget.SEARCH
              break
          }

          break
        }

        // enter key
        case 36: {
          switch (root.ui.focusedWidget) {
            case Widget.CLIPBOARD: {
              const entry = root.clipboard.clipboardItems[root.ui.selectedIndex]

              const originalIndex = root.clipboard.clipboardItems.findIndex(
                e => entry === e,
              )
              root.clipboard.unshift(originalIndex)

              if (entry) {
                if (meta) {
                  try {
                    Linking.openURL(entry)
                  } catch (e) {
                    // console.log('could not open in browser')
                  }
                  solNative.hideWindow()
                } else {
                  solNative.pasteToFrontmostApp(entry)
                }
              }

              break
            }

            case Widget.GIFS: {
              const gif = root.ui.gifs[root.ui.selectedIndex]

              solNative.pasteToFrontmostApp(
                gif.images.downsized.url
                  .replace('media1.giphy.com', 'media.giphy.com')
                  .replace('media3.giphy.com', 'media.giphy.com'),
              )
              break
            }

            case Widget.EMOJIS: {
              root.ui.insertEmojiAt(root.ui.selectedIndex)
              break
            }

            // Enter listener is disabled while using the scratch pad
            case Widget.SCRATCHPAD: {
              break
            }

            case Widget.ONBOARDING: {
              switch (root.ui.onboardingStep) {
                case 'v1_start': {
                  root.ui.onboardingStep = 'v1_shortcut'
                  break
                }

                case 'v1_shortcut': {
                  if (root.ui.selectedIndex === 0) {
                    root.ui.setGlobalShortcut('option')
                  } else {
                    root.ui.setGlobalShortcut('command')
                  }
                  root.ui.onboardingStep = 'v1_quick_actions'
                  break
                }

                case 'v1_quick_actions': {
                  root.ui.onboardingStep = 'v1_completed'
                  break
                }
              }
              break
            }

            case Widget.PROJECT_CREATION: {
              root.ui.createTrackingProject()
              break
            }

            case Widget.PROJECT_SELECT: {
              const id = root.ui.projects[root.ui.selectedIndex].id
              root.ui.trackProject(id)
              root.ui.focusedWidget = Widget.SEARCH
              root.ui.selectedIndex = 0
              break
            }

            case Widget.CALENDAR: {
              const event = root.ui.filteredEvents[root.ui.selectedIndex]
              if (event) {
                let eventLink: string | null | undefined = event.url

                if (!eventLink) {
                  eventLink = extractMeetingLink(event.notes, event.location)
                }

                if (eventLink) {
                  Linking.openURL(eventLink)
                } else {
                  Linking.openURL('ical://')
                }
              } else {
                Linking.openURL('ical://')
              }
              solNative.hideWindow()
              break
            }

            case Widget.TRANSLATION: {
              if (root.ui.translationResults) {
                if (root.ui.selectedIndex === 0) {
                  Clipboard.setString(root.ui.translationResults.en!)
                } else {
                  Clipboard.setString(root.ui.translationResults.de!)
                }
                solNative.hideWindow()
                root.ui.translationResults = null
              }
              break
            }

            case Widget.SEARCH: {
              if (!root.ui.query && !!root.ui.upcomingEvent) {
                let eventLink: string | null | undefined =
                  root.ui.upcomingEvent.url

                if (!eventLink) {
                  eventLink = extractMeetingLink(
                    root.ui.upcomingEvent.notes,
                    root.ui.upcomingEvent.location,
                  )
                }

                if (eventLink) {
                  Linking.openURL(eventLink)
                } else {
                  Linking.openURL('ical://')
                }
              }

              if (root.ui.temporaryResult && root.ui.selectedIndex === 0) {
                Clipboard.setString(root.ui.temporaryResult)
                solNative.hideWindow()
                return
              }

              let item = root.ui.items[root.ui.selectedIndex]

              if (item == null) {
                return
              }

              // bump frequency
              root.ui.frequencies[item.name] =
                (root.ui.frequencies[item.name] ?? 0) + 1

              // close window
              if (!item.preventClose) {
                solNative.hideWindow()
              }

              if (store.commandPressed && item.metaCallback) {
                item.metaCallback()
              } else if (item.url) {
                solNative.openFile(item.url)
              } else if (item.callback) {
                item.callback()
              }

              if (item.type === ItemType.CUSTOM) {
                if (item.text) {
                  if (item.isApplescript) {
                    solNative.executeAppleScript(item.text)
                  } else {
                    Linking.openURL(item.text)
                  }
                }
              }

              break
            }
          }
          break
        }

        // esc key
        case 53: {
          switch (root.ui.focusedWidget) {
            case Widget.SEARCH:
            case Widget.GIFS:
            case Widget.EMOJIS:
            case Widget.SCRATCHPAD:
            case Widget.CLIPBOARD:
            case Widget.GOOGLE_MAP:
              solNative.hideWindow()
              break

            default:
              root.ui.setQuery('')
              root.ui.focusWidget(Widget.SEARCH)
              break
          }
          break
        }

        // left key
        case 123: {
          switch (root.ui.focusedWidget) {
            case Widget.CALENDAR:
              const selectedEvent =
                root.ui.filteredEvents[root.ui.selectedIndex]
              let groupIndex = -1
              let itemIndex = -1
              let groups = Object.values(root.ui.groupedEvents)
              for (let ii = 0; ii < groups.length; ii++) {
                const group = groups[ii]
                for (let jj = 0; jj < group.events.length; jj++) {
                  const event = group.events[jj]
                  if (event.id === selectedEvent.id) {
                    itemIndex = jj
                    groupIndex = ii
                  }
                }
              }

              if (groupIndex === -1 || itemIndex === -1) {
                throw new Error('Could not find Item something is wrong')
              }

              let nextGroupIndex = groupIndex - 1

              while (
                nextGroupIndex >= 0 &&
                !groups[nextGroupIndex].events.length
              ) {
                nextGroupIndex--
              }

              if (nextGroupIndex === -1) {
                return
              }

              itemIndex = Math.min(
                groups[nextGroupIndex].events.length - 1,
                itemIndex,
              )

              if (itemIndex === -1) {
                return
              }

              const nextEvent = groups[nextGroupIndex].events[itemIndex]
              const nextIndex = root.ui.filteredEvents.findIndex(
                e => e.id === nextEvent.id,
              )

              root.ui.selectedIndex = nextIndex

              break
            case Widget.GIFS:
            case Widget.EMOJIS:
              root.ui.selectedIndex = Math.max(root.ui.selectedIndex - 1, 0)
              break
          }
          break
        }

        // right key
        case 124: {
          switch (root.ui.focusedWidget) {
            case Widget.CALENDAR:
              const selectedEvent =
                root.ui.filteredEvents[root.ui.selectedIndex]
              let groupIndex = -1
              let itemIndex = -1
              let groups = Object.values(root.ui.groupedEvents)
              for (let ii = 0; ii < groups.length; ii++) {
                const group = groups[ii]
                for (let jj = 0; jj < group.events.length; jj++) {
                  const event = group.events[jj]
                  if (event.id === selectedEvent.id) {
                    itemIndex = jj
                    groupIndex = ii
                  }
                }
              }

              if (groupIndex === -1 || itemIndex === -1) {
                throw new Error('Could not find event something is wrong')
              }

              let nextGroupIndex = groupIndex + 1

              while (
                nextGroupIndex < groups.length &&
                !groups[nextGroupIndex].events.length
              ) {
                nextGroupIndex++
              }

              if (nextGroupIndex === groups.length) {
                return
              }

              itemIndex = Math.min(
                groups[nextGroupIndex].events.length - 1,
                itemIndex,
              )

              if (itemIndex === -1) {
                return
              }

              const nextEvent = groups[nextGroupIndex].events[itemIndex]
              const nextIndex = root.ui.filteredEvents.findIndex(
                e => e.id === nextEvent.id,
              )

              root.ui.selectedIndex = nextIndex

              break

            case Widget.GIFS:
            case Widget.EMOJIS:
              root.ui.selectedIndex += 1
              break
          }
          break
        }

        // up key
        case 126: {
          switch (root.ui.focusedWidget) {
            case Widget.SCRATCHPAD:
              return
            case Widget.EMOJIS:
              root.ui.selectedIndex = Math.max(
                root.ui.selectedIndex - EMOJIS_PER_ROW,
                0,
              )
              break

            case Widget.GIFS:
              root.ui.selectedIndex = Math.max(
                root.ui.selectedIndex - GIFS_PER_ROW,
                0,
              )
              break

            default:
              root.ui.selectedIndex = Math.max(0, root.ui.selectedIndex - 1)
              break
          }
          break
        }

        // down key
        case 125: {
          switch (root.ui.focusedWidget) {
            case Widget.CLIPBOARD: {
              root.ui.selectedIndex = Math.min(
                root.ui.selectedIndex + 1,
                root.clipboard.items.length - 1,
              )
              break
            }

            case Widget.GIFS: {
              root.ui.selectedIndex = root.ui.selectedIndex + GIFS_PER_ROW
              break
            }

            case Widget.EMOJIS: {
              root.ui.selectedIndex = root.ui.selectedIndex + EMOJIS_PER_ROW
              break
            }

            case Widget.ONBOARDING: {
              switch (root.ui.onboardingStep) {
                case 'v1_shortcut': {
                  root.ui.selectedIndex = Math.min(1, root.ui.selectedIndex + 1)
                }
              }
              break
            }

            case Widget.SEARCH: {
              root.ui.selectedIndex = Math.min(
                root.ui.items.length - 1,
                root.ui.selectedIndex + 1,
              )
              break
            }

            case Widget.CALENDAR: {
              root.ui.selectedIndex = Math.min(
                root.ui.filteredEvents.length - 1,
                root.ui.selectedIndex + 1,
              )
              break
            }

            case Widget.PROJECT_SELECT: {
              root.ui.selectedIndex =
                (root.ui.selectedIndex + 1) % root.ui.projects.length
              break
            }

            case Widget.TRANSLATION: {
              root.ui.selectedIndex = (root.ui.selectedIndex + 1) % 2
              break
            }
          }
          break
        }

        // "1"
        case 18: {
          if (meta) {
            if (root.ui.query) {
              Linking.openURL(`https://google.com/search?q=${root.ui.query}`)
              root.ui.query = ''
            }
          }
          break
        }

        // "2"
        case 19: {
          if (meta) {
            if (root.ui.query) {
              root.ui.translateQuery()
            }
          }
          break
        }

        // "3"
        case 20: {
          if (meta) {
            if (root.ui.query) {
              root.ui.focusedWidget = Widget.GOOGLE_MAP
            } else {
              root.ui.runFavorite(2)
            }
          }
          break
        }

        // "4"
        // case 21: {
        //   if (meta) {
        //     root.ui.runFavorite(3)
        //   }
        //   break
        // }

        // // "5"
        // case 23: {
        //   if (meta) {
        //     root.ui.runFavorite(4)
        //   }
        //   break
        // }

        // meta key
        case 55: {
          store.commandPressed = true
          break
        }

        // shift key
        case 60: {
          store.shiftPressed = true
          break
        }
      }
    },
    keyUp: async ({
      keyCode,
      meta,
    }: {
      key: string
      keyCode: number
      meta: boolean
    }) => {
      switch (keyCode) {
        case 55:
          store.commandPressed = false
          break

        case 60: {
          store.shiftPressed = false
          break
        }

        default:
          break
      }
    },
    cleanUp: () => {
      keyDownListener?.remove()
      keyUpListener?.remove()
    },
  })

  keyDownListener = solNative.addListener('keyDown', store.keyDown)
  keyUpListener = solNative.addListener('keyUp', store.keyUp)

  return store
}
