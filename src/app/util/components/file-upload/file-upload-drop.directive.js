"use strict";
var core_1 = require("@angular/core");
var FileUploadDropDirective = (function () {
    function FileUploadDropDirective() {
        this.fileOver = new core_1.EventEmitter();
        this.fileDrop = new core_1.EventEmitter();
    }
    FileUploadDropDirective.prototype.onDrop = function (event) {
        var dataTransfer = FileUploadDropDirective.getDataTransfer(event);
        if (!FileUploadDropDirective.hasFiles(dataTransfer.types)) {
            return;
        }
        event.preventDefault();
        var files = this.filterFiles(dataTransfer.files);
        event.preventDefault();
        this.fileOver.emit(false);
        this.fileDrop.emit(files);
    };
    FileUploadDropDirective.prototype.onDragLeave = function (event) {
        this.fileOver.emit(false);
    };
    FileUploadDropDirective.prototype.onDragOver = function (event) {
        var dataTransfer = FileUploadDropDirective.getDataTransfer(event);
        if (!FileUploadDropDirective.hasFiles(dataTransfer.types)) {
            return;
        }
        dataTransfer.dropEffect = 'copy';
        event.preventDefault();
        this.fileOver.emit(true);
    };
    FileUploadDropDirective.prototype.filterFiles = function (files) {
        if (!this.accept || this.accept.length === 0) {
            return files;
        }
        var acceptedFiles = [];
        for (var i = 0; i < files.length; i++) {
            for (var j = 0; j < this.accept.length; j++) {
                if (FileUploadDropDirective.matchRule(this.accept[j], files[i].type)) {
                    acceptedFiles.push(files[i]);
                    break;
                }
            }
        }
        return acceptedFiles;
    };
    FileUploadDropDirective.getDataTransfer = function (event) {
        return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer;
    };
    FileUploadDropDirective.hasFiles = function (types) {
        if (!types) {
            return false;
        }
        if (types.indexOf) {
            return types.indexOf('Files') !== -1;
        }
        if (types.contains) {
            return types.contains('Files');
        }
        return false;
    };
    FileUploadDropDirective.matchRule = function (rule, candidate) {
        return new RegExp("^" + rule.split("*").join(".*") + "$").test(candidate);
    };
    return FileUploadDropDirective;
}());
FileUploadDropDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: '[fileDrop]'
            },] },
];
FileUploadDropDirective.ctorParameters = function () { return []; };
FileUploadDropDirective.propDecorators = {
    'accept': [{ type: core_1.Input },],
    'fileOver': [{ type: core_1.Output },],
    'fileDrop': [{ type: core_1.Output },],
    'onDrop': [{ type: core_1.HostListener, args: ['drop', ['$event'],] },],
    'onDragLeave': [{ type: core_1.HostListener, args: ['dragleave', ['$event'],] },],
    'onDragOver': [{ type: core_1.HostListener, args: ['dragover', ['$event'],] },],
};
exports.FileUploadDropDirective = FileUploadDropDirective;
