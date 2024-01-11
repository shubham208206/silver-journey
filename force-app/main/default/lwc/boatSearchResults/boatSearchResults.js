import { LightningElement, api, wire } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import {publish,MessageContext} from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

const SUCCESS_VARIANT = 'success';
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship It!';
const ERROR_TITLE  = 'Error';
const ERROR_VARIANT = 'error';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
    { label: 'Price', fieldName: 'Price__c', type: 'currenncy', editable: true },
    { label: 'Description', fieldName: 'Description__c', type: 'text', editable: true }
];
export default class BoatSearchResults extends LightningElement {
    boats;
    selectedBoatId;
    boatTypeId = '';
    columns = COLUMNS;
    _wireResult;
    draftValues = [];

    @wire(MessageContext)
    messageContext;

    @wire(getBoats, {boatTypeId: "$boatTypeId"})
    wiredBoats(result){
        
        this._wireResult = result;
        this.handleLoading('loading');
        if(result.data){
            this.boats = result.data;
            this.handleLoading('doneloading');
        }
        else if(result.error){
            console.log('error: ', result.error);
        }
    }

    @api searchBoats(boatTypeId){
        this.handleLoading('loading');
        this.boatTypeId=boatTypeId;
        this.handleLoading('doneloading');
    }

    updateSelectedTile(event){
        this.selectedBoatId = event.detail.Id;
        publish(this.messageContext, BOATMC, { recordId: event.detail.Id })
    }

    handleSave(event){
        this.handleLoading('loading');
        this.draftValues = event.detail.draftValues;
        updateBoatList({data: this.draftValues})
        .then((data)=>{
            this.handleLoading('doneloading');
            this.draftValues = [];
            this.showToast(SUCCESS_VARIANT, SUCCESS_TITLE, MESSAGE_SHIP_IT);
            return refreshApex(this._wireResult);
        })
        .catch((err)=>{
            this.handleLoading('loading');
            console.log('error: ', err);
            this.showToast(ERROR_VARIANT, ERROR_TITLE, err?.body?.message);
        })
    }

    showToast(variant, title, message){
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                variant: variant,
                message: message
            })
        )
    }

    handleLoading(loadingType){
        this.dispatchEvent(new CustomEvent(loadingType));
    }
}