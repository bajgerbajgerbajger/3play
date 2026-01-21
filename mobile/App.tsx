import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

const WEB_APP_URL = process.env.EXPO_PUBLIC_WEB_APP_URL || 'https://3play.vercel.app'

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <WebView source={{ uri: WEB_APP_URL }} style={styles.webview} />
      <StatusBar style="light" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0D',
  },
  webview: {
    flex: 1,
  },
})
