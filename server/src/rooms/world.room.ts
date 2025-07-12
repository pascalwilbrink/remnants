import { Room, Client } from 'colyseus';
import Matter from 'matter-js';
import { Engine } from 'matter-js';
export class WorldRoom extends Room {

    private engine?: Matter.Engine;

    onCreate() {
        this.state = {
            players: {}
        };

        this.engine = Engine.create();

        this.setSimulationInterval(() => {
            Engine.update(this.engine!, 1000 / 60);
        });
    }

    onJoin(client: Client<any, any>, options?: any, auth?: any): void | Promise<any> {
        console.log(`Player joined: ${client.sessionId}`);
    }

    onLeave(client: Client<any, any>, consented?: boolean): void | Promise<any> {
        console.log(`Player left: ${client.sessionId}`);
    }


}