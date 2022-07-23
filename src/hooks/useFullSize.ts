import {solNative} from 'lib/SolNative'
import {useEffect} from 'react'

export function useFullSize() {
  useEffect(() => {
    solNative.setWindowHeight(500)
  }, [])
}
