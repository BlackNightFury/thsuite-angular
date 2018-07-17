import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {Headers} from '@angular/http';

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit, OnChanges {

  files: FileList;

  fileOver: boolean = false;
  showFileTooLargeMessage: boolean = false;

  @Input() buttonCaption: string = 'Select Images';
  @Input('class') cssClass: string = 'file-ul';
  @Input() dropBoxMessage: string = 'Drop your files here!';
  @Input() fileTooLargeMessage: string;
  @Input() max: number = 100;
  @Input() maxFileSize: number;
  @Input() partName: string;
  @Input('extensions') supportedExtensions: string[];

  @Output() onFileAdd: EventEmitter<FileList> = new EventEmitter<FileList>();

  @ViewChild('input')
  private inputElement: ElementRef;

  constructor() {
  }

  ngOnInit() {
    if (!this.fileTooLargeMessage) {
      this.fileTooLargeMessage = 'A file was too large and was not uploaded.' + (this.maxFileSize ? (' The maximum file size is ' + this.maxFileSize / 1024) + 'KiB.' : '');
    }
  }

  ngOnChanges(changes) {
  }

  onFileChange(files: FileList) {
    this.files = files;

    this.onFileAdd.emit(this.files);
  }

  onFileClick() {
  }

  onFileOver = (isOver) => this.fileOver = isOver;
}
