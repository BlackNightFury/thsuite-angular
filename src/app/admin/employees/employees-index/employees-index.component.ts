import {Component, Injector, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {IUser} from "../../../models/interfaces/user.interface";
import {UserService} from "../../../services/user.service";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {ActivatedRoute, Router} from "@angular/router";
import {User} from "../../../models/user.model";
import {didSet} from "../../../lib/decorators/property/didSet";
import {PreviousRouteService} from '../../../services/previous-route.service';


export function didSetEmployeeToggle(newValue){
    this.employeeToggleSource.next(newValue);
}

@Component({
    selector: 'app-employees-index',
    templateUrl: './employees-index.component.html',
    styleUrls: ['./employees-index.component.css']
})
export class EmployeesIndexComponent extends ObjectsIndexComponent<IUser> implements OnInit {

    employeeToggleOptions: Array<Object> = [
        {
            label: 'All', value: 'all'
        },
        {
            label: 'Active', value: 'active'
        },
        {
            label: 'Inactive', value: 'inactive'
        }
    ];

    employeeToggleSource: BehaviorSubject<string> = new BehaviorSubject<string>('active');
    @didSet(didSetEmployeeToggle) employeeToggle: 'all' | 'active' | 'inactive';

    constructor(injector: Injector,
                userService: UserService,
                private previousRouteService: PreviousRouteService) {
        super(injector, userService);
    }

    ngOnInit() {
        var navigationFromChild = this.previousRouteService.previousUrlContains("admin/employees/employees-index");

        super.ngOnInit();

        this.employeeToggleSource.asObservable().subscribe(employeeToggle => {
            this.extraFilters.next({employeeToggle: employeeToggle});
            console.log(employeeToggle);
        });

        this.prepareSearch(navigationFromChild);
    }

    prepareSearch(rememberSearchPosition: boolean){
        if(!rememberSearchPosition) {
            this.employeeToggle = 'active';
        }
        this.employeeToggleSource.next(this.employeeToggle);
    }

    onRowClick(event, user: IUser) {
        if ($(event.target).is('i') || $(event.target).is('div')) {
            return;
        }

        this.viewEmployee(user);

        // if (this.user.Permissions.employeeManagement == 'edit'){
        //     this.editEmployee(user);
        // }
        // else{
        //     this.viewEmployee(user);
        // }
    }

    toggleActive(user: IUser, isChecked: boolean) {
        let newUser = new User(user);
        newUser.isActive = isChecked;

        this.userService.save(newUser);
    }

    async generateToken(userId: string){
        let response = await this.userService.generateToken(userId);
        if(response){
            this.userService.showTokenModal();
            this.userService.emitToken(response);
        }
    }

    search(term: string) {
        this.searchTerms.next(term);
    }

    goToPage(page: number) {
        this.page.next(page);
    }

    createNewEmployee() {
        this.userService.create();
    }

    editEmployee(user: IUser) {
        this.userService.edit(user);
    }

    viewEmployee(user: IUser) {
        this.userService.view(user);
    }

    listEmployees() {
        this.userService.list();
    }
}
