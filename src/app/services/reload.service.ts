import {Injectable, Injector} from "@angular/core";
import {Socket, SocketService} from "app/lib/socket";
@Injectable()
export class ReloadService{
    private namespace: string = 'reload';
    protected socket: Socket;

    constructor(injector: Injector){
        this.socket = injector.get(SocketService).getSocket(this.namespace);
        this.initializeSocket();
    }

    private initializeSocket(){
        console.log("Initializing reload service socket");
        this.socket.on('refresh', () => {
            console.log("Received refresh!");
            window.location.reload();
        });
    }
}
