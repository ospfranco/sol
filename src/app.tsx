import React, {useState} from 'react'
import {Image, ScrollView, Text, TextInput, View} from 'react-native'
import spotifyLogo from './assets/spotify.png'
import figma from './assets/figma.png'
import notion from './assets/notion.png'
import googleTranslate from './assets/google_translate.png'
import todo from './assets/todo.png'
import {CalendarWidget} from 'widgets/calendar.widget'

export const App = () => {
  const [query, setQuery] = useState('')
  return (
    <View style={{flex: 1}}>
      <View
        style={{
          backgroundColor: 'rgba(39, 40, 43, 0.98)',
          borderRadius: 10,
          borderWidth: 1,
          marginBottom: 10,
          borderColor: '#666',
          flex: 1,
        }}>
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
            placeholder="Type something..."
            value={query}
            onChangeText={setQuery}
          />
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

      <View style={{flexDirection: 'row'}}>
        <View
          style={{
            backgroundColor: 'rgba(39, 40, 43, 0.98)',
            padding: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#444',
            marginRight: 10,
            flex: 1,
          }}>
          <Text style={{fontSize: 12, fontWeight: '500', color: '#AAA'}}>
            Todos
          </Text>
          <View style={{paddingVertical: 5}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 3,
                  height: 15,
                  width: 15,
                  borderColor: '#444',
                  marginVertical: 5,
                }}
              />
              <Text style={{marginLeft: 10}}>Do the important thing</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 3,
                  height: 15,
                  width: 15,
                  borderColor: '#444',
                  marginVertical: 5,
                }}
              />
              <Text style={{marginLeft: 10}}>Take clothes to laundry</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 3,
                  height: 15,
                  width: 15,
                  borderColor: '#444',
                  marginVertical: 5,
                }}
              />
              <Text style={{marginLeft: 10}}>
                Renovate expired certificates
              </Text>
            </View>
          </View>
        </View>

        <CalendarWidget />

        <View
          style={{
            backgroundColor: 'rgba(39, 40, 43, 0.98)',
            padding: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#444',
            width: 180,
          }}>
          <Text style={{fontSize: 12, fontWeight: '500', color: '#AAA'}}>
            Weather
          </Text>

          <Text style={{fontSize: 16, fontWeight: '600', paddingTop: 10}}>
            20 ℃
          </Text>
          <Text style={{fontSize: 12, color: '#ccc'}}>80% Chance of rain</Text>
          <View style={{flex: 1}} />
          <Text style={{fontSize: 12, textAlign: 'right'}}>Munich</Text>
        </View>
      </View>
      <View
        style={{
          backgroundColor: 'rgba(39, 40, 43, 0.98)',
          padding: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#444',
          width: '100%',
          marginTop: 10,
        }}>
        <Text style={{fontSize: 12, fontWeight: '500', color: '#AAA'}}>
          Favorites
        </Text>
        <View style={{flexDirection: 'row', paddingVertical: 10}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 20,
            }}>
            <Image source={spotifyLogo} style={{height: 20, width: 20}} />
            <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
              Spotify
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 20,
            }}>
            <Image source={notion} style={{height: 20, width: 20}} />
            <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
              Notion
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 20,
            }}>
            <Image source={todo} style={{height: 20, width: 20}} />
            <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
              MS Todo
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 20,
            }}>
            <Image source={figma} style={{height: 20, width: 20}} />
            <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
              Figma
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 20,
            }}>
            <Image source={googleTranslate} style={{height: 20, width: 20}} />
            <Text style={{marginLeft: 10, fontSize: 12, fontWeight: '600'}}>
              Translate
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
