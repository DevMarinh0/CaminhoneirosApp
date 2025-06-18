import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_URL, getFullUrl } from '../../utils/config';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function ListaCadastro() {
  const [cadastros, setCadastros] = useState<any[]>([]);
  const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [conectado, setConectado] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  // Verificar conectividade de rede
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setConectado(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const buscarCadastros = async () => {
    try {
      if (!conectado) {
        console.log('Sem conexão com a internet');
        return;
      }

      setErro(null);
      const url = getFullUrl('/cadastros');
      console.log('Tentando buscar cadastros de:', url);

      // Criar um controller para abortar a requisição após um tempo
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Cadastros recebidos:', data.length);
      setCadastros(data);
    } catch (error) {
      console.error('Erro ao buscar cadastros:', error);
      setErro('Falha ao conectar com o servidor. Verifique se o servidor está rodando e acessível.');
      setCadastros([]);
    }
  };

  useEffect(() => {
    buscarCadastros();
    const interval = setInterval(buscarCadastros, 5000); // Reduzido para 5 segundos
    return () => clearInterval(interval);
  }, [conectado]);

  const excluirCadastro = async (id: number) => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir este cadastro? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setCarregando(true);
            try {
              const response = await fetch(getFullUrl(`/cadastros/${id}`), {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Erro ao excluir cadastro');
              }

              Alert.alert("Sucesso", "Cadastro excluído com sucesso!");
              buscarCadastros(); // Atualiza a lista
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert("Erro", "Não foi possível excluir o cadastro. Tente novamente.");
            } finally {
              setCarregando(false);
            }
          }
        }
      ]
    );
  };

  // Função para obter a URL correta da imagem
  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url; // URL do Cloudinary ou outra URL completa
    }
    return `${API_URL}${url}`; // URL local
  };

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
        <Ionicons name="list" size={isTablet ? 72 : 48} color="#023e8a" style={{ marginBottom: isTablet ? 20 : 10 }} />
        <Text style={styles.titulo}>Todos os Cadastros</Text>

        {!conectado && (
          <View style={styles.erroContainer}>
            <Ionicons name="wifi-off" size={24} color="#fff" />
            <Text style={styles.erroTexto}>Sem conexão com a internet</Text>
          </View>
        )}

        {erro && conectado && (
          <View style={styles.erroContainer}>
            <Ionicons name="alert-circle" size={24} color="#fff" />
            <Text style={styles.erroTexto}>{erro}</Text>
            <Pressable
              style={styles.botaoReconectar}
              onPress={buscarCadastros}
            >
              <Text style={styles.textoReconectar}>Tentar novamente</Text>
            </Pressable>
            <Text style={styles.erroTexto}>API URL: {API_URL}</Text>
          </View>
        )}

        {cadastros.length === 0 && !erro && (
          <Text style={styles.info}>Nenhum cadastro encontrado</Text>
        )}

        {cadastros.map((c, idx) => (
          <View key={idx} style={styles.card}>
            {/* Cabeçalho do card com botão de excluir */}
            <View style={styles.cardHeader}>
              <Text style={styles.nome}>{c.nome}</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.botaoExcluir,
                  pressed && styles.botaoExcluirAtivo
                ]}
                onPress={() => excluirCadastro(c.id)}
                disabled={carregando}
              >
                <Ionicons name="trash-outline" size={isTablet ? 24 : 20} color="#fff" />
              </Pressable>
            </View>

            <Text style={styles.info}>Transportadora: {c.transportadora}</Text>
            <Text style={styles.info}>Placa do Cavalo: {c.placa}</Text>
            <Text style={styles.info}>Destino: {c.destino}</Text>
            <Text style={styles.info}>Data do Cadastro: {c.dataCadastro}</Text>
            <View style={styles.fotosContainer}>
              {c.fotos.map((foto: any, i: number) => (
                <Pressable
                  key={i}
                  onPress={() => setFotoSelecionada(getImageUrl(foto.url))}
                >
                  <Image
                    source={{ uri: getImageUrl(foto.url) }}
                    style={styles.foto}
                  />
                </Pressable>
              ))}
            </View>
            <View style={styles.botaoContainer}>
              <Pressable
                style={({ pressed }) => [styles.botaoPDF, pressed && styles.botaoPDFAtivo]}
                onPress={async () => {
                  const url = getFullUrl(`/pdf/${c.id}`);
                  if (Platform.OS === 'web') {
                    window.open(url, '_blank');
                  } else {
                    try {
                      Alert.alert(
                        "Download iniciado",
                        "O PDF está sendo baixado, aguarde um momento..."
                      );

                      // Usar o diretório de cache que é acessível para compartilhamento
                      const fileUri = FileSystem.cacheDirectory + `cadastro_${c.id}.pdf`;

                      // Baixar o arquivo
                      await FileSystem.downloadAsync(url, fileUri);
                      console.log('Arquivo baixado para:', fileUri);

                      // Verificar se o compartilhamento está disponível
                      const isAvailable = await Sharing.isAvailableAsync();

                      if (isAvailable) {
                        // Compartilhar o arquivo (permite salvar em Downloads)
                        await Sharing.shareAsync(fileUri, {
                          mimeType: 'application/pdf',
                          dialogTitle: `Cadastro ${c.id}`,
                          UTI: 'com.adobe.pdf' // para iOS
                        });
                      } else {
                        // Fallback para dispositivos que não suportam compartilhamento
                        Alert.alert(
                          "Visualizar PDF",
                          "O PDF foi baixado, mas não é possível compartilhá-lo neste dispositivo.",
                          [
                            {
                              text: "OK",
                              onPress: () => Linking.openURL(url)
                            }
                          ]
                        );
                      }
                    } catch (error) {
                      console.error('Erro ao processar o PDF:', error);
                      Alert.alert(
                        "Erro",
                        "Ocorreu um erro ao processar o PDF. Tentando método alternativo...",
                        [
                          {
                            text: "OK",
                            onPress: () => Linking.openURL(url)
                          }
                        ]
                      );
                    }
                  }
                }}
              >
                <Ionicons name="document" size={isTablet ? 28 : 22} color="#fff" />
                <Text style={styles.textoBotaoPDF}>Gerar PDF</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#78BBFF',
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: 50, // Adiciona espaço extra no final para dispositivos menores
  },
  voltarContainer: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 40,
  },
  titulo: {
    fontSize: isTablet ? 36 : 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: isTablet ? 32 : 24,
    textAlign: 'center',
    width: isTablet ? '80%' : '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: isTablet ? 24 : 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nome: {
    fontSize: isTablet ? 24 : 18,
    fontWeight: 'bold',
    color: '#023e8a',
    flex: 1,
  },
  info: {
    fontSize: isTablet ? 18 : 16,
    marginBottom: 8,
    color: '#333',
  },
  fotosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 16,
  },
  foto: {
    width: isTablet ? 120 : 80,
    height: isTablet ? 120 : 80,
    borderRadius: 8,
    margin: 4,
  },
  botaoContainer: {
    alignItems: 'center',
  },
  botaoPDF: {
    backgroundColor: '#c1121f',
    borderRadius: 8,
    paddingVertical: isTablet ? 12 : 8,
    paddingHorizontal: isTablet ? 24 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoPDFAtivo: {
    backgroundColor: '#01579b',
  },
  textoBotaoPDF: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  botaoExcluir: {
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    padding: 8,
  },
  botaoExcluirAtivo: {
    backgroundColor: '#d63030',
  },
  botaoCircular: {
    width: isTablet ? 60 : 48,
    height: isTablet ? 60 : 48,
    borderRadius: isTablet ? 30 : 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  botaoCircularAtivo: {
    backgroundColor: '#e6e6e6',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxWidth: 500,
    alignItems: 'center',
  },
  fotoGrande: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  fechar: {
    color: '#023e8a',
    fontSize: 18,
    fontWeight: '600',
    padding: 8,
  },
  erroContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
  },
  erroTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  botaoReconectar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  textoReconectar: {
    color: '#ff3b30',
    fontWeight: '600',
  }
});