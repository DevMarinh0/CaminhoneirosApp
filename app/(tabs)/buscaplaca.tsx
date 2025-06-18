import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { getFullUrl, getImageUrl } from '../../utils/config';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function BuscaPlaca() {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function buscar() {
    if (!busca.trim()) return;
    setCarregando(true);
    try {
      const resp = await fetch(getFullUrl(`/cadastros/busca?query=${encodeURIComponent(busca)}`));
      if (!resp.ok) throw new Error('Erro na busca');
      const data = await resp.json();
      setResultados(data);
    } catch {
      setResultados([]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <Modal
        visible={!!fotoSelecionada}
        transparent
        animationType="fade"
        onRequestClose={() => setFotoSelecionada(null)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalBackground} onPress={() => setFotoSelecionada(null)} />
          <View style={styles.modalContent}>
            {fotoSelecionada && (
              <Image source={{ uri: fotoSelecionada }} style={styles.fotoGrande} resizeMode="contain" />
            )}
            <Pressable onPress={() => setFotoSelecionada(null)}>
              <Text style={styles.fechar}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}>
        <View style={styles.voltarContainer}>
          <Pressable
            onPress={() => router.push('/')}
            style={({ pressed }) => [
              styles.botaoCircular,
              pressed && styles.botaoCircularAtivo
            ]}
          >
            <Ionicons name="arrow-back" size={isTablet ? 36 : 28} color="#023e8a" />
          </Pressable>
        </View>
        <Ionicons name="search" size={isTablet ? 72 : 48} color="#023e8a" style={{ marginBottom: isTablet ? 20 : 10 }} />
        <Text style={styles.titulo}>Buscar por Nome ou Placa</Text>
        <TextInput
          placeholder="Digite nome ou placa"
          style={styles.input}
          value={busca}
          onChangeText={setBusca}
          onSubmitEditing={buscar}
          placeholderTextColor="#888"
        />
        <View style={styles.botaoContainer}>
          <Button title={carregando ? 'Buscando...' : 'Buscar'} color="#023e8a" onPress={buscar} disabled={carregando} />
        </View>
        {resultados.length === 0 && !carregando ? (
          <Text style={styles.nenhum}>Nenhum resultado encontrado.</Text>
        ) : null}
        {resultados.map((cadastro, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.cardTitulo}>{cadastro.nome}</Text>
            <Text style={styles.cardInfo}>Placa: {cadastro.placa}</Text>
            <Text style={styles.cardInfo}>Transportadora: {cadastro.transportadora}</Text>
            <Text style={styles.cardInfo}>Destino: {cadastro.destino}</Text>
            <Text style={styles.cardInfo}>Data: {cadastro.dataCadastro}</Text>
            <ScrollView horizontal style={styles.fotosContainer}>
              {cadastro.fotos?.map((foto: any, i: number) => (
                <Pressable
                  key={i}
                  onPress={() =>
                    setFotoSelecionada(getImageUrl(foto.url))
                  }
                >
                  <Image source={{ uri: getImageUrl(foto.url) }} style={styles.foto} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#78BBFF',
    flexGrow: 1,
    minHeight: '100%',
    paddingBottom: 50, // Adiciona espaço extra no final para dispositivos menores
  },
  voltarContainer: {
    width: isTablet ? '70%' : '100%',
    alignItems: 'flex-start',
    marginBottom: 10,
    marginTop: 50,
  },
  titulo: {
    fontSize: isTablet ? 36 : 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: isTablet ? 32 : 24,
    textAlign: 'center',
    width: isTablet ? '80%' : '100%',
  },
  input: {
    width: isTablet ? '70%' : '100%',
    padding: isTablet ? 18 : 14,
    borderWidth: 1,
    borderColor: '#90e0ef',
    borderRadius: isTablet ? 14 : 10,
    marginBottom: isTablet ? 24 : 16,
    backgroundColor: '#fff',
    fontSize: isTablet ? 20 : 16,
    color: '#023e8a',
  },
  botaoContainer: {
    width: isTablet ? '70%' : '100%',
    marginBottom: 16
  },
  nenhum: { color: '#fff', marginTop: 20, fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    width: isTablet ? 600 : '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitulo: {
    fontWeight: 'bold',
    fontSize: isTablet ? 24 : 18,
    marginBottom: isTablet ? 10 : 6,
    color: '#023e8a'
  },
  cardInfo: {
    fontSize: isTablet ? 20 : 16,
    color: '#023e8a',
    marginBottom: isTablet ? 4 : 2
  },
  fotosContainer: { flexDirection: 'row', marginTop: 8 },
  foto: { width: isTablet ? 100 : 60, height: isTablet ? 100 : 60, marginRight: 8, borderRadius: 8, borderWidth: 1, borderColor: '#023e8a' },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    maxWidth: '90%',
    maxHeight: '80%',
  },
  fotoGrande: {
    width: isTablet ? 500 : 300,
    height: isTablet ? 500 : 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  fechar: {
    color: '#023e8a',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 8,
  },
  botaoCircular: {
    width: isTablet ? 60 : 48,
    height: isTablet ? 60 : 48,
    borderRadius: isTablet ? 30 : 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  botaoCircularAtivo: {
    backgroundColor: '#90e0ef',
  },
});