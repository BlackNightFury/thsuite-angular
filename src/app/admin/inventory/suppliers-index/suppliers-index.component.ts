import {Component, Injector, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {ISupplier} from "../../../models/interfaces/supplier.interface";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {SupplierService} from "../../../services/supplier.service";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../services/user.service";

@Component({
    selector: 'app-suppliers-index',
    templateUrl: './suppliers-index.component.html'
})
export class SuppliersIndexComponent extends ObjectsIndexComponent<ISupplier> implements OnInit {


    constructor(injector: Injector, private supplierService: SupplierService) {
        super(injector, supplierService)
    }

    ngOnInit() {
        super.ngOnInit();

    }

    onRowClick(event, supplier: ISupplier){
        if ($(event.target).is('i')) {
            return;
        }
        this.viewSupplier(supplier);

        // if (this.user.Permissions.inventoryManagement == 'edit' && this.user.Permissions.canEditSuppliers){
        //     this.editSupplier(supplier);
        // }
        // else{
        //     this.viewSupplier(supplier);
        // }
    }


    search(term: string) {
        this.searchTerms.next(term);
    }

    createNewSupplier() {
        this.supplierService.create();
    }

    editSupplier(supplier: ISupplier) {
        this.supplierService.edit(supplier);
    }

    viewSupplier(supplier: ISupplier) {
        this.supplierService.view(supplier);
    }

    listSuppliers() {
        this.supplierService.list()
    }
}
