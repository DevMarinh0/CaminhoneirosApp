import { Redirect } from 'expo-router';

export default function Index() {
  // Redireciona para a tela principal
  return <Redirect href="/(tabs)" />;
}