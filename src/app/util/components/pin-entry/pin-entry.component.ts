import {Component,OnInit,OnDestroy,Output,EventEmitter} from "@angular/core";
import {Subject} from 'rxjs/Subject';

@Component({
    selector: "app-pin-entry",
    styleUrls: ['./pin-entry.component.css'],
    templateUrl: "./pin-entry.component.html"
})
export class PinEntryComponent implements OnInit, OnDestroy{

    public pinCode = new Array<number>();
    @Output() pinAttempt:EventEmitter<Array<number>> = new EventEmitter();

    public errorMessage = "";

    keyRows = [
        [7,8,9],
        [4,5,6],
        [1,2,3],
        [0]
    ]

    Constructor(){

    }

    ngOnInit(){

    }

    ngOnDestroy(){

    }

    onKeyClick(key) {
        console.log("key" + key);

        if(this.pinCode.length > 3){
            return;
        }

        this.errorMessage = "";

        console.log("this.pinCode" + this.pinCode);

        this.pinCode.push(key);

        console.log("this.pinCode" + this.pinCode);

        if(this.pinCode.length == 4){
            this.pinAttempt.emit(this.pinCode.slice());
        }
    }

    onDeleteClick() {
        console.log("clicked delete");

        if(this.pinCode.length == 0){
            return;
        }

        console.log("this.pinCode" + this.pinCode);

        this.pinCode.splice(-1,1);

        console.log("this.pinCode" + this.pinCode);
    }

    public clear(){
        this.pinCode.length = 0;
    }

    public handleIncorrect(){
        this.errorMessage = "Invalid PIN";

        this.clear();
    }
}
