import clsx from 'clsx'
import {BackButton} from 'components/BackButton'
import {Dropdown} from 'components/Dropdown'
import {Input} from 'components/Input'
import {LoadingBar} from 'components/LoadingBar'
import {useFullSize} from 'hooks/useFullSize'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef, useState} from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import {Widget} from 'stores/ui.store'

interface Props {
  style?: ViewStyle
  className?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

interface ChatGPTModel {
  label: string
  value: string
}

const CHATGPT_MODELS: ChatGPTModel[] = [
  {label: 'gpt-4o', value: 'gpt-4o'},
  //   {label: 'GPT-4', value: 'gpt-4'},
  //   {label: 'GPT-4 Turbo', value: 'gpt-4-turbo'},
]

export const ChatGPTWidget: FC<Props> = observer(({style}) => {
  const store = useStore()
  const messages = store.ui.openAIMessages
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>(
    CHATGPT_MODELS[0].value,
  )
  const scrollViewRef = useRef<ScrollView>(null)

  const sendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    }

    store.ui.sendOpenAIMessage(userMessage)
  }

  const clearChat = () => {
    // setMessages([])
  }

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <View className="flex-1" style={style}>
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-lightBorder dark:border-darkBorder">
        <View className="flex-row items-center">
          <BackButton
            onPress={() => store.ui.focusWidget(Widget.SEARCH)}
            className="mr-2"
          />
          <Text className="text-lg font-medium">ChatGPT</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-sm">Model:</Text>
          <Dropdown
            value={selectedModel}
            className="w-64"
            onValueChange={v => {}}
            options={CHATGPT_MODELS}
          />
          <TouchableOpacity
            onPress={clearChat}
            className="ml-2 px-3 py-1 rounded border border-lightBorder dark:border-darkBorder">
            <Text className="text-sm text-blue-500">Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && <LoadingBar />}

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-2"
        contentContainerClassName="pb-4"
        showsVerticalScrollIndicator={true}>
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            {!!store.ui.openAIKey ? (
              <Text className="text-neutral-500 dark:text-neutral-400">
                Send a message to start chatting with ChatGPT
              </Text>
            ) : (
              <Text className="text-neutral-500 dark:text-neutral-400">
                Please set up your OpenAI API key in the settings to use ChatGPT
              </Text>
            )}
          </View>
        ) : (
          messages.map(message => (
            <View
              key={message.id}
              className={clsx('mb-4 rounded-lg p-3 max-w-[80%]', {
                'bg-accent self-end': message.role === 'user',
                'bg-subBgLight dark:bg-subBgDark self-start':
                  message.role === 'assistant',
              })}>
              <Text className="text-sm mb-1">
                {message.role === 'user' ? 'You' : 'ChatGPT'}
                <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                  {' • '}
                  {formatTimestamp(message.timestamp)}
                </Text>
              </Text>
              <Text className="text-sm" selectable>
                {message.content}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <View className="px-4 py-3 border-t border-lightBorder dark:border-darkBorder">
        <View className="flex-row items-center">
          <Input
            className="flex-1 mr-2"
            bordered
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            autoFocus
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={inputText.trim() === '' || isLoading}
            className={clsx('px-4 py-2 rounded-lg', {
              'bg-blue-500': inputText.trim() !== '',
              'bg-neutral-300 dark:bg-neutral-600':
                inputText.trim() === '' || isLoading,
            })}>
            <Text
              className={clsx('font-medium', {
                'text-white': inputText.trim() !== '',
                'text-neutral-500 dark:text-neutral-400':
                  inputText.trim() === '' || isLoading,
              })}>
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
})
