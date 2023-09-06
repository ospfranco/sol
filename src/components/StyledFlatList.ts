import {styled} from 'nativewind'
import {FlatList} from 'react-native'

export const StyledFlatList = styled(FlatList, {
  props: {
    contentContainerStyle: true,
  },
})
