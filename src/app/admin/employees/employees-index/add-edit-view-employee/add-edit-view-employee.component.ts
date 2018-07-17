import {Component, Injector, OnDestroy, OnInit, ElementRef, ViewChild} from "@angular/core";
import {Observable} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {IUser} from "../../../../models/interfaces/user.interface";
import {UserService} from "../../../../services/user.service";
import {User} from "../../../../models/user.model";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {StoreService} from "../../../../services/store.service";
import * as moment from 'moment';
import {trigger, state, style, animate, transition} from '@angular/animations';
import {environment} from "../../../../../environments/environment";

declare const $;

@Component({
    selector: 'app-add-edit-employee',
    templateUrl: './add-edit-view-employee.component.html',
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})
export class AddEditViewEmployeeComponent extends AddEditViewObjectComponent<IUser> implements OnInit, OnDestroy {
    @ViewChild('root')overlayRoot: ElementRef;

    errorFlags: {
        first: boolean;
        last: boolean;
        phone: boolean;
        email: boolean;
        license: boolean;
        type: boolean;
        dob: boolean;
        gender: boolean;
        badgeId: boolean;
        badgeExpiration: boolean;
        stateId: boolean;
        stateIdExpiration: boolean;
        password: boolean;
        pin: boolean;
        posPin: boolean;
    } = {
        first: false,
        last: false,
        phone: false,
        email: false,
        license: false,
        type: false,
        dob: false,
        gender: false,
        badgeId: false,
        badgeExpiration: false,
        stateId: false,
        stateIdExpiration: false,
        password: false,
        pin: false,
        posPin: false
    };

    environment: any = environment;

    storeSelect2Options : Select2Options;

    get permissionsShowing() {
        return !!this.route.firstChild;
    }

    // mode: string = 'add';

    employeeObservable: Observable<IUser>;

    latestBirthDate: string;
    earliestExpirationDate: string;

    errors: string[];
    error: string = '';


    constructor(injector: Injector, userService: UserService, private storeService: StoreService) {
        super(injector, userService);
        this.environment = environment;
    }

    ngOnInit() {

        super.ngOnInit();

        this.latestBirthDate = moment().subtract(1, 'days').format();
        this.earliestExpirationDate = moment().format();

        this.employeeObservable = Observable.combineLatest(this.route.params, this.route.data)
            .map(([params, data]) => {
                this.mode = data.mode;

                return params['id'];
            })
            .switchMap((id: string|undefined) => {
                return id ? this.userService.getAssociated(id) : Observable.of(this.userService.newInstance());
            });


        this.employeeObservable.subscribe(employee => {

            if (this.object) {
                //TODO dirty check
            }

            this.object = new User(employee);
            console.log(this.object);
        });

        CommonAdapter(this.storeService, 'id', 'name')
            .then(StoreAdapter => {

                this.storeSelect2Options = {
                    ajax: {},
                    placeholder: "Select a Location"
                };
                this.storeSelect2Options['dataAdapter'] = StoreAdapter;
            });

    }

    ngOnDestroy(): void {

    }

    togglePermissions() {
        if(!this.permissionsShowing) {
            this.router.navigate(['permissions'], {relativeTo: this.route});
        }
        else {
            this.router.navigate(['..'], {relativeTo: this.route.firstChild});
        }
    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    edit() {
        this.userService.edit(this.object)
    }

    async save() {
        this.clearErrorFlags();
        let errors = [];
        if (!this.object.firstName) {
            errors.push('First Name is a required field.');
            this.errorFlags.first = true;
        }
        if (!this.object.lastName) {
            errors.push('Last Name is a required field.');
            this.errorFlags.last = true;
        }
        if (!this.object.phone) {
            errors.push('Phone Number is a required field.');
            this.errorFlags.phone = true;
        }

        if (!this.object.email) {
            errors.push('Email is a required field.');
            this.errorFlags.email = true;
        } else if (!(await this.userService.validateEmail(this.object.email))){
            errors.push("Enter a valid email address.");
            this.errorFlags.email = true;
        } else if (await this.userService.checkDuplicateEmail(this.object.email, this.object.id)){
            errors.push("A user with this email already exists");
            this.errorFlags.email = true;
        }

        // if (!this.object.licenseNumber) {
        //     errors.push('License Number is a required field.');
        //     this.errorFlags.license = true;
        // }
        if (!this.object.dob) {
            errors.push('D.O.B. is a required field.');
            this.errorFlags.dob = true;
        }
        // if (!this.object.gender) {
        //     errors.push('Gender is a required field.');
        //     this.errorFlags.gender = true;
        // }
        if (!this.object.badgeId) {
            errors.push('Badge ID is a required field.');
            this.errorFlags.badgeId = true;
        }
        if (!this.object.badgeExpiration) {
            errors.push('Badge Expiration is a required field.');
            this.errorFlags.badgeExpiration = true;
        }
        /*
        if (!this.object.type) {
            errors.push('Employees must have a selected type.')
            this.errorFlags.type = true;
        }
        */

        /*
        if(this.mode == 'add' && !this.object.password){
            errors.push("Password cannot be blank");
            this.errorFlags.password = true;
        }
        */

        if(this.object.type == 'admin' && !this.object.pin){
            errors.push("Manager PIN cannot be blank");
            this.errorFlags.pin = true;
        }

        if(this.object.pin) {
            if (this.object.type == 'admin' && this.object.pin.length != 4) {
                errors.push("Manager PIN must be 4 digits long");
                this.errorFlags.pin = true;
            }

            if (this.object.type == 'admin' && this.object.pin.replace(/[^a-z0-9]/gi, '').length < this.object.pin.length) {
                errors.push("Manager PIN can only contain letters or numbers");
                this.errorFlags.pin = true;
            }

            if (this.object.type == 'admin' && await this.userService.checkDuplicatePin(this.object.pin, this.object.id)) {
                errors.push("Manager PIN must be unique");
                this.errorFlags.pin = true;
            }
        }

        if (this.object.posPin && this.object.posPin.length > 0) {
            if (this.object.posPin.length != 4) {
                errors.push("POS PIN must be 4 digits long");
                this.errorFlags.posPin = true;
            }

            if (this.object.posPin.replace(/[^a-z0-9]/gi, '').length < this.object.posPin.length) {
                errors.push("POS PIN can only contain letters or numbers");
                this.errorFlags.posPin = true;
            }

            if (this.object.type == 'admin' && await this.userService.checkDuplicatePosPin(this.object.posPin, this.object.id)) {
                errors.push("POS PIN must be unique");
                this.errorFlags.posPin = true;
            }
        }

        console.log('errors', errors);

        if (errors.length) {
            this.errors = errors;
            const el = document['getElementsByTagName']('app-add-edit-employee');
            if (el && el.length && el[0].children && el[0].children.length) {
                el[0].children[0].scrollTo(0, 0);
            }

            return;
        }

        if(this.mode == 'add') {
            this.object.password = null;
            console.log("about to save");
            this.userService.save(this.object, false, false, () => {
                this.userService.sendCreatePasswordEmail(this.object.email),
                this.userService.showPermissions(this.object);
            });
        }else{
            this.userService.save(this.object);
        }
    }

    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active') {
            this.userService.list();
        }
    }

    formatPhoneNumber(event: any) {
        var numbers = event.target.value.replace(/\D/g,'');
        var output = numbers.replace(/^(\d{3})(\d{1})/, '($1) $2');
        output = output.replace(/^\((\d{3})\)\s(\d{3})(\d{1})/, '($1) $2-$3');
        event.target.value = output;
    }
}
