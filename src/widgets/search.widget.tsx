import React, {useEffect, useRef, useState} from 'react'
import {Animated, Image, ScrollView, Text, TextInput, View} from 'react-native'
import spotifyLogo from '../assets/spotify.png'
import figma from '../assets/figma.png'
import notion from '../assets/notion.png'
import googleTranslate from '../assets/google_translate.png'
import todo from '../assets/todo.png'
import {useDeviceContext} from 'twrnc'
import tw from 'tailwind'
import {useBoolean} from 'hooks'

export const SearchWidget = () => {
  useDeviceContext(tw)
  const [query, setQuery] = useState('')
  const [inputFocused, focusOn, focusOff] = useBoolean()
  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: inputFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [inputFocused])

  const borderColor = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(100, 100, 100, 1)', 'rgba(30, 92, 198,1)'],
  })

  return (
    <View
      style={tw`flex-1 border rounded-lg bg-light dark:bg-dark dark:border-gray-800`}>
      <View style={tw`px-3 py-2`}>
        <Animated.View
          style={tw.style(
            `px-3 py-2 border rounded`,
            // @ts-ignore
            {
              borderColor,
            },
          )}>
          <TextInput
            autoFocus
            // @ts-ignore
            enableFocusRing={false}
            placeholder="Type something..."
            value={query}
            onChangeText={setQuery}
            onFocus={focusOn}
            onBlur={focusOff}
          />
        </Animated.View>
      </View>
      {!!query && (
        <View style={{flex: 1, padding: 20}}>
          <View style={{flexDirection: 'row'}}>
            <View>
              <Text style={{fontWeight: '500'}}>Pipe to</Text>
              <View style={{flexDirection: 'row', paddingVertical: 10}}>
                <View
                  style={{
                    backgroundColor: 'rgb(240, 240, 240)',
                    padding: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    width: 120,
                    height: 40,
                    marginRight: 10,
                  }}>
                  <Image source={notion} style={{height: 20, width: 20}} />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: 'black',
                      paddingLeft: 10,
                    }}>
                    Notion
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#27282b',
                    padding: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#444',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    width: 120,
                    height: 40,
                    marginRight: 10,
                  }}>
                  <Image
                    source={googleTranslate}
                    style={{height: 20, width: 20}}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      paddingLeft: 10,
                      color: "#fff",
                    }}>
                    Translate
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#27282b',
                    padding: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#444',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    width: 120,
                    height: 40,
                    marginRight: 10,
                  }}>
                  <Image source={todo} style={{height: 20, width: 20}} />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      paddingLeft: 10,
                      color: "#fff",
                    }}>
                    MS Todo
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={{fontWeight: '500', paddingTop: 10}}>Results</Text>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
              paddingHorizontal: 10,
              marginTop: 10,
              backgroundColor: 'rgba(30,92,198,0.3)',
              borderRadius: 5,
            }}>
            <Image source={figma} style={{height: 20, width: 20}} />
            <Text style={{paddingLeft: 10}}>Figma</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
              paddingHorizontal: 10,
            }}>
            <Image source={spotifyLogo} style={{height: 20, width: 20}} />
            <Text style={{paddingLeft: 10}}>Spotify - Play next song</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
              paddingHorizontal: 10,
            }}>
            <Image source={spotifyLogo} style={{height: 20, width: 20}} />
            <Text style={{paddingLeft: 10}}>Spotify - Previous song</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
              paddingHorizontal: 10,
            }}>
            <Image source={spotifyLogo} style={{height: 20, width: 20}} />
            <Text style={{paddingLeft: 10}}>Spotify - Play/Pause</Text>
          </View>
        </View>
      )}
      {!query && (
        <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 10}}>
          <Text style={{fontSize: 12, fontWeight: '500', color: '#AAA'}}>
            Recent
          </Text>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
              paddingHorizontal: 10,
              marginTop: 10,
              backgroundColor: 'rgba(30,92,198,0.3)',
              borderRadius: 5,
            }}>
            <Image source={figma} style={{height: 20, width: 20}} />
            <Text style={{paddingLeft: 10}}>Figma</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
              paddingHorizontal: 10,
            }}>
            <Image source={spotifyLogo} style={{height: 20, width: 20}} />
            <Text style={{paddingLeft: 10}}>Spotify - Play next song</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
              paddingHorizontal: 10,
            }}>
            <Image source={spotifyLogo} style={{height: 20, width: 20}} />
            <Text style={{paddingLeft: 10}}>Spotify - Previous song</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
              paddingHorizontal: 10,
            }}>
            <Image source={spotifyLogo} style={{height: 20, width: 20}} />
            <Text style={{paddingLeft: 10}}>Spotify - Play/Pause</Text>
          </View>
        </ScrollView>
      )}
    </View>
  )
}
