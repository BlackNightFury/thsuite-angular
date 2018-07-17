import {Component, OnInit, Injector} from "@angular/core";
import {UserService} from "../../services/user.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-activate',
    templateUrl: './activate.component.html',
})
export class ActivateComponent implements OnInit {

    protected router: Router;
    protected route: ActivatedRoute;

    constructor(private injector: Injector, private authService: UserService) {
        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            let code = params['activate'];
            //Do check here
            this.authService.checkActivationCode(code);
        });
    }



}
