import {FUSE_OPTIONS} from 'config'
import Fuse from 'fuse.js'
import {solNative} from 'lib/SolNative'
import {makeAutoObservable} from 'mobx'
import {IRootStore} from 'store'

export type Process = {
  id: number
  pid: number
  cpu: number
  mem: number
  type: 'prefPane' | 'app' | 'binary'
  path: string
  processName: string
}

export type ProcessesStore = ReturnType<typeof createProcessesStore>

export const createProcessesStore = (root: IRootStore) => {
  let store = makeAutoObservable({
    //    ____  _                              _     _
    //   / __ \| |                            | |   | |
    //  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
    //  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
    //  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
    //   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/
    processes: [] as Process[],

    //    _____                            _           _
    //   / ____|                          | |         | |
    //  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
    //  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
    //  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
    //   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
    //                        | |
    //                        |_|
    get filteredProcesses() {
      if (!root.ui.query) return store.processes

      let results = new Fuse(store.processes, {
        ...FUSE_OPTIONS,
        keys: [{name: 'path', weight: 1}],
        // sortFn: (a, b) => {
        //   return a.item['mem'] - b.item['mem']
        // },
      })
        .search(root.ui.query)
        .map(r => r.item)

      return results
    },

    //                _   _
    //      /\       | | (_)
    //     /  \   ___| |_ _  ___  _ __  ___
    //    / /\ \ / __| __| |/ _ \| '_ \/ __|
    //   / ____ \ (__| |_| | (_) | | | \__ \
    //  /_/    \_\___|\__|_|\___/|_| |_|___/
    fetchProcesses: () => {
      const processesString = solNative.ps()

      const processes = processesString
        .split('\n')
        .map(line => {
          const defaultValue = ['', '', '', '', '', '']
          const regex = /(\d+)\s+(\d+)\s+(\d+[.|,]\d+)\s+(\d+)\s+(.*)/
          const [, id, pid, cpu, mem, path] = line.match(regex) ?? defaultValue
          const processName = path.match(/[^/]*[^/]*$/i)?.[0] ?? ''
          const isPrefPane = path.includes('.prefPane')
          const isApp = path.includes('.app/')

          return {
            id: parseInt(id),
            pid: parseInt(pid),
            cpu: parseFloat(cpu),
            mem: parseInt(mem),
            type: isPrefPane ? 'prefPane' : isApp ? 'app' : 'binary',
            path,
            processName,
          } as Process
        })
        .filter(process => process.processName !== '')
        .sort((a, b) => {
          if (a.cpu != null && b.cpu != null) {
            return b.cpu - a.cpu
          } else {
            return 0
          }
        })

      store.processes = processes
    },
  })

  return store
}
