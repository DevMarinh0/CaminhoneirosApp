import { createServer } from 'net';

/**
 * Verifica se uma porta está disponível
 * @param port Porta a ser verificada
 * @returns Promise que resolve para true se a porta estiver disponível, false caso contrário
 */
export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', () => {
      resolve(false); // Porta não está disponível
    });

    server.once('listening', () => {
      // Porta está disponível, fecha o servidor e resolve
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port);
  });
}

/**
 * Encontra uma porta disponível a partir de uma porta inicial
 * @param startPort Porta inicial para começar a verificação
 * @returns Promise que resolve para a primeira porta disponível encontrada
 */
export async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;

  while (!(await isPortAvailable(port))) {
    port++;
    if (port > startPort + 100) {
      // Evita loop infinito, limita a 100 tentativas
      throw new Error(`Não foi possível encontrar uma porta disponível após ${port - startPort} tentativas`);
    }
  }

  return port;
}