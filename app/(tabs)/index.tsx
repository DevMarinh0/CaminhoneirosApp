import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text } from 'react-native';
import Botao from '../../components/Botao';

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
      scrollEventThrottle={16}>
      <StatusBar barStyle="light-content" backgroundColor="#023e8a" />
      <Ionicons name="home" size={isTablet ? 72 : 48} color="#023e8a" style={{ marginBottom: isTablet ? 20 : 10 }} />
      <Text style={styles.titulo}>Caminhoneiros App</Text>
      <Text style={styles.subtitulo}>Escolha uma opção:</Text>
      <Botao texto="Buscar por Placa" onPress={() => router.push('/buscaplaca')} />
      <Botao texto="Cadastrar Motorista" onPress={() => router.push('/cadastromotorista')} />
      <Botao texto="Listar Motorista" onPress={() => router.push('/listacadastro')} />
    </ScrollView>
  );
}

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    minHeight: height,
    backgroundColor: '#78BBFF', // azul bem claro
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? 40 : 24,
    paddingTop: isTablet ? 60 : 40,
  },
  titulo: {
    fontSize: isTablet ? 48 : 32,
    fontWeight: 'bold',
    color: '#032E64', // azul escuro
    marginBottom: isTablet ? 16 : 10,
    textAlign: 'center',
    width: isTablet ? '80%' : '100%',
  },
  subtitulo: {
    fontSize: isTablet ? 24 : 18,
    color: '#032E64', // azul claro
    marginBottom: isTablet ? 40 : 30,
    textAlign: 'center',
    width: isTablet ? '80%' : '100%',
  },
});