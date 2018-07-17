import {animate, style, transition, trigger} from "@angular/core";

export const flyInFromTop = trigger('flyIn', [
    transition(':enter', [
        style({
            transform: 'translateY(-15%)',
            opacity: 0
        }),
        animate('300ms cubic-bezier(.07,1.13,.68,.94)')
    ])
]);

export const flyInFromRight = trigger('flyIn', [
    transition(':enter', [
        style({
            transform: 'translateX(15%)',
            opacity: 0
        }),
        animate('300ms cubic-bezier(.07,1.13,.68,.94)')
    ])
]);


export const flyInOutFromRight = trigger('flyInOut', [
    transition(':enter', [
        style({
            transform: 'translateX(15%)',
            opacity: 0
        }),
        animate('300ms cubic-bezier(.07,1.13,.68,.94)')
    ]),
    transition(':leave', [
        animate('300ms cubic-bezier(.07,1.13,.68,.94)', style({
            transform: 'translateX(15%)',
            opacity: 0
        }))
    ])
]);
