import {Injectable, Injector} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";
import {Promise} from "bluebird"
import {User} from "../models/user.model";
import {IUser} from "../models/interfaces/user.interface";
import {SearchableService} from "./searchable.service";
import {SearchResult} from "../lib/search-result";
import {Mixin} from "../lib/decorators/class/mixin";
import {ObjectObservable} from "../lib/object-observable";
import {PermissionService} from "./permission.service";
import {Permission} from "../models/permission.model";
import {StoreService} from "./store.service";
import {Subject} from "rxjs/Subject";
import {EmailSettingsService} from "app/services/email-settings.service";
import {EmailSettings} from "../models/email-settings.model";
import {PosDeviceService} from "./pos-device.service";
import {DeviceService} from "./device.service";

import {environment} from "../../environments/environment";

@Injectable()
@Mixin([SearchableService])
export class UserService extends CommonService<IUser> implements SearchableService<IUser> {

    loggedIn = false;
    private userEmittedSource = new BehaviorSubject<User>(undefined);

    userEmitted = this.userEmittedSource.asObservable();

    private tokenModalShowingSource = new BehaviorSubject<boolean>(undefined);
    tokenModalShowingEmitted = this.tokenModalShowingSource.asObservable();

    private tokenSource = new BehaviorSubject<string>(undefined);
    tokenEmitted = this.tokenSource.asObservable();

    constructor(
        injector: Injector,
        private socketService: SocketService,
        private permissionService: PermissionService,
        private storeService: StoreService,
        private emailSettingsService: EmailSettingsService,
        private deviceService: DeviceService
    ) {
        super(injector, 'users');

        if(environment.enableDefaultUser) {
            this.loggedIn = true;
            this.userEmittedSource.next(new User({
                id: '330d0ae7-8921-4eee-8ff9-3b697f2dcebc',
                version: 0,
                clientId: '',
                storeId: '',
                firstName: 'Default',
                lastName: 'User',
                email: 'zack@vimbly.com',
                phone: '',
                licenseNumber: '',

                pin: '0000',
                posPin: '',

                dob: new Date(),
                gender: "male",
                badgeId: "1234567890",
                badgeExpiration: new Date(),
                stateId: "1234567890",
                stateIdExpiration: new Date(),


                type: 'admin',
                status: 1,
                activation: null,
                image: null,

                isAPIUser: false,
                isActive: true,

                Permissions: new Permission({
                    id: uuid.v4(),
                    version: 0,

                    clientId: '',

                    userId: '',

                    patientManagement: 'edit',
                    canEditPatientGroups: true,
                    canEditPatients: true,
                    canAccessMedicalApp: true,
                    canAccessPhysiciansDashboard: true,
                    canAccessCaregiverDashboard: true,
                    canAccessVisitorDashboard: true,
                    canDoPatientCheck: true,
                    canReleaseBudtender: true,


                    inventoryManagement: 'edit',
                    canEditProducts: true,
                    canEditItems: true,
                    canEditProductTypes: true,
                    canEditSuppliers: true,
                    canEditBarcodes: true,
                    canEditPricingTiers: true,
                    canEditLineItems: true,


                    storeManagement: 'edit',
                    canEditStores: true,
                    canEditDiscounts: true,
                    canEditLoyaltyRewards: true,
                    canEditTaxes: true,


                    reportsManagement: 'edit',
                    employeeManagement: 'edit',
                    administrativeManagement: 'edit',

                    canScanItems: true,
                    canManuallyAddCannabisItems: true,
                    canManuallyAddNonCannabisItems: true,
                    canVoidItems: true,
                    canAcceptReturns: true,

                    canManuallyDiscount: true,

                    canManuallyVerifyAge: true,
                    canAddNotesToPatient: true,
                    canRegisterDevice: true,
                    canSubmitToMetrc: false,
                    canPersistentLogin: false,

                    canEditStoreSettings: false
                }),

                EmailSettings: new EmailSettings({
                    id: uuid.v4(),
                    version: 0,

                    userId: '',

                    lowInventory: true,
                    autoClosedPackages: true,

                    taxesReport: true
                })
            }))
        }
    }

