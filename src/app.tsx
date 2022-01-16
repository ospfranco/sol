import React from 'react'
import {Image, ScrollView, Text, TextInput, View} from 'react-native'
import spotifyLogo from './assets/spotify.png'
import figma from './assets/figma.png'

export const App = () => {
  return (
    <View style={{flex: 1, backgroundColor: '#1f2023'}}>
      <View
        style={{
          paddingVertical: 15,
          paddingHorizontal: 20,
          borderColor: '#444',
          borderBottomWidth: 1,
          width: '100%',
        }}>
        <TextInput
          autoFocus
          // @ts-ignore
          enableFocusRing={false}
          placeholder="Search for something..."
        />
      </View>
      <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 20}}>
        <View style={{flexDirection: 'row'}}>
          <View>
            <Text style={{fontWeight: '500'}}>Favorites</Text>
            <View style={{flexDirection: 'row', paddingVertical: 10}}>
              <View
                style={{
                  backgroundColor: '#27282b',
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#444',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 90,
                  height: 90,
                  marginRight: 10,
                }}>
                <Image source={spotifyLogo} style={{height: 40, width: 40}} />
                <Text style={{paddingTop: 10, fontSize: 12, fontWeight: '600'}}>
                  Spotify
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
                  width: 90,
                  height: 90,
                  marginRight: 10,
                }}>
                <Image source={figma} style={{height: 40, width: 40}} />
                <Text style={{paddingTop: 10, fontSize: 12, fontWeight: '600'}}>
                  Figma
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
                  width: 90,
                  height: 90,
                  marginRight: 10,
                }}>
                <Image source={figma} style={{height: 40, width: 40}} />
                <Text style={{paddingTop: 10, fontSize: 12, fontWeight: '600'}}>
                  Figma
                </Text>
              </View>
            </View>
          </View>

          <View style={{marginLeft: 20}}>
            <Text style={{fontWeight: '500'}}>Calendar</Text>
            <View style={{flexDirection: 'row', paddingVertical: 10}}>
              <View
                style={{
                  backgroundColor: '#27282b',
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(255,171,128,0.5)',
                  width: 200,
                  height: 90,
                  marginRight: 10,
                }}>
                <Text style={{fontSize: 12, fontWeight: '600'}}>
                  C-Levels Monthly
                </Text>
                <Text style={{fontSize: 12}}>In 20 Mins.</Text>
                <View style={{flex: 1}} />
                <Text style={{fontSize: 12, fontWeight: '600'}}>Join →</Text>
              </View>
            </View>
          </View>

          <View style={{marginLeft: 20}}>
            <Text style={{fontWeight: '500'}}>Weather</Text>
            <View style={{flexDirection: 'row', paddingVertical: 10}}>
              <View
                style={{
                  backgroundColor: '#27282b',
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#444',
                  width: 180,
                  height: 90,
                  marginRight: 10,
                }}>
                <Text style={{fontSize: 16, fontWeight: '600'}}>20 ℃</Text>
                <Text style={{fontSize: 12, color: '#ccc'}}>
                  80% Chance of rain
                </Text>
                <View style={{flex: 1}} />
                <Text style={{fontSize: 12}}>Munich</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={{fontWeight: '500', paddingTop: 10}}>Recent</Text>
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 10,
            paddingHorizontal: 10,
            marginTop: 10,
            backgroundColor: '#333',
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
    </View>
  )
}
