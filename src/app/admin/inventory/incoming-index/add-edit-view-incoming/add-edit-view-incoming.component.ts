import {Component, Injector, OnInit} from "@angular/core";
import {ITransfer} from "../../../../models/interfaces/transfer.interface";
import {TransferService} from "app/services/transfer.service";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {trigger, state, style, animate, transition} from '@angular/animations';

@Component({
    selector: 'app-add-edit-view-incoming',
    templateUrl: './add-edit-view-incoming.component.html',
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})

export class AddEditViewIncomingComponent extends AddEditViewObjectComponent<ITransfer> implements OnInit {

    get packagesShowing() {
        return !!this.route.firstChild;
    }

    constructor(injector: Injector, private transferService: TransferService,) {
        super(injector, transferService);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    togglePackages() {
        if(!this.packagesShowing) {
            this.router.navigate(['packages'], {relativeTo: this.route});
        }
        else {
            this.router.navigate(['..'], {relativeTo: this.route.firstChild});
        }
    }

    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active') {
            this.transferService.cancelEdit('incoming');
        }
    }
}
