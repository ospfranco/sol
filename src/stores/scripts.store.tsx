
import { makeAutoObservable, runInAction } from 'mobx'
import { solNative } from 'lib/SolNative'
import { ItemType } from './ui.store'
import { IRootStore } from 'store'

const getScriptsPath = () => `/Users/${solNative.userName()}/.config/sol/scripts`

function parseScriptMetadata(content: string, fileName: string) {
  // Default values
  let name = fileName.replace(/\..*$/, '')
  let icon = '💻'

  // Try to extract metadata from comments
  const nameMatch = content.match(/^#\s*name:\s*(.+)$/im)
  if (nameMatch) name = nameMatch[1].trim()
  const iconMatch = content.match(/^#\s*icon:\s*(.+)$/im)
  if (iconMatch) icon = iconMatch[1].trim()

  return { name, icon }
}

export type ScriptsStore = ReturnType<typeof createScriptsStore>

export const createScriptsStore = (root: IRootStore) => {
  let folderWatcher: any
  const scriptsPath = getScriptsPath()

  const store = makeAutoObservable({
    scripts: [] as Item[],

    async loadScripts() {
      const files = solNative.ls(scriptsPath)
      const scriptItems: Item[] = []
      const allowedExtensions = [
        // '.sh', '.py', '.js', '.ts', '.rb', '.pl', '.command', '.applescript', '.scpt', '.zsh', '.bash'
        ".sh", ".applescript"
      ]
      for (const file of files) {
        const fullPath = `${scriptsPath}/${file}`
        // Only consider files with allowed script extensions
        if (!allowedExtensions.some(ext => file.endsWith(ext))) continue
        const content = solNative.readFile(fullPath)
        if (!content) continue
        const { name, icon } = parseScriptMetadata(content, file)
        scriptItems.push({
          id: `script-${file}`,
          name,
          icon,
          type: ItemType.USER_SCRIPT,
          callback: async () => {
            try {
              if (file.endsWith('.applescript')) {
                await solNative.executeAppleScript(content)
              } else {
                await solNative.executeBashScript(content)
              }

            } catch (e) {
              solNative.showToast(`Error executing script ${e}`, 'error')
            }
          }
        })
      }
      runInAction(() => {
        store.scripts = scriptItems
      })
    },
  })

  // Initial load
  store.loadScripts()

  // Watch for changes
  folderWatcher = solNative.createFolderWatcher(scriptsPath, () => {
    store.loadScripts()
  })

  return store
}
