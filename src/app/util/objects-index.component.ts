import {Component, Injector, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {ICommon} from "../models/interfaces/common.interface";
import {SearchableService} from "../services/searchable.service";
import {SortBy} from "./directives/sort-table-header.directive";
import {UserService} from "../services/user.service";
import {IUser} from "../models/interfaces/user.interface";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {CommonService} from "../services/common.service";

export class ObjectsIndexComponent<T extends ICommon> implements OnInit {

    isShowingAddEdit: boolean = false;

    protected searchTerms = new BehaviorSubject<string>('');
    protected page = new BehaviorSubject<number>(0);
    protected sortBy = new BehaviorSubject<SortBy>(undefined);
    protected extraFilters = new BehaviorSubject<Object>({});

    objects: Observable<T[]>;
    numPages: number;

    isFirstSearch = true;

    _sortBy: SortBy;
    get sortByModel(): SortBy {
        return this._sortBy;
    }
    set sortByModel(value: SortBy) {
        this._sortBy = value;

        this.sortBy.next(value);
    }

    _page: number = 0;
    get pageModel(): number {
        return this._page;
    }
    set pageModel(value: number) {
        this._page = value;
        this.page.next(value);
    }

    user: IUser;

    protected router: Router;
    protected route: ActivatedRoute;
    protected userService: UserService;
    protected loadingBarService: SlimLoadingBarService;

    constructor(injector: Injector, protected objectService: (CommonService<T> & SearchableService<T>)) {

        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
        this.userService = injector.get(UserService);
        this.loadingBarService = injector.get(SlimLoadingBarService);

    }

    ngOnInit() {

        this.userService.userEmitted
            .subscribe(user => {
                this.user = user;
            });

        this.objects = Observable.combineLatest(
            this.searchTerms
                .debounceTime(300)
                .distinctUntilChanged(),

            this.page
                .distinctUntilChanged(),

            this.sortBy
                .distinctUntilChanged(),

            this.extraFilters.do(() => {

                if(!this.isFirstSearch){
                    this.pageModel = 0;
                }
            }),

            this.objectService.refreshEmitted
        )
            .do(() =>{
                this.loadingBarService.interval = 10;
                this.loadingBarService.start()
            })
            .switchMap(([term, page, sortBy, extraFilters]) => {
                return this.objectService.search(term, page, sortBy, extraFilters);
            })
            .switchMap(searchResult => {
                this.isFirstSearch = false;

                this.numPages = searchResult.totalPages;

                return searchResult.objects.length ? Observable.combineLatest(searchResult.objects) : Observable.of([])
            })
            .do(() => {
                this.loadingBarService.complete();
            });


        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .map(() => this.route.firstChild)
            .subscribe((childRoute) => {
                this.isShowingAddEdit = !!(childRoute && childRoute.component);
            });

        // this.objectService.refreshEmitted
        //     .subscribe(() => this.extraFilters.next(this.extraFilters.getValue()));
    }


    search(term: string) {
        this.pageModel = 0;
        this.searchTerms.next(term);
    }

    goToPage(page: number) {
        this.page.next(page);
    }
}
