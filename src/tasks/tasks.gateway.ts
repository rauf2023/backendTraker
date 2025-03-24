import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Task } from './entities/task.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TasksGateway {
  @WebSocketServer()
  server: Server;

  emitTaskCreated(task: Task) {
    this.server.emit('taskCreated', task);
  }

  emitTaskUpdated(task: Task) {
    this.server.emit('taskUpdated', task);
  }
}
