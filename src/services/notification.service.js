// Servicio para notificar cambios en tiempo real
import { EventEmitter } from 'events';

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Set();
  }

  // Agregar un cliente SSE
  addClient(res) {
    this.clients.add(res);
    console.log(`Cliente SSE agregado. Total: ${this.clients.size}`);
    
    // Configurar conexión SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Enviar mensaje inicial
    res.write('data: {"type": "connected"}\n\n');

    // Limpiar cliente cuando se desconecta
    res.on('close', () => {
      this.clients.delete(res);
      console.log(`Cliente SSE desconectado. Total: ${this.clients.size}`);
    });
  }

  // Notificar cambio en asistencias
  notifyAsistenciaChange(subalmacenId, fecha, action = 'update') {
    const message = {
      type: 'asistencia_change',
      subalmacen_id: subalmacenId,
      fecha: fecha,
      action: action,
      timestamp: new Date().toISOString()
    };

    console.log('Notificando cambio en asistencias:', message);

    // Enviar a todos los clientes conectados
    this.clients.forEach(client => {
      try {
        client.write(`data: ${JSON.stringify(message)}\n\n`);
      } catch (error) {
        console.error('Error enviando notificación:', error);
        this.clients.delete(client);
      }
    });
  }
}

export default new NotificationService();
