import {Component, Injector, OnInit, OnDestroy, ViewChild, ElementRef} from "@angular/core";
import {Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {IPhysician} from "../../../../models/interfaces/physician.interface";
import {Physician} from "../../../../models/physician.model";
import {PhysicianService} from "../../../../services/physician.service";
import {PatientService} from "../../../../services/patient.service";
import * as moment from 'moment';

@Component({
    selector: 'app-add-edit-view-physician',
    templateUrl: './add-edit-view-physician.component.html'
})
export class AddEditViewPhysicianComponent extends AddEditViewObjectComponent<IPhysician> implements OnInit, OnDestroy {
    @ViewChild('root')overlayRoot: ElementRef;

    errors: string[];

    errorFlags: any = {
        firstName: false,
        lastName: false,
        clinicName: false,
        address: false,
        city: false,
        state: false,
        zip: false
    };

    constructor(injector: Injector, private physicianService: PhysicianService, private patientService: PatientService) {
        super(injector, physicianService);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    edit() {
        this.physicianService.edit(this.object);
    }

    async save() {
        this.clearErrorFlags();
        let errors = [];

        if(!this.object.firstName) {
            errors.push("First Name is a required field.");
            this.errorFlags.firstName = true;
        }
        if(!this.object.lastName) {
            errors.push("Last Name is a required field.");
            this.errorFlags.lastName = true;
        }
       
        if(!this.object.clinicName) {
            errors.push("Clinic Name is a required field.");
            this.errorFlags.clinicName = true;
        }

        if(errors.length) {
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }

        this.physicianService.save(this.object);
    }

    cancel() {
        this.physicianService.cancelEdit(this.object);
    }

    remove() {
        this.physicianService.remove(this.object);
    }

    formatPhoneNumber(event: any) {
        var numbers = event.target.value.replace(/\D/g,'');
        var output = numbers.replace(/^(\d{3})(\d{1})/, '($1) $2');
        output = output.replace(/^\((\d{3})\)\s(\d{3})(\d{1})/, '($1) $2-$3');
        event.target.value = output;
    }

    setPhoneNumber(phoneNumber: string) {
        var numbersOnlyPhoneNumber = phoneNumber.replace(/[^0-9]+/g, '');

        this.object.phoneNumber = numbersOnlyPhoneNumber;
    }

    filterNumericKeyPress (e){

        var key = e.keyCode ? e.keyCode : e.which;

        if (key < 48 || key > 57) e.preventDefault();
    }
}
