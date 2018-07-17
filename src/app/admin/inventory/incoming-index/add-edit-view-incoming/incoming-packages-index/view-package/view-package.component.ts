import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {TransferService} from "../../../../../../services/transfer.service";
import {ITransfer} from "../../../../../../models/interfaces/transfer.interface";
import {IPackage} from "../../../../../../models/interfaces/package.interface";
import {PackageService} from "../../../../../../services/package.service";
import {Package} from "../../../../../../models/package.model";
import {DeliveryPackageService} from "../../../../../../services/delivery-package.service";
import {DeliveryPackage} from "../../../../../../models/delivery-package.model";
import {IDeliveryPackage} from "../../../../../../models/interfaces/delivery-package.interface";
import {trigger, state, style, animate, transition} from '@angular/animations';

@Component({
    selector: 'app-view-package',
    templateUrl: './view-package.component.html',
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})
export class ViewPackageComponent implements OnInit {

    transferObservable: Observable<ITransfer>;
    packageObservable: Observable<IDeliveryPackage>;

    transfer: ITransfer;
    _package: IDeliveryPackage;



    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private transferService: TransferService,
        private deliveryPackageService: DeliveryPackageService) {
    }

    ngOnInit() {

        this.transferObservable = this.route.parent.parent.params.map(params => params['id'])
            .switchMap((id: string) => {
                return this.transferService.get(id);
            });

        this.transferObservable.subscribe(transfer => {

            if(this.transfer) {
                //TODO dirty check
            }

            this.transfer = transfer;
        });

        this.packageObservable = Observable.combineLatest(this.route.params, this.route.data)
            .map(([params, data]) => {
                return params['id'];
            })
            .switchMap((id: string|undefined) => {
                return id ? this.deliveryPackageService.getAssociated(id) : Observable.of(this.deliveryPackageService.newInstance())
            });
        this.packageObservable.subscribe(_package => {

            if (this._package) {
                //TODO dirty check
            }

            this._package = new DeliveryPackage(_package);

        });
    }

    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active') {
            this.router.navigate(['../..'], {relativeTo: this.route});
        }
    }
}
