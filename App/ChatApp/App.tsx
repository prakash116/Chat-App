import React from 'react'
import { Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Home from './src/Screens/Home'


function App() {
  return (
    <SafeAreaProvider>
      <Home/>
    </SafeAreaProvider>
  )
}

export default App
