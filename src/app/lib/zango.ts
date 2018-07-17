import {Injectable} from "@angular/core";

import * as io from "socket.io-client";
import {environment} from "../../environments/environment";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

import * as zango from "zangodb";


@Injectable()
export class ZangoService {

    private db: zango.Db;

    constructor() {

        this.db = new zango.Db('cache', 1, {
            adjustments: ['id'],
            'purchase-orders': ['id'],
            'adjustment-logs': ['id'],
            alerts: ['id'],
            barcodes: ['id'],
            caregivers: ['id'],
            deliveries: ['id'],
            "delivery-packages": ['id'],
            devices: ['id'],
            "device-proxy": ['id'],
            discounts: ['id'],
            drawers: ['id'],
            "drawer-logs": ['id'],
            "email-settings": ['id'],
            items: ['id'],
            "line-items": ['id'],
            "loyalty-rewards": ['id'],
            packages: ['id'],
            "package-price-adjustments": ['id'],
            "package-unused-labels": ['id'],
            "receipt-adjustments": ['id'],
            patients: ['id'],
            "patient-groups": ['id'],
            "patient-queue": ['id'],
            permissions: ['id'],
            "pos-devices": ['id'],
            "pricing-tiers": ['id'],
            "pricing-tier-weights": ['id'],
            printers: ['id'],
            products: ['id'],
            "product-types": ['id'],
            "product-variations": ['id'],
            "physicians": ['id'],
            receipts: ['id'],
            scales: ['id'],
            "store-oversale-limits": ['id'],
            "patient-oversale-limits": ['id'],
            "store-settings": ['id'],
            stores: ['id'],
            suppliers: ['id'],
            tags: ['id'],
            taxes: ['id'],
            "time-clocks": ['id'],
            transactions: ['id'],
            "transaction-taxes": ['id'],
            transfers: ['id'],
            users: ['id'],
            "saved-carts": ['id'],
            "visitors": ['id'],
            heartbeats: ['namespace']
        })


    }

    getCollection(name: string) {
        return this.db.collection(name);
    }



    updateHeartbeatFor(namespace) {

    }

    getHeartbeatFor(namespace) {

    }

}
