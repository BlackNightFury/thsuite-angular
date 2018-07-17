import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";

import {DrawerService} from "../../services/drawer.service";
import {DrawerLogService} from "../../services/drawer-log.service";
import {UserService} from "../../services/user.service";

import {IDrawer} from "../../models/interfaces/drawer.interface";
import {IUser} from "../../models/interfaces/user.interface";
import {PrinterService} from "../../services/printer.service";
import {environment} from "../../../environments/environment";
declare const $: any;

type CurrencyNote = {value: number; total: number};

@Component({
    selector: 'app-pos-drawer-end-modal',
    templateUrl: './pos-drawer-end-modal.component.html',
})
export class PosDrawerEndModalComponent implements OnInit, AfterViewInit{

    drawer: IDrawer;
    user: IUser;

    coinList: Array<string> = [ 'pennies', 'nickles', 'dimes', 'quarters' ];
    noteList: Array<string> = [ 'singles', 'fives', 'tens', 'twenties', 'fifties', 'hundreds' ];

    mode: string;

    meta: Object = {
        pennies: { value: .01, total: 0 },
        nickles: { value: .05, total: 0 },
        dimes: { value: .10, total: 0 },
        quarters: { value: .25, total: 0 },
        singles: { value: 1, total: 0 },
        fives: { value: 5, total: 0 },
        tens: { value: 10, total: 0 },
        twenties: { value: 20, total: 0 },
        fifties: { value: 50, total: 0 },
        hundreds: { value: 100, total: 0 }
    };

    //This should be set to the drawer ending amount only when the drawer is actually closed
    endingAmount: number;

    constructor(private element: ElementRef, private drawerService: DrawerService, private userService: UserService, private drawerLogService: DrawerLogService, private printerService: PrinterService){
        this.userService.userEmitted
            .subscribe(user => {
                this.user = user;
                this.drawerService.drawerForEnd.subscribe(drawer => {
                    this.drawer = drawer;
                })
            })
    }

    ngOnInit(){
        this.mode = environment.drawerCloseMode;
    }

    ngAfterViewInit(){

        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "End Drawer",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 600,
                width: 800,
                height: 600,
                classes: {
                    "ui-dialog": "drawer-modal"
                },
                buttons: [
                    {
                        text: "End Drawer",
                        "class": 'btn secondary green',
                        click: () => {
                            this.drawer.closedAt = new Date();
                            this.drawer.closedByUserId = this.user.id;
                            this.drawer.closedByUser = this.user;
                            this.drawer.endingAmount = this.endingAmount;
                            if( this.drawer.endingAmount < 0 ) return;

                            this.drawerService.update(this.drawer)
                            .then( () => {
                                const drawerLog = this.drawerLogService.newInstance();
                                drawerLog.drawerId = this.drawer.id;
                                drawerLog.event = `Drawer ended by ${this.user.firstName} ${this.user.lastName}`;
                                return this.drawerLogService.insert(drawerLog).then( () => {
                                    if( !this.drawer.Log ) this.drawer.Log = [ ];
                                    this.drawer.Log.push(drawerLog);
                                    $dialog.dialog('close');
                                    this.drawerService.afterClose();
                                    return Promise.resolve()
                                } )
                            })
                            .catch( e => { console.log(e.stack || e) } )
                        }
                    }
                ],
                beforeClose: (evt, ui) => {
                    this.drawerService.hideDrawerEndModal();
                },
                create: function (event, ui) {
                    $(event.target).parent().css('position', 'fixed');
                }
            })

    }

    updateTotals(input: any) {
        const key = input.id;

        let amount = parseInt( input.value );

        let currentTotal = this.meta[key].value * amount;

        if( Number.isNaN( currentTotal ) || amount < 0 ) currentTotal = 0;

        this.meta[key].total = currentTotal;

        this.endingAmount = Object.keys( this.meta ).reduce( ( memo, metaKey ) => memo + this.meta[metaKey].total, 0 )

    }
}
