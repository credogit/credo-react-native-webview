import React, { useEffect } from 'react'
import CredoRNWebviewModule, { Counter } from 'credo-react-native-webview'

const App = () => {
  useEffect(() => {
    console.log(CredoRNWebviewModule)
  })

  return <Counter />
}

export default App
