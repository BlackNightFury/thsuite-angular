import {Component, Injector, OnInit} from "@angular/core";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {IAlert} from "../../../models/interfaces/alert.interface";
import {AlertService} from "../../../services/alert.service";
import {Router} from "@angular/router";
import {Alert} from "../../../models/alert.model";
import {didSet} from "../../../lib/decorators/property/didSet";
import {PreviousRouteService} from "../../../services/previous-route.service";

export function didSetSelectedAlertType(newValue: string) {
    this.extraFilters.next({
        alertType: newValue
    })
}

@Component({
  selector: 'app-alert',
  templateUrl: './alerts.component.html'
})
export class AlertsComponent extends ObjectsIndexComponent<IAlert> implements OnInit {

    constructor(private alertService: AlertService,
                private previousRouteService: PreviousRouteService,
                injector: Injector) {
        super(injector, alertService);
    }

    alertTypeSelect2Options: Select2Options = {
        allowClear: true,
        placeholder: 'Select Alert Type',
        data: Object.keys(Alert.types).map(type => {
            return {
                  id: type,
                  text: Alert.types[type]
              }
          }),
        dropdownCssClass: 'compact'
    };

    @didSet(didSetSelectedAlertType) selectedAlertType: string;

    ngOnInit() {
        var navigationFromChild = this.previousRouteService.previousUrlContains("/admin/inventory/alerts");
        super.ngOnInit();
        this.prepareSearch(navigationFromChild);
    }

    prepareSearch(rememberSearchPosition:boolean){
        if(!rememberSearchPosition) {
            this.selectedAlertType = '';
        }
        this.extraFilters.next({alertType: this.selectedAlertType} );
    }

    onRowClick(event, alert) {
        if(alert.url) {
          this.router.navigateByUrl(alert.url);
        }
    }

}
