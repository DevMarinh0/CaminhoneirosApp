import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Botao from '../../components/Botao';
import { API_URL, getFullUrl } from '../../utils/config';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function CadastroMotorista() {
  const [nome, setNome] = useState('');
  const [transportadora, setTransportadora] = useState('');
  const [placa, setPlaca] = useState('');
  const [destino, setDestino] = useState('');
  const [fotos, setFotos] = useState<any[]>([]);
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  // Solicitar permissões ao carregar o componente
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
        }
      }
    })();
  }, []);

  const selecionarFotos = async () => {
    try {
      // Limitar a 6 fotos no total
      if (fotos.length >= 6) {
        Alert.alert('Limite de fotos', 'Você já selecionou o número máximo de 6 fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 6 - fotos.length,
      });

      if (!result.canceled && result.assets) {
        // Preparar as imagens para upload
        const novasFotos = result.assets.map(asset => ({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `${Date.now()}.jpg`,
        }));

        setFotos([...fotos, ...novasFotos]);
      }
    } catch (error) {
      console.error('Erro ao selecionar fotos:', error);
      Alert.alert('Erro', 'Não foi possível selecionar as fotos. Tente novamente.');
    }
  };

  const tirarFoto = async () => {
    try {
      // Limitar a 6 fotos no total
      if (fotos.length >= 6) {
        Alert.alert('Limite de fotos', 'Você já selecionado o número máximo de 6 fotos.');
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const novaFoto = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: `${Date.now()}.jpg`,
        };

        setFotos([...fotos, novaFoto]);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto. Tente novamente.');
    }
  };

  const removerFoto = (index: number) => {
    const novasFotos = [...fotos];
    novasFotos.splice(index, 1);
    setFotos(novasFotos);
  };

  const enviarFotos = async () => {
    try {
      console.log('Iniciando upload de fotos...');
      const formData = new FormData();
      
      fotos.forEach((foto, index) => {
        console.log(`Preparando upload: ${foto.name} (${foto.type})`);
        formData.append('fotos', {
          uri: foto.uri,
          type: foto.type || 'image/jpeg',
          name: foto.name || `foto${index}.jpg`,
        } as any);
      });

      const url = getFullUrl('/upload');
      console.log('Enviando para:', url);
      
      // Criar um controller para abortar a requisição após um tempo
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro no upload:', errorData);
        throw new Error(errorData.message || 'Erro ao enviar fotos');
      }

      const data = await response.json();
      console.log('Upload concluído:', data);
      return data.urls;
    } catch (error) {
      console.error('Erro no upload:', error);
      if (error.name === 'AbortError') {
        throw new Error('O upload demorou muito tempo e foi cancelado. Verifique sua conexão.');
      }
      throw error;
    }
  };

  const cadastrar = async () => {
    // Validar campos
    if (!nome || !transportadora || !placa || !destino) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    if (fotos.length === 0) {
      Alert.alert('Fotos obrigatórias', 'Por favor, adicione pelo menos uma foto.');
      return;
    }

    setEnviando(true);

    try {
      // 1. Enviar fotos primeiro
      const fotosUrls = await enviarFotos();

      // 2. Criar o cadastro com as URLs das fotos
      const dataCadastro = new Date().toLocaleDateString('pt-BR');
      
      const url = getFullUrl('/cadastros');
      console.log('Enviando cadastro para:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          transportadora,
          placa,
          destino,
          dataCadastro,
          fotos: fotosUrls,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar motorista');
      }

      Alert.alert(
        'Cadastro realizado',
        'Motorista cadastrado com sucesso!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Limpar formulário
              setNome('');
              setTransportadora('');
              setPlaca('');
              setDestino('');
              setFotos([]);
              
              // Voltar para a tela inicial
              router.push('/');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      Alert.alert('Erro', `Não foi possível realizar o cadastro: ${error.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
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
      <Ionicons name="person-add" size={isTablet ? 72 : 48} color="#023e8a" style={{ marginBottom: isTablet ? 20 : 10 }} />
      <Text style={styles.titulo}>Cadastro de Motorista</Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>Nome do Motorista</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Digite o nome completo"
          placeholderTextColor="#888"
        />
        
        <Text style={styles.label}>Transportadora</Text>
        <TextInput
          style={styles.input}
          value={transportadora}
          onChangeText={setTransportadora}
          placeholder="Nome da transportadora"
          placeholderTextColor="#888"
        />
        
        <Text style={styles.label}>Placa do Cavalo</Text>
        <TextInput
          style={styles.input}
          value={placa}
          onChangeText={setPlaca}
          placeholder="Ex: ABC1234"
          placeholderTextColor="#888"
          autoCapitalize="characters"
        />
        
        <Text style={styles.label}>Destino</Text>
        <TextInput
          style={styles.input}
          value={destino}
          onChangeText={setDestino}
          placeholder="Cidade/Estado de destino"
          placeholderTextColor="#888"
        />
        
        <Text style={styles.label}>Fotos (máx. 6)</Text>
        <View style={styles.botoesContainer}>
          <Pressable
            onPress={selecionarFotos}
            style={({ pressed }) => [
              styles.botaoFoto,
              pressed && styles.botaoFotoAtivo
            ]}
            disabled={enviando}
          >
            <Ionicons name="images" size={isTablet ? 28 : 22} color="#fff" />
            <Text style={styles.textoBotaoFoto}>Galeria</Text>
          </Pressable>
          
          <Pressable
            onPress={tirarFoto}
            style={({ pressed }) => [
              styles.botaoFoto,
              pressed && styles.botaoFotoAtivo
            ]}
            disabled={enviando}
          >
            <Ionicons name="camera" size={isTablet ? 28 : 22} color="#fff" />
            <Text style={styles.textoBotaoFoto}>Câmera</Text>
          </Pressable>
        </View>
        
        {fotos.length > 0 && (
          <View style={styles.fotosContainer}>
            {fotos.map((foto, index) => (
              <View key={index} style={styles.fotoContainer}>
                <Image source={{ uri: foto.uri }} style={styles.fotoPreview} />
                <Pressable
                  onPress={() => removerFoto(index)}
                  style={styles.botaoRemover}
                  disabled={enviando}
                >
                  <Ionicons name="close-circle" size={24} color="#ff3b30" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
        
        <Text style={styles.infoText}>API URL: {API_URL}</Text>
        
        <Botao
          texto="Cadastrar Motorista"
          onPress={cadastrar}
          loading={enviando}
          disabled={enviando}
        />
      </View>
    </ScrollView>
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
  titulo: {
    fontSize: isTablet ? 36 : 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: isTablet ? 32 : 24,
    textAlign: 'center',
    width: isTablet ? '80%' : '100%',
  },
  formContainer: {
    width: '100%',
    maxWidth: isTablet ? 600 : undefined,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: isTablet ? 32 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#023e8a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: isTablet ? 16 : 12,
    fontSize: isTablet ? 18 : 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  botaoFoto: {
    backgroundColor: '#023e8a',
    borderRadius: 8,
    padding: isTablet ? 16 : 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
  },
  botaoFotoAtivo: {
    backgroundColor: '#01579b',
  },
  textoBotaoFoto: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fotosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  fotoContainer: {
    position: 'relative',
    width: isTablet ? '30%' : '45%',
    aspectRatio: 1,
    margin: '2%',
  },
  fotoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  botaoRemover: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 0,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  }
});