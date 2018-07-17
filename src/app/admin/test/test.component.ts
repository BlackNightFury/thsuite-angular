import {Component, OnInit} from "@angular/core";

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: [ './test.component.css' ]
})
export class TestComponent implements OnInit {


    constructor() {
    }

    ngOnInit() {

    }

    hideLeftNav() {
        document.querySelector('.leftnav').classList.remove('show');
        document.querySelector('.left-sidebar').classList.remove('show');
    }
}
