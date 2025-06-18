import { Dimensions, Pressable, StyleSheet, Text } from 'react-native';

type BotaoProps = {
  texto: string;
  onPress: () => void;
};

export default function Botao({ texto, onPress }: BotaoProps) {
  return (
    <Pressable style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado]} onPress={onPress}>
      <Text style={styles.texto}>{texto}</Text>
    </Pressable>
  );
}

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const styles = StyleSheet.create({
  botao: {
    backgroundColor: '#023e8a', // azul escuro
    paddingVertical: isTablet ? 20 : 16,
    paddingHorizontal: isTablet ? 48 : 32,
    borderRadius: isTablet ? 20 : 16,
    marginVertical: isTablet ? 16 : 12,
    width: isTablet ? '60%' : '100%',
    elevation: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    alignSelf: 'center',
  },
  botaoPressionado: {
    backgroundColor: '#48cae4', // azul claro
    opacity: 0.85,
  },
  texto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isTablet ? 22 : 18,
    letterSpacing: 1,
  },
});