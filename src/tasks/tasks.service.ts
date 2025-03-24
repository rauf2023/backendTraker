import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksGateway } from './tasks.gateway';
import { User } from '../users/entities/user.entity';
import { TaskStatus } from '../types';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private tasksGateway: TasksGateway,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      createdBy: user,
    });

    const savedTask = await this.taskRepository.save(task);
    this.tasksGateway.emitTaskCreated(savedTask);
    return savedTask;
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      relations: ['createdBy', 'assignedTo'],
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['createdBy', 'assignedTo'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    const updatedTask = await this.taskRepository.save({
      ...task,
      ...updateTaskDto,
    });

    this.tasksGateway.emitTaskUpdated(updatedTask);
    return updatedTask;
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.findOne(id);
    task.status = status;
    const updatedTask = await this.taskRepository.save(task);
    this.tasksGateway.emitTaskUpdated(updatedTask);
    return updatedTask;
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }
}
