import {Component, Injector, OnInit, OnDestroy} from "@angular/core";
import {Observable} from "rxjs";
import {ITransfer} from "../../../models/interfaces/transfer.interface";
import {TransferService} from "../../../services/transfer.service";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {SupplierService} from "../../../services/supplier.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";


@Component({
    selector: 'app-incoming-index',
    templateUrl: './incoming-index.component.html'
})
export class IncomingIndexComponent extends ObjectsIndexComponent<ITransfer> implements OnInit  {

    incomingTransferData: Array<Object>;

    supplierSelect2Options: Select2Options;
    supplierSelect2InitialValue: string[] = [];
    selectedSupplierIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    constructor(injector: Injector, private transferService: TransferService, private supplierService: SupplierService) {
        super(injector, transferService);
    }

    ngOnInit() {
        this.extraFilters.next({type: 'incoming'});
        super.ngOnInit();

        Observable.combineLatest(
            this.selectedSupplierIdSource,
            (supplierId) => {
                return {
                    supplierId: supplierId,
                    type: 'incoming' // Always incoming on this report
                };
            }
        ).subscribe(this.extraFilters);

        Observable.combineLatest(
            CommonAdapter(this.supplierService, 'id', supplier => `<div class="flex-row"><div class="flex-col-50 align-left">${supplier.name}</div><div class="flex-col-50 align-right">${supplier.licenseNumber}</div>`),
        ).toPromise()
            .then(([SupplierAdapter]) => {

                this.supplierSelect2Options = {
                    ajax: {},
                    placeholder: 'Supplier',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.supplierSelect2Options['dataAdapter'] = SupplierAdapter;
                this.supplierSelect2InitialValue = [];


            });

    }

    onRowClick(event, transfer) {
        if($(event.target).is('i')) {
            return;
        } else {
            this.viewTransfer(transfer);
        }
    }

    viewTransfer(transfer) {
        this.transferService.view(transfer, 'incoming');
    }

    listItems() {
        this.transferService.list('incoming');
    }

    export() {
        this.transferService.export( { supplierId: this.selectedSupplierId } ).then((url) => {
            var iframe = $("<iframe/>").attr({
                src: url.Location,
                style: "visibility:hidden;display:none"
            }).appendTo(".content");
        })
    }

    private _selectedSupplierId: string;
    get selectedSupplierId() {
        return this._selectedSupplierId;
    }
    set selectedSupplierId(newValue: string) {
        this._selectedSupplierId = newValue;
        this.selectedSupplierIdSource.next(newValue);
    }

}
