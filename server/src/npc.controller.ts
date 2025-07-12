import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/npc')
export class NpcController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): { message: string } {
    return {
        message: this.appService.getHello()
    };
  }
}
