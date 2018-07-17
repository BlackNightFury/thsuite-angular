import { Injectable, Injector } from '@angular/core';
import {environment} from "../../environments/environment";
@Injectable()
export class AdjustmentReasonService{

    //TODO: Remove when getAdjustmentReasons pulls from backend
    private reasons = {
        'CO': {
            placeholder: 'Reason for Adjustment',
            data: [
                {
                    id: 'API Adjustment Error ',
                    text: 'API Adjustment Error '
                },
                {
                    id: 'API Conversion Error',
                    text: 'API Conversion Error'
                },
                {
                    id: 'API Duplicate sales entry - (For sales only)',
                    text: 'API Duplicate sales entry - (For sales only)'
                },
                {
                    id: 'CO Dept. of Agriculture',
                    text: 'CO Dept. of Agriculture'
                },
                {
                    id: 'Contaminant Testing',
                    text: 'Contaminant Testing'
                },
                {
                    id: 'Destruction (Usable marijuana or State/Local Authority Involvement)',
                    text: 'Destruction (Usable marijuana or State/Local Authority Involvement)'
                },
                {
                    id: 'Incorrect Quantity',
                    text: 'Incorrect Quantity'
                },
                {
                    id: 'Moisture Weight Change',
                    text: 'Moisture Weight Change'
                },
                {
                    id: 'Over Pulled',
                    text: 'Over Pulled'
                },
                {
                    id: 'Over Sold',
                    text: 'Over Sold'
                },
                {
                    id: 'Plants Unpacked',
                    text: 'Plants Unpacked'
                },
                {
                    id: 'Potency Testing',
                    text: 'Potency Testing'
                },
                {
                    id: 'Processing Loss',
                    text: 'Processing Loss'
                },
                {
                    id: 'Product Re-form (MIP use only)',
                    text: 'Product Re-form (MIP use only)'
                },
                {
                    id: 'Proficiency Testing',
                    text: 'Proficiency Testing'
                },
                {
                    id: 'State Agency ',
                    text: 'State Agency '
                },
                {
                    id: 'Theft',
                    text: 'Theft'
                },
                {
                    id: 'Transfer Error',
                    text: 'Transfer Error'
                },
                {
                    id: 'Typing Error',
                    text: 'Typing Error'
                },
                {
                    id: 'Under Pulled',
                    text: 'Under Pulled'
                },
                {
                    id: 'Under Sold',
                    text: 'Under Sold'
                },
                {
                    id: 'Waste (Unusable Marijuana)',
                    text: 'Waste (Unusable Marijuana)'
                }
            ]
        },
        'MD': {
            placeholder: 'Reason for Adjustment',
            data: [
                {
                    id: 'API Adjustment Error ',
                    text: 'API Adjustment Error '
                },
                {
                    id: 'API Duplicate Sales Entry',
                    text: 'API Duplicate Sales Entry'
                },
                {
                    id: 'Drying',
                    text: 'Drying'
                },
                {
                    id: 'Entry Error',
                    text: 'Entry Error'
                },
                {
                    id: 'License to License Transfer',
                    text: 'License to License Transfer'
                },
                {
                    id: 'MMCC Inspector Obtained Product',
                    text: 'MMCC Inspector Obtained Product'
                },
                {
                    id: 'Plants Unpacked',
                    text: 'Plants Unpacked'
                },
                {
                    id: 'Scale Variance',
                    text: 'Scale Variance'
                },
                {
                    id: 'Spoilage',
                    text: 'Spoilage'
                },
                {
                    id: 'Theft',
                    text: 'Theft'
                },
                {
                    id: 'Waste',
                    text: 'Waste'
                }
            ]
        }
    };

    getAdjustmentReasons(): {placeholder: string, data: {id: string, text: string}[]}{

        //TODO: This function should make a request to the backend and the backend
        //TODO: should get the valid list of reasons from Metrc

        return this.reasons[environment.state];

    }

}
