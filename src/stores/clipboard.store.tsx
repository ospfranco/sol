import {solNative} from 'lib/SolNative'
import {makeAutoObservable, runInAction, toJS} from 'mobx'
import {EmitterSubscription} from 'react-native'
import {IRootStore} from 'Store'

type ClipboardTextItem = {
  preview: string
  fileExtension: string
  hash: string
  size: number
  timesCopied: number
  lastCopied: Date
}

type ClipboardItem = ClipboardTextItem // | ClipboardImageItem

type SavedItemMeta = {
  fileExtension: string
  hash: string
  size: number
  timesCopied: number
  lastCopied: Date
}

let copyEventListener: EmitterSubscription | undefined

// TODO: Get the app contents directory
const clipboardDirectory = '~/tmp/clipboard'

// TODO: Either use RNFS or implement these functions
async function getDirectories(dir: string): Promise<string[]> {
  return solNative.getDirectories(clipboardDirectory)
}

async function readFile(filePath: string): Promise<string> {
  return solNative.readFile(filePath)
}

async function writeFile(filePath: string, contents: string) {
  return solNative.writeFile(filePath, contents)
}

async function makeDirectoryIfNotExists(dir: string) {
  return solNative.makeDirectoryIfNotExists(dir)
}

export let createClipboardStore = (root: IRootStore) => {
  let hydrate = async () => {
    // Iterate through each folder in the clipboard directory
    // In each subdirectory there will be two files: meta.json and data.{fileExtension}
    // Load the meta.json first and then load the data file
    // Construct the ClipboardItem and add it to the `clipboardEntries` array
    // Then sort the entries by lastCopied
    const directories = await getDirectories(clipboardDirectory)
    const optionalClipboardEntries = await Promise.all(
      directories.map(async directory => {
        try {
          const metaFile = await readFile(`${directory}/meta.json`)
          const meta = JSON.parse(metaFile) as SavedItemMeta
          const dataFile = await readFile(
            `${directory}/data.${meta.fileExtension}`,
          )
          const item: ClipboardItem = {preview: dataFile, ...meta}
          return item
        } catch (e) {
          console.error('Failed to parse directory', e, directory)
        }
      }),
    )
    const clipboardEntries = optionalClipboardEntries.filter(isNotNil)

    // Sort the entries by lastCopied
    clipboardEntries.sort(
      (a, b) => b.lastCopied.valueOf() - a.lastCopied.valueOf(),
    )

    runInAction(() => {
      store.clipboardItems = new Map(
        clipboardEntries.map(item => [item.hash, item]),
      )
    })
  }

  let store = makeAutoObservable({
    /** Indexed by hash of contents */
    clipboardItems: new Map<string, ClipboardItem>(),
    onCopy: async (event: {hash: string; contents: string}) => {
      let item = store.clipboardItems.get(event.hash)
      if (item) {
        // Item already copied
        item.timesCopied++
        item.lastCopied = new Date()
        await saveItemMeta(item)
      } else {
        // New item
        item = {
          preview: event.contents.slice(0, 500),
          fileExtension: 'txt',
          hash: event.hash,
          size: event.contents.length,
          timesCopied: 1,
          lastCopied: new Date(),
        }
        await saveItem(item, event.contents)
      }

      runInAction(() => {
        store.clipboardItems.set(event.hash, item!)
      })
    },
  })

  hydrate()

  copyEventListener = solNative.addListener('copy', store.onCopy)

  return store
}

async function saveItem(item: ClipboardItem, contents: string) {
  const directory = `${clipboardDirectory}/${item.hash}`
  // Make the directory if it doesn't exist
  await makeDirectoryIfNotExists(directory)
  // Save the meta.json
  await writeFile(`${directory}/meta.json`, JSON.stringify(item))
  // Save the data file
  await writeFile(`${directory}/data.${item.fileExtension}`, contents)
}

async function saveItemMeta(item: ClipboardItem) {
  const directory = `${clipboardDirectory}/${item.hash}`
  // Save the meta.json
  await writeFile(`${directory}/meta.json`, JSON.stringify(item))
}

function isNotNil<T>(value: T): value is Exclude<T, null | undefined> {
  return value !== null && value !== undefined
}
