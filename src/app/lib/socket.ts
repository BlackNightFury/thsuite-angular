import {Injectable} from "@angular/core";

import * as io from "socket.io-client";
import {environment} from "../../environments/environment";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

declare const $: any;

export class Socket {

    constructor(private socket: io.Socket) {

    }

    emitPromise(...any): Promise<any> {
        const args = [].slice.call(arguments);

        return new Promise((resolve, reject) => {

            args.push(function (data) {
                if (data.success) {
                    resolve(data.data);
                }
                else {
                    reject(data.error);
                }
            });

            this.socket.emit.apply(this.socket, args)
        })
    }

    on(event, handler) {
        this.socket.on(event, handler);
    }
}

@Injectable()
export class SocketService {

    private socketConnectedSource: BehaviorSubject<boolean> = new BehaviorSubject(false);
    socketConnectedEmitted: Observable<boolean> = this.socketConnectedSource.asObservable();

    constructor() {
    }

    private isFirstSocket: boolean = true;
    getSocket(name: string): io.Socket {
        let socket = new Socket(io(`${environment.apiUrl}/${name}`, {transports: ['websocket']}));

        if(this.isFirstSocket) {
            this.isFirstSocket = false;

            socket.on('connect', () => {
                this.socketConnectedSource.next(true);
            });
            socket.on('disconnect', (reason) => {
                $.notify(`Lost connection to server`, "error", {
                    autoHide: false
                });
                this.socketConnectedSource.next(false);
            });
            socket.on('reconnect', (reason) => {
                $.notify(`Regained connection to server`, "success", {
                    autoHide: false
                });
            });
            socket.on('connect_error', function() {
                $.notify(`Unable to connect to server`, "error");
            });
            socket.on('pong', latency => {
                // console.log("Pong with latency: " + latency);

                if(latency > 500) {
                    $.notify('Slow connection to server', 'warning');
                }
            })
        }

        return socket;
    }
}
