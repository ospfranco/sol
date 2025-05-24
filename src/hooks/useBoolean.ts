import {useState} from 'react'

export function useBoolean(
  initialValue: boolean = false,
): [boolean, () => void, () => void] {
  const [val, setVal] = useState(initialValue)
  const toTrue = () => {
    setVal(true)
    return true
  }
  const toFalse = () => {
    setVal(false)
    return true
  }

  return [val, toTrue, toFalse]
}
