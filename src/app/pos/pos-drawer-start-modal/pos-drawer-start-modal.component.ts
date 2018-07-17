import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {DrawerService} from "../../services/drawer.service";
import {IDrawer} from "../../models/interfaces/drawer.interface";
import {UserService} from "../../services/user.service";
import {StoreService} from "../../services/store.service";

import {environment} from "../../../environments/environment";



declare const $: any;

type CurrencyNote = {value: number; total: number};

@Component({
    selector: 'app-pos-drawer-start-modal',
    templateUrl: './pos-drawer-start-modal.component.html',
})
export class PosDrawerStartModalComponent implements OnInit, AfterViewInit{

    mode: string = environment.drawerOpenMode;

    drawer: IDrawer;

    coinList: Array<string> = [ 'pennies', 'nickles', 'dimes', 'quarters' ];
    noteList: Array<string> = [ 'singles', 'fives', 'tens', 'twenties', 'fifties', 'hundreds' ];

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

    //This should only be set to the drawer starting amount when the drawer is actually started
    startingAmount: number;

    constructor(private element: ElementRef, private drawerService: DrawerService,
                private userService: UserService, private storeService: StoreService){
        this.userService.userEmitted
            .subscribe(user => {
                this.drawerService.drawerForStart.subscribe(drawer => {
                    this.drawer = drawer;
                    this.drawer.userId = user.id;
                    this.drawer.User = user
                })
            })
    }

    ngOnInit(){
    }

    ngAfterViewInit(){

        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Start Drawer",
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
                        text: "Start Drawer",
                        "class": 'btn secondary green',
                        click: () => {
                            this.drawer.startingAmount = this.startingAmount;
                            if( this.drawer.startingAmount <= 0 ) return;

                            this.storeService.currentStoreEmitted.subscribe( store => {
                                if (store && store.settings.drawerAmountForAlert &&
                                    this.drawer.startingAmount > store.settings.drawerAmountForAlert){
                                    console.log("Starting Amount above Drawer Limit");
                                    this.drawerService.settingDrawerLimitCheck(true);
                                }
                            } );

                            this.drawerService.insert(this.drawer)
                            .then( () => {
                                $dialog.dialog('close');
                                this.drawerService.hideDrawerStartModal();
                                return Promise.resolve()
                            } )
                            .catch( console.log )
                        }
                    }
                ],
                beforeClose: (evt, ui) => {
                    this.drawerService.hideDrawerStartModal();
                }
            })

    }

    updateTotals(input: any) {
        const key = input.id;

        let amount = parseInt( input.value );

        let currentTotal = this.meta[key].value * amount;

        if( Number.isNaN( currentTotal ) || amount < 0 ) currentTotal = 0;

        this.meta[key].total = currentTotal;

        this.startingAmount = Object.keys( this.meta ).reduce( ( memo, metaKey ) => memo + this.meta[metaKey].total, 0 );

    }

    updateNotesForCloser(value: string) {
        this.drawer.notesForCloser = value;
    }
}
