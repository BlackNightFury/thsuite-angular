import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {ITransfer} from "../../../../../models/interfaces/transfer.interface";
import {TransferService} from "app/services/transfer.service";
import {IPackage} from "../../../../../models/interfaces/package.interface";
import {PackageService} from "../../../../../services/package.service";
import {IDelivery} from "../../../../../models/interfaces/delivery.interface";
import {trigger, state, style, animate, transition} from '@angular/animations';

@Component({
    selector: 'app-incoming-packages-index',
    templateUrl: './outgoing-packages-index.component.html',
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})
export class OutgoingPackagesIndexComponent implements OnInit {

    transferObservable: Observable<ITransfer>;

    transfer: ITransfer;

    packages: IPackage[];

    deliveries: IDelivery[];

    constructor(private router: Router, private route: ActivatedRoute, private transferService: TransferService, private packageService: PackageService) {
    }

    ngOnInit() {

        this.transferObservable = this.route.parent.params
            .map((params) => params['id'])
            .switchMap((id: string) => {
                return this.transferService.getAssociated(id);
            });

        this.transferObservable.subscribe(transfer => {

            if(this.transfer) {
                //TODO dirty check
            }

            this.transfer = transfer;
            this.transferService.packagesForTransfer(this.transfer, 'outgoing')
                .then(transfers => {
                    let transfer = transfers[0]; //Will only ever be a single transfer
                    this.deliveries = transfer.Deliveries;
                }).catch(err => {
                console.log(err);
            });
        })
    }

    viewPackage(_package: IPackage) {
        this.router.navigate(['view', _package.id], {relativeTo: this.route});
    }

    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active') {
            this.router.navigate(['..'], {relativeTo: this.route})
        }
    }
}
