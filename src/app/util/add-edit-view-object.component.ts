import {Component, Injector, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Observable} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {ICommon} from "../models/interfaces/common.interface";
import {CommonService} from "../services/common.service";
import {IUser} from "../models/interfaces/user.interface";
import {UserService} from "../services/user.service";
import {Subscription} from "rxjs/Subscription";


export class AddEditViewObjectComponent<T extends ICommon> implements OnInit, OnDestroy {


    mode: 'add'|'edit'|'view' = 'add';

    objectObservable: Observable<T>;
    objectSubscription: Subscription;

    object: T;

    user: IUser;

    protected router: Router;
    protected route: ActivatedRoute;
    protected userService: UserService;

    constructor(injector: Injector, private objectService: CommonService<T>) {
        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
        this.userService = injector.get(UserService);
    }

    ngOnInit() {

        this.userService.userEmitted
            .subscribe(user => {
                this.user = user;
            });

        this.objectObservable = Observable.combineLatest(this.route.params, this.route.data)
            .map(([params, data]) => {
                this.mode = data.mode;

                return params['id'];
            })
            .switchMap((id: string|undefined) => {
                return id ? this.objectService.getAssociated(id) : Observable.of(this.objectService.newInstance());
            });


        this.objectSubscription = this.objectObservable.subscribe(object => {

            if (this.object) {
                //TODO dirty check
            }

            this.object = this.objectService.dbInstance(object)
        });

    }

    ngOnDestroy(): void {

    }
}
