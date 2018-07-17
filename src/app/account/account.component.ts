import {Component, Injector, OnInit, ViewChild} from "@angular/core";
import {UserService} from "../services/user.service";
import {IUser} from "../models/interfaces/user.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {FileHolder, ImageUploadComponent} from "angular2-image-upload/lib/image-upload/image-upload.component";
import {Http} from "@angular/http";
import {EmailSettingsService} from "../services/email-settings.service";
import { PreviousRouteService } from "../services/previous-route.service";

declare const $;

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {

    user: IUser;
    password1: string;
    password2: string;

    replaceImageFlag: boolean = false;

    passwordUpdated: boolean = false;

    errors: string[];
    userErrors: string[]; //Errors from saving user data
    errorFlags: {
        firstName: boolean;
        lastName: boolean;
        email: boolean;
        pin: boolean;
    } = {
        firstName: false,
        lastName: false,
        email: false,
        pin: false
    };

    protected router: Router;
    protected route: ActivatedRoute;
    comesFromPOS: boolean;

    @ViewChild(ImageUploadComponent) private imageUploadComponent: ImageUploadComponent;

    constructor(private injector: Injector,
        private userService: UserService,
        private http: Http,
        private emailSettingsService: EmailSettingsService,
        private previousRouteService: PreviousRouteService) {
        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
    }

    ngOnInit() {

        this.userService.userEmitted.subscribe(user => {
            this.user = user;
            console.log(user);
        });

        this.comesFromPOS = this.previousRouteService.previousUrlContains("pos/");
    }

    replaceImage(){
        this.replaceImageFlag = true;
    }

    clearReplace(){
        this.replaceImageFlag = false;
    }

    uploadImage($event: FileHolder) {

        this.userService.getUploadParams()
            .then(params => {
                console.log(params);

                const formData = new FormData();

                var sanitizedFileName = $event.file.name.replace(/[^\w.]+/g, "_");

                formData.append('key', params.name);
                formData.append('AWSAccessKeyId', params.key);
                formData.append('policy', params.policy);
                formData.append('success_action_status', '201');
                formData.append('signature', params.signature);
                formData.append('Content-Type', params.contentType);
                formData.append('file', $event.file, sanitizedFileName);

                return this.http
                    .post(params.action, formData)
                    .toPromise()
            })
            .then(response => {
                console.log(response);
                if (response.status !== 201) {
                    throw new Error('Error uploading image')
                }

                let $response = $(response._body);

                this.user.image = decodeURIComponent($response.find('Location').text());

                this.replaceImageFlag = false;
                this.userService.save(this.user, false, false);

                this.imageUploadComponent.deleteAll();
            })
            .catch(err => {
                alert(err.message);
            })

    }

    updatePassword(){
        //Validate the passwords match
        let errors = [];

        if(!this.password1 || !this.password2){
            errors.push("Both fields must be filled in.");
            this.errors = errors;
            return;
        }

        if(this.password1 != this.password2){
            errors.push('Entered passwords must match');
        }

        if(this.password1.length < 8){
            errors.push("Password must be at least 8 characters");
        }

        if ( errors.length > 0 ) {
            this.errors=errors;
            return;
        }

        //If they match, update the password
        let successObservable = this.userService.updatePassword(this.user, this.password1);

        successObservable.subscribe(success => {
            if(success){
                //TODO: Change this
                this.passwordUpdated = true;
                this.errors = undefined;
                this.password1 = undefined;
                this.password2 = undefined;
                $.notify("Password updated successfully!", "success");
            }
        })
    }

    async save(){

        this.userErrors = [];
        this.clearErrorFlags();

        let errors = [];
        if(!this.user.firstName.length){
            errors.push("First name cannot be blank");
            this.errorFlags.firstName = true;
        }

        if(!this.user.lastName.length){
            errors.push("Last name cannot be blank");
            this.errorFlags.lastName = true;
        }

        if(!this.user.email.length){
            errors.push("Email cannot be blank");
            this.errorFlags.email = true;
        }else if(!(await this.userService.validateEmail(this.user.email))){
            errors.push("Enter a valid email address.");
            this.errorFlags.email = true;
        }else if(await this.userService.checkDuplicateEmail(this.user.email, this.user.id)){
            errors.push("A user with this email already exists");
            this.errorFlags.email = true;
        }

        if(this.user.type == 'admin' && !this.user.pin){
            errors.push("Manager PIN cannot be blank");
            this.errorFlags.pin = true;
        }

        if(this.user.type == 'admin' && this.user.pin.length != 4){
            errors.push("Manager PIN must be 4 digits long");
            this.errorFlags.pin = true;
        }

        if(this.user.type == 'admin' && this.user.pin.replace(/[^a-z0-9]/gi,'').length < this.user.pin.length){
            errors.push("Manager PIN can only contain letters or numbers");
            this.errorFlags.pin = true;
        }

        if (this.user.pin && await this.userService.checkDuplicatePin(this.user.pin, this.user.id)) {

            errors.push("Manager PIN must be unique");
            this.errorFlags.pin = true;
        }

        if (errors.length) {
            this.userErrors = errors;
            return;
        }

        this.userErrors = [];

        this.userService.save(this.user, false, false);

    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    saveEmailSettings(){
        let result = this.emailSettingsService.save(this.user.EmailSettings);
    }

    clearMessage(){
        this.passwordUpdated = false;
    }

    backToDash() {
        if (!this.comesFromPOS) {
            this.router.navigate(['admin', 'home']);
        } else {
            this.router.navigate(['pos', 'all']);
        }
    }
}
