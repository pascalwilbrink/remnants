import { NestFactory } from '@nestjs/core';

import { Server } from 'colyseus';
import { createServer } from 'http';

import { AppModule } from './app.module';

import { WorldRoom } from './rooms/world.room';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const httpServer = createServer(app.getHttpAdapter().getInstance());

  const gameServer = new Server({
      server: httpServer
  });

  gameServer.define('world', WorldRoom);

  gameServer.listen(2567);

  await app.listen(3010);
}
bootstrap();

