// Configuração da API URL
// URL do backend hospedado no Render
const BACKEND_URL = 'https://caminhoneiros-backend.onrender.com';

// Usar sempre o backend hospedado
export const API_URL = BACKEND_URL;

console.log('API URL configurada:', API_URL);

// Função para construir URLs completas
export const getFullUrl = (path: string) => {
  // Remove barras iniciais duplicadas
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};

// Função para construir URLs de imagens
export const getImageUrl = (imageUrl: string) => {
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  return getFullUrl(imageUrl);
};