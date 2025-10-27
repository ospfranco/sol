import { MMKV } from 'react-native-mmkv'
import { solNative } from '../lib/SolNative'

const newStoragePath = `/Users/${solNative.userName()}/.config/sol`
const scriptsPath = `/Users/${solNative.userName()}/.config/sol/scripts`
const oldStoragePath = `/Users/${solNative.userName()}/Documents/mmkv`

// Ensure new directory exists
const ensureDirectory = () => {
  const exists = solNative.exists(newStoragePath)
  if (!exists) {
    try {
      solNative.mkdir(newStoragePath)
    } catch (e) {
      console.error(e)
    }
  }

  const scriptsDirExists = solNative.exists(scriptsPath)
  if (!scriptsDirExists) {
    solNative.mkdir(scriptsPath)
  }
}

// Migrate data if old storage exists and new storage is empty
const migrateStorage = () => {
  const oldExists = solNative.exists(oldStoragePath)

  if (oldExists) {
    try {
      // Check if new storage already has data
      const newFiles = solNative.ls(newStoragePath)
      const hasNewData = newFiles.some(file => file.includes('mmkv.default'))

      if (!hasNewData) {
        // Copy both MMKV files from old to new location
        solNative.cp(
          `${oldStoragePath}/mmkv.default`,
          `${newStoragePath}/mmkv.default`
        )
        solNative.cp(
          `${oldStoragePath}/mmkv.default.crc`,
          `${newStoragePath}/mmkv.default.crc`
        )

        // Delete old storage files after successful migration
        try {
          solNative.del(`${oldStoragePath}/mmkv.default`)
          solNative.del(`${oldStoragePath}/mmkv.default.crc`)
        } catch (deleteError) {
          console.error('Failed to delete old storage files:', deleteError)
        }
      }
    } catch (error) {
      console.error('Failed to migrate storage:', error)
    }
  }
}

// Run migration synchronously before creating storage
ensureDirectory()
migrateStorage()

export const storage = new MMKV({
  id: 'mmkv.default',
  path: newStoragePath,
})
