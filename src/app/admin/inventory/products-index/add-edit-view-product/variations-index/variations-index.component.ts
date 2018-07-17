import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {IProduct} from "../../../../../models/interfaces/product.interface";
import {Observable} from "rxjs/Observable";
import {ProductService} from "../../../../../services/product.service";
import {Product} from "../../../../../models/product.model";
import {IItem} from "../../../../../models/interfaces/item.interface";
import {IProductVariation} from "../../../../../models/interfaces/product-variation.interface";
import {IUser} from "../../../../../models/interfaces/user.interface";
import {UserService} from "../../../../../services/user.service";
import {trigger, state, style, animate, transition} from '@angular/animations';

class ItemWithProportion {
    constructor(public item: IItem, public proportion: number) {}
}


@Component({
    selector: 'app-variations-index',
    templateUrl: './variations-index.component.html',
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})
export class VariationsIndexComponent implements OnInit {

    productObservable: Observable<IProduct>;

    user: IUser;

    product: IProduct;
    productVariations: IProductVariation[];

    constructor(private router: Router, private route: ActivatedRoute, private productService: ProductService, private userService: UserService) {
    }

    ngOnInit() {

        this.userService.userEmitted
            .subscribe(user => {
                this.user = user;
            });

        this.productObservable = this.route.parent.params.map(params => params['id'])
            .switchMap((id: string) => {
                return this.productService.getAssociated(id);
            });


        this.productObservable.subscribe(product => {

            if (this.product) {
                //TODO dirty check
            }

            this.product = new Product(product);
            this.productVariations = this.product.ProductVariations
        });
    }


    onRowClick(event, productVariation: IProductVariation){
        if ($(event.target).is('i')) {
            return;
        }

        this.viewVariation(productVariation);
    }

    
    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active') {
            this.router.navigate(['..'], {relativeTo: this.route});
        }
    }

    createNewProductVariation() {
        this.router.navigate(['add'], {relativeTo: this.route});
    }

    editVariation(variation: IProductVariation) {
        this.router.navigate(['edit', variation.id], {relativeTo: this.route});
    }

    viewVariation(variation: IProductVariation){
        this.router.navigate(['view', variation.id], {relativeTo: this.route});
    }
}