    newInstance() {
        return new User({
            id: uuid.v4(),
            version: 0,

            clientId: '',
            storeId: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            licenseNumber: '',

            dob: new Date(),
            gender: "",
            badgeId: "",
            badgeExpiration: new Date(),
            stateId: "",
            stateIdExpiration: new Date(),

            type: 'admin',
            status: 1,
            activation: null,
            image: '',

            posPin: '',

            isAPIUser: false,
            isActive: true
        });
    }

    dbInstance(fromDb: IUser) {
        return new User(fromDb);
    }

    instanceForSocket(object: IUser): IUser{
        return {
            id: object.id,
            version: object.version,

            storeId: object.storeId,
            clientId: object.clientId,
            firstName: object.firstName,
            lastName: object.lastName,
            email: object.email,
            password: object.password,
            pin: object.pin,
            posPin: object.posPin,
            phone: object.phone,
            licenseNumber: object.licenseNumber,

            dob: object.dob,
            gender: object.gender,
            badgeId: object.badgeId,
            badgeExpiration: object.badgeExpiration,
            stateId: object.stateId,
            stateIdExpiration: object.stateIdExpiration,

            type: object.type,
            status: object.status,
            activation: object.activation,

            image: object.image,

            isAPIUser: object.isAPIUser,
            isActive: object.isActive
        }
    }

    search: (query: string, page: number) => Observable<SearchResult<IUser>>;

    getLoggedIn() {
        return new Promise((resolve, reject) => {
            if (this.loggedIn) {
                return resolve(this.loggedIn)
            } else {
                if (sessionStorage !== undefined && sessionStorage.getItem) {
                    const loginToken = sessionStorage.getItem('loginToken');

                    if (loginToken) {
                        console.log('Trying to login with loginToken');

                        return this.doLoginWithToken(loginToken, false).then(() => {
                            return resolve(this.loggedIn);
                        });
                    } else {
                        return resolve(this.loggedIn);
                    }
                } else {
                    return resolve(this.loggedIn);
                }
            }
        }).timeout(60000).catch(Promise.TimeoutError, (e) => {
            sessionStorage.removeItem('loginToken');
            return false;
        });
    }

    doLoginWithToken(loginToken: string, redirect: boolean = true) {
        return this.socket.emitPromise('loginWithToken', { loginToken })
            .then(user => this.postLoginActions(user, redirect))
            .catch(err => {

                if (typeof err === 'string') {
                    return Promise.resolve(err)
                }
                else if (err.message === "Invalid Credentials" ) {
                    return Promise.resolve('Invalid Credentials')
                }
                else {
                    console.log(err);
                    return Promise.resolve('Unknown Error.')
                }
            })
    }

    doLogin(username: string, password: string) {
        // Need to reset login state if environment.enableDefaultUser is configured
        this.loggedIn = false;

        return this.socket.emitPromise('login', {username, password})
            .then(user => this.postLoginActions(user))
            .catch(err => {

                if (typeof err === 'string') {
                    return Promise.resolve(err)
                }
                else if (err.message === "Invalid username" || err.message === "Invalid password") {
                    return Promise.resolve('Invalid Credentials')
                }
                else if (err.message === "New user"){
                    return Promise.resolve('New user. Must setup password. Please check your email.')
                }
                else {
                    console.log(err);
                    return Promise.resolve('Unknown Error.')
                }
            })
    }

