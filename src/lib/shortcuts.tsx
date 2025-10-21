import {Key} from 'components/Key'

export const validShortcutTokensRegex =
  /^(cmd|control|option|command|shift|return|space|right|left|up|down|[a-ú]|[0-9])$/

export const defaultShortcuts = {
  // 'option+space': 'sol'
  resize_fullscreen: 'control+option+return',
  lock: 'command+option+q',
  resize_right_half: 'control+option+right',
  resize_left_half: 'control+option+left',
  resize_top_half: 'control+option+up',
  resize_bottom_half: 'control+option+down',
  resize_top_left: 'control+option+u',
  resize_top_right: 'control+option+i',
  resize_bottom_left: 'control+option+j',
  resize_bottom_right: 'control+option+k',
  move_next_screen: 'control+option+command+right',
  move_previous_screen: 'control+option+command+left',
  scratchpad: 'command+shift+space',
  emoji_picker: 'command+control+space',
  clipboard_manager: 'command+option+v',
}

export function renderToKeys(shortcut: string) {
  return shortcut.split('+').map((word, i) => {
    let char = ''
    switch (word) {
      case 'control':
        char = '⌃'
        break
      case 'option':
        char = '⌥'
        break
      case 'cmd':
      case 'command':
        char = '⌘'
        break
      case 'shift':
        char = '⇧'
        break
      case 'return':
        char = '↩'
        break
      case 'space':
        char = '␣'
        break
      case 'right':
        char = '→'
        break
      case 'left':
        char = '←'
        break
      case 'up':
        char = '↑'
        break
      case 'down':
        char = '↓'
        break
      default:
        char = word
    }
    return (
      <Key key={char} title={''} symbol={char !== 'then' ? char : undefined} />
    )
  })
}
