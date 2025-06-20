export const API_URL = 'https://caminhoneirosapp.onrender.com';

export const ENDPOINTS = {
  CADASTROS: `${API_URL}/cadastros`,
  UPLOAD: `${API_URL}/upload`,
  PDF: `${API_URL}/pdf/cadastro`,
  PING: `${API_URL}/ping`,
};

export const CONFIG = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png'],
  PDF_FILENAME: 'cadastro.pdf',
};