    postLoginActions(user: any, redirect: boolean = true) {
        return new Promise((resolve, reject) => {

            if (user.loginToken) {
                if (sessionStorage !== undefined && sessionStorage.setItem) {
                    sessionStorage.setItem('loginToken', user.loginToken);
                }

                delete user.loginToken;
            }

            this.getAssociated(user.id)
                .subscribe(user => {

                    if (!this.loggedIn) {
                        this.loggedIn = true;

                        //Check for cookie
                        let posDeviceId = localStorage.getItem('deviceId');

                        if (!this.canUserAccessAdmin(user) && this.canUserAccessPos(user)) {

                            if (redirect) {
                                if (!posDeviceId) {
                                    this.router.navigateByUrl('/auth/register-device');
                                } else {
                                    this.deviceService.isRegistered(posDeviceId)
                                        .then(posDevice => {
                                            if (posDevice) {
                                                this.router.navigateByUrl('/pos/all');
                                            } else {
                                                this.router.navigateByUrl('/auth/register-device');
                                            }
                                        })

                                }
                            }

                            resolve()
                        }
                        else if (this.canUserAccessAdmin(user)) {
                            if (redirect) {
                                if (!posDeviceId) {
                                    //Redirect to registration page
                                    this.router.navigateByUrl('/admin/home/register-pos');
                                } else {
                                    this.deviceService.isRegistered(posDeviceId)
                                        .then(posDevice => {

                                            if (posDevice) {
                                                this.router.navigateByUrl('/admin/home');
                                            } else {
                                                this.router.navigateByUrl('/admin/home/register-pos');
                                            }
                                        })
                                }
                            }

                            resolve()
                        }
                        else {
                            resolve("Unknown user type");
                        }
                    }

                    this.userEmittedSource.next(new User(user));
                })
        })
    }

    canUserAccessAdmin(user: IUser) {
        //User can access admin if they have any admin view permission
        let managementPermissions = [
            'patientManagement',
            'inventoryManagement',
            'storeManagement',
            'reportsManagement',
            'employeeManagement',
            'administrativeManagement'
        ];
        let canAccess = false;
        for (let managementPermission of managementPermissions) {
            if (user.Permissions[managementPermission] == 'view' || user.Permissions[managementPermission] == 'edit') {
                canAccess = true;
                break;
            }
        }

        return canAccess;
    }

    canUserAccessPos(user: IUser) {
        //User can access POS if they have at least one of these
        return user.Permissions.canManuallyAddCannabisItems || user.Permissions.canManuallyAddNonCannabisItems || user.Permissions.canScanItems;
    }

    doLogout() {
        if (sessionStorage !== undefined && sessionStorage.removeItem) {
            sessionStorage.removeItem('loginToken');
            localStorage.setItem('removeLoginTokenAndLogout', (new Date().getTime()).toString());
        }

        this.socket.emitPromise('logout')
            .then(() => {
                this.loggedIn = false;
                this.backToLogin()
                this.userEmittedSource.next(null);
            })
            .catch(err => {

            })
    }

    backToLogin() {
        this.router.navigate(['auth', 'login']);
    }

    sendResetEmail(email: string) {
        return this.socket.emitPromise('send-reset-email', {email})
            .then(response => {
                if (!response) {
                    console.log("Err: no user with email");
                    return Promise.resolve('User not found')
                } else {
                    this.router.navigate(['auth', 'email-sent']);
                    console.log("reset");
                    return Promise.resolve()
                }
            })
            .catch(err => {
                console.log("err: ");
                console.log(err);
                return Promise.resolve('Unknown Error')
            })
    }

    sendCreatePasswordEmail(email: string) {
        return this.socket.emitPromise('send-create-password-email', {email})
            .then(response => {
                if (!response) {
                    console.log("Err: no user with email");
                    return Promise.resolve('User not found');
                } else {
                    console.log("Email Sent");
                    return Promise.resolve();
                }
            })
            .catch(err => {
                console.log("err: ");
                console.log(err);
                return Promise.resolve('Unknown Error')
            })
    }

    checkActivationCode(code: string) {
        this.socket.emitPromise('check-activation-code', {code})
            .then(user => {
                if (!user) {
                    this.router.navigate(['auth', 'login']);
                } else {
                    //Log this user in
                    this.getAssociated(user.id).subscribe(user => {

                        this.loggedIn = true;
                        this.userEmittedSource.next(new User(user));
                        this.router.navigate(['auth', 'reset-password']);

                    });
                }
            })
    }

