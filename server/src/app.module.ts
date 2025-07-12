import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NpcController } from './npc.controller';

@Module({
  imports: [],
  controllers: [AppController, NpcController],
  providers: [AppService],
})
export class AppModule {}
