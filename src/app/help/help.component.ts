import {Component, Injector, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../services/user.service";
import { PreviousRouteService } from "../services/previous-route.service";

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
})
export class HelpComponent implements OnInit {

    protected router: Router;
    protected route: ActivatedRoute;
    protected userService: UserService;

    categorySelect2Options: Select2Options;

    category: string;
    email: string;
    message: string;

    submitted: boolean = false;
    comesFromPOS: boolean;

    constructor(private injector: Injector,
        private previousRouteService: PreviousRouteService) {
        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
        this.userService = injector.get<UserService>(UserService);
    }

    ngOnInit() {
        this.categorySelect2Options = {
            placeholder: "Select a Category",
            data: [
                {
                    id:"General",
                    text: "General"
                },
                {
                    id: "Account",
                    text: "My Account"
                },
                {
                    id: "Patient Management",
                    text: "Patient Management"
                },
                {
                    id: "Inventory Management",
                    text: "Inventory Management"
                },
                {
                    id: "Store Management",
                    text: "Store Management"
                },
                {
                    id: "Reports",
                    text: "Reports"
                },
                {
                    id: "Employee Management",
                    text: "Employee Management"
                },
                {
                    id: "Other",
                    text: "Other"
                }
            ]
        }
        this.comesFromPOS = this.previousRouteService.previousUrlContains("pos/");
    }

    backToDash() {
        if (!this.comesFromPOS) {
            this.router.navigate(['admin', 'home']);
        } else {
            this.router.navigate(['pos', 'all']);
        }
    }

    submit(){
        let details = {
            category: this.category,
            email: this.email,
            message: this.message
        };

        this.userService.sendHelpRequest(details);

        this.submitted = true;
    }

}