    validateEmail(email: string): Promise<boolean> {
        return this.socket.emitPromise('validateEmail', {email})
    }

    checkDuplicateEmail(email: string, userId: string): Promise<boolean> {
        return this.socket.emitPromise('checkDuplicateEmail', {email, userId});
    }


    checkDuplicatePosPin(pin: string, userId: string): Promise<boolean> {
        return this.socket.emitPromise('checkDuplicatePosPin', {pin, userId});
    }

    checkDuplicatePin(pin: string, userId: string): Promise<boolean> {
        return this.socket.emitPromise('checkDuplicatePin', {pin, userId});
    }

    updatePassword(user: IUser, password: string) {

        let successObservable = new Subject<boolean>();

        this.socket.emitPromise('update-password', {id: user.id, password: password})
            .then(user => {

                if (!user) {
                    throw new Error('User not found.');
                } else {
                    //Log this user in
                    this.getAssociated(user.id).subscribe(user => {

                        this.loggedIn = true;
                        this.userEmittedSource.next(new User(user));

                        successObservable.next(true);

                        //No redirect after password change
                        // if(user.type == 'pos') {
                        //     this.router.navigateByUrl('/pos/all');
                        // }
                        // else if(user.type == 'admin') {
                        //     this.router.navigateByUrl('/admin/home');
                        // }
                        // else {
                        //     throw new Error("Unknown user type");
                        // }

                    });
                }

            })
            .catch(err => {
                console.log('err: ');
                console.log(err);
                successObservable.next(false);
            });

        return successObservable.asObservable();
    }

    getUploadParams(): Promise<any> {
        return this.socket.emitPromise('get-s3-upload-params')
    }

    confirmPosPin(pin: string) {
        return this.socket.emitPromise('confirm-pos-pin', { pin });
    }

    confirmManagerPin(pin: string) {
        return this.socket.emitPromise('confirm-manager-pin', pin );
    }

    confirmUserPin(userId: string, pin: string) {
        return this.socket.emitPromise('confirm-user-pin', userId, pin);
    }

    generateToken(userId: string){
        return this.socket.emitPromise('generateToken', userId);
    }

    showTokenModal(){
        this.tokenModalShowingSource.next(true);
    }

    hideTokenModal(){
        this.tokenModalShowingSource.next(false);
    }

    emitToken(token: string){
        this.tokenSource.next(token);
    }

    resolveAssociations(user: IUser): ObjectObservable<IUser> {

        let obs = Observable.combineLatest(
            this.permissionService.getByUserId(user.id),
            this.emailSettingsService.getByUserId(user.id),
            this.storeService.get(user.storeId),
            (permissions, emailSettings, store) => {

                user.Permissions = permissions;
                user.Store = store;
                user.EmailSettings = emailSettings;
                return user;
            }
        );

        return new ObjectObservable(obs, user.id);

    }

    create() {
        this.router.navigate(['admin', 'employees', 'add']);
    }

    view(object: IUser) {
        this.router.navigate(['admin', 'employees', 'view', object.id]);
    }

    edit(object: IUser) {
        this.router.navigate(['admin', 'employees', 'edit', object.id])
    }

    list() {
        this.router.navigate(['admin', 'employees']);
    }

    showPermissions(object: IUser) {
        this.router.navigate(['admin', 'employees', 'edit', object.id, 'permissions']);
    }

    save(user: IUser, redirect: boolean = true, goToEdit: boolean = false, callback?) {
        console.log(user);

        super.save(user, callback ? callback : () => {});

        if (redirect) {
            goToEdit ? this.edit(user) : this.list();
        }
    }

    sendHelpRequest(details: any){
        this.socket.emitPromise('sendHelpRequest', details);
    }
}
