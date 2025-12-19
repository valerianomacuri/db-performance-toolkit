import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Order } from './entities/Order';
import { Product } from './entities/Product';
import { OrderItem } from './entities/OrderItem';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true, // solo para dev, en prod usar migrations
  logging: true,
  entities: [User, Order, Product, OrderItem],
  migrations: ['src/migrations/*.ts'],
});
