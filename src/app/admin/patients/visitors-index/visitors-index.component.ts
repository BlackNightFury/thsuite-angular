import {Component, Injector, OnInit, OnDestroy} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DateRange} from "../../../lib/date-range";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {ActivatedRoute, Router} from "@angular/router";
import {VisitorService} from "../../../services/visitor.service";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";
import {IVisitor} from "../../../models/interfaces/visitor.interface";
import {IUser} from "../../../models/interfaces/user.interface";
import {UserService} from "../../../services/user.service";
import {SortBy} from "../../../util/directives/sort-table-header.directive";

declare const $;

@Component({
    selector: 'app-visitor-index',
    templateUrl: './visitors-index.component.html',
    styleUrls: ['./visitors-index.component.css']
})
export class VisitorsIndexComponent extends ObjectsIndexComponent<IVisitor> implements OnInit, OnDestroy {
    user: IUser;

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    isAddEditVisitorModalShowing: boolean = false;
    isIdModalShowing: boolean = false;
    isCheckoutModalShowing: boolean = false;

    addEditVisitorModalShowingSubscription: Subscription;
    visitorIdModalShowingSubscription: Subscription;
    visitorCheckoutModalShowingSubscription: Subscription;

    constructor(injector: Injector, private visitorService: VisitorService, userService: UserService) {
        super(injector, visitorService);

        this.userService.userEmitted.subscribe(user => {
            this.user = user;
            
            if (!this.user.Permissions.canAccessVisitorDashboard) {
                this.visitorService.backToDash();
            }
        });

        this.dateRangeSource.subscribe((dateRange) => {
            this.extraFilters.next(dateRange);
        });
    }

    ngOnInit() {
        super.ngOnInit();

        this.sortByModel = new SortBy( 'clockIn', 'desc' );

        this.addEditVisitorModalShowingSubscription = this.visitorService.addEditVisitorModalShowing.subscribe(val => {
            this.isAddEditVisitorModalShowing = val;
        });

        this.visitorService.visitorIdModalShowing.subscribe(val => {
            this.isIdModalShowing = val;
        });

        this.visitorService.visitorCheckoutModalShowing.subscribe(val => {
            this.isCheckoutModalShowing = val;
        });
    }

    doSearch(keywords:string){
        this.search(keywords);
    }

    ngOnDestroy() {
        if(this.addEditVisitorModalShowingSubscription) {
            this.addEditVisitorModalShowingSubscription.unsubscribe();
        }

        if(this.visitorIdModalShowingSubscription) {
            this.visitorIdModalShowingSubscription.unsubscribe();
        }

        if(this.visitorCheckoutModalShowingSubscription) {
            this.visitorCheckoutModalShowingSubscription.unsubscribe();
        }
    }

    createNewVisitor() {
        var visitor = this.visitorService.newInstance();

        this.visitorService.showAddEditVisitorModal(visitor, "Visitor Dashboard");
    }

    listVisitors() {
        this.visitorService.list()
    }

    uploadId(visitor:IVisitor){
        this.visitorService.showVisitorIdModal(visitor, "Visitor Dashboard", "upload");
        document.documentElement.scrollTop = 0;
    }

    viewId(visitor:IVisitor){
        this.visitorService.showVisitorIdModal(visitor, "Visitor Dashboard", "view");
        document.documentElement.scrollTop = 0;
    }

    checkOut(visitor:IVisitor){
        this.visitorService.showVisitorCheckoutModal(visitor, "Visitor Dashboard");
        document.documentElement.scrollTop = 0;
    }
}
