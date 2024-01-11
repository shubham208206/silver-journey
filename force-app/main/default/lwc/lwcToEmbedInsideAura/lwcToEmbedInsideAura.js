import { LightningElement, wire, track } from 'lwc';
import { publish,subscribe,unsubscribe,MessageContext, APPLICATION_SCOPE} from 'lightning/messageService';
import CHANNEL from "@salesforce/messageChannel/dummyMessageChannel__c";

export default class LwcToEmbedInsideAura extends LightningElement {
    payload;
    subscription;

    @wire(MessageContext)
    messageContext;

    connectedCallback(){
        
        this.subscribeToMessageChannel();
    }

    handlePublish(){
        console.log('LWC Publish');
        publish(this.messageContext, CHANNEL, {"payload": "Data Transferred through LWC"});
    }

    subscribeToMessageChannel(){
        if(!this.subscription){
            this.subscription = subscribe(this.messageContext, CHANNEL, (message) => this.handleSubscribe(message),{ scope: APPLICATION_SCOPE });
        }   
    }

    handleSubscribe(message){
        this.payload = message.payload;
        console.log('payload: ', message);
    }

    handleUnSubscribe(){
        unsubscribe(this.subscription);
        this.subscription = undefined;
    }
}