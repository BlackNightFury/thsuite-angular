import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {IStore} from "../../models/interfaces/store.interface";

import {environment} from  "../../../environments/environment";
import {PatientService} from "../../services/patient.service";
import {IUser} from "../../models/interfaces/user.interface";
import {UserService} from "../../services/user.service";

@Component({
    selector: 'app-patient',
    templateUrl: './patients.component.html',
})
export class PatientsComponent implements OnInit {

    mode: string = 'patients';
    environment;

    isPatientCheckInModalShowing: boolean = false;
    isVerifyAddModalShowing: boolean = false;
    isPatientNotesModalShowing: boolean = false;

    user: IUser;

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
                private patientService: PatientService,
                private userService: UserService) {
    }

    ngOnInit() {

        this.userService.userEmitted.subscribe(user => {
            this.user = user;
        });

        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map(route => {
                while (route.firstChild) route = route.firstChild;
                return route;
            })
            .filter(route => route.outlet === 'primary')
            .mergeMap(route => route.data)
            .subscribe((event) => {

                console.log(event['mode']);

                this.mode = event['mode'];
            });

        this.environment = environment;

        this.patientService.checkInModalShowing.subscribe(val => {
            this.isPatientCheckInModalShowing = val;
        });

        this.patientService.verifyAddModalShowing.subscribe(val => {
            this.isVerifyAddModalShowing = val;
        });

        this.patientService.patientNotesModalShowing.subscribe(val => {
            this.isPatientNotesModalShowing = val;
        })
    }

    hideLeftNav() {
        document.querySelector('.leftnav').classList.remove('show');
        document.querySelector('.left-sidebar').classList.remove('show');
    }
}
