const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando processo de build do APK...');

// Verificar se o diretório android existe
if (!fs.existsSync(path.join(__dirname, '..', 'android'))) {
  console.log('📁 Diretório android não encontrado. Executando expo prebuild...');
  execSync('npx expo prebuild --platform android', { stdio: 'inherit' });
}

// Navegar para o diretório android e executar o build
try {
  console.log('🔨 Executando build do APK...');
  process.chdir(path.join(__dirname, '..', 'android'));
  execSync('./gradlew assembleRelease', { stdio: 'inherit' });
  
  const apkPath = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  
  if (fs.existsSync(apkPath)) {
    console.log(`✅ Build concluído com sucesso! APK disponível em: ${apkPath}`);
  } else {
    console.error('❌ APK não encontrado no caminho esperado.');
  }
} catch (error) {
  console.error('❌ Erro durante o build:', error);
  process.exit(1);
}