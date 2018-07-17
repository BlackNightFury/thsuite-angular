import { Component } from "@angular/core";
import { Http } from "@angular/http";
import { ImageService } from 'angular2-image-upload/src/image-upload/image.service';
import { ImageUploadComponent } from "angular2-image-upload";

@Component({
    selector: 'th-image-upload',
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.css']
})
export class THImageUploadComponent extends ImageUploadComponent {
    constructor(imageService:ImageService){
        super(imageService as any);

        console.log("THImageUploadComponent constructor");
    }
}