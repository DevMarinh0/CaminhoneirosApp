# Caminhoneiros Backend

Backend para o aplicativo de gerenciamento de caminhoneiros.

## Autor

- **Bruno Marinho** - [GitHub](https://github.com/DevMarinh0)

## Tecnologias

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL (Neon)
- Cloudinary

## Desenvolvimento Local

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env`
4. Execute o servidor de desenvolvimento:
   ```
   npm run dev
   ```

## Deploy no Render

O backend está hospedado no Render.com. Para atualizar o deploy:

1. Faça push das alterações para o repositório GitHub
2. O Render detectará automaticamente as alterações e fará o deploy

### Variáveis de Ambiente no Render

As seguintes variáveis de ambiente devem ser configuradas no Render:

- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL (Neon)
- `CLOUDINARY_CLOUD_NAME`: Nome da cloud no Cloudinary
- `CLOUDINARY_API_KEY`: Chave de API do Cloudinary
- `CLOUDINARY_API_SECRET`: Secret da API do Cloudinary
- `NODE_ENV`: Deve ser configurado como `production`

### Manter o Servidor Ativo

No plano gratuito do Render, o servidor hiberna após 15 minutos de inatividade. Para manter o servidor ativo, você pode:

1. Usar um serviço como UptimeRobot para fazer ping no endpoint `/ping` a cada 10 minutos
2. Configurar um cron job para fazer ping regularmente

## Banco de Dados

O banco de dados PostgreSQL está hospedado no Neon. Para acessar o painel de controle:

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Faça login com suas credenciais
3. Selecione o projeto "neondb"

## Armazenamento de Imagens

As imagens são armazenadas no Cloudinary. Para acessar o painel de controle:

1. Acesse [cloudinary.com](https://cloudinary.com)
2. Faça login com suas credenciais

## Contato

- **GitHub**: [Bruno Marinho Souza](https://github.com/DevMarinh0)
- **LinkedIn**: [Bruno Marinho](https://www.linkedin.com/in/bruno-marinho-souza-dev/)