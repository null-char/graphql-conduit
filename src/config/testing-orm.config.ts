import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const TestingOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'graphql_conduit_testing',
  entities: ['dist/**/*.entity{.ts,.js}', 'src/**/*.entity{.ts,.js}'],
  synchronize: true,
  dropSchema: true,
  logging: true,
};
