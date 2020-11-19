import { LightningElement, wire, api, track } from 'lwc';
import getRecords from '@salesforce/apex/FilterRecords.getRecords';
import countRecords from '@salesforce/apex/FilterRecords.countRecords';
import filterNames from '@salesforce/apex/FilterRecords.filterNames';
import accountContact from '@salesforce/apex/FilterRecords.accountContact';
import viewRecords from '@salesforce/apex/FilterRecords.viewRecords';

export default class SearchRecords extends LightningElement {

    @api isLoaded = false;

    oldValue = '';

    value;
    valueCheckbox = [];
    recordTypes ;    
    countTotalRecords;
    countNameRecords;
    searchName = '';
    searchPhone = '';
    searchEmail ='';
    allRecordType = [];
    listofRecordCount = [];
    listOfContactCount = [];
    filteringName = '';

   query = '';

    checkedContacts = [];

   totalCount ;
    viewContactsList;

    account = false;

    error;
    
    get options() {
        return [
            { label: 'Account', value: 'account' },
            { label: 'Contact', value: 'contact' },
            { label: 'Opportunity', value: 'opportunity' },
        ];
    }

    handleChange(event) {
        this.value = event.detail.value;
        console.log('This is your choice : ' + this.value);
        function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));  
    }
    
    wait(500).then(() => { 
        this.filteringRecords();
        console.log('.5 seconds have passed...');
    });

    }
   

    @wire(getRecords, {objName : '$value'})
    wiredRecords({data, error}){
        if(data){
            this.recordTypes = data;           
            for(var i=0;i<this.recordTypes.length;i++){
                this.valueCheckbox.push(this.recordTypes[i].Name);
                console.log('This is loop' + this.recordTypes[i].Name);
            }
            console.log('Aaa gaye isme !!')  ;
        }

    }
    
    get optionsCheckbox(){
         var checkboxValue = [];
         this.allRecordType = [];
        for(var i = 0; i<this.recordTypes.length; i++){
            this.allRecordType.push(this.recordTypes[i].Name);
            if(this.valueCheckbox==0)
        {
            this.valueCheckbox.push(this.oldValue);
        }
            checkboxValue.push({
                label : this.recordTypes[i].Name, value : this.recordTypes[i].Name
            })
        }
        return checkboxValue;
    }
    handleCheckbox(event){
        this.valueCheckbox = event.detail.value;
       
        console.log('Record Id :'+ this.valueCheckbox);
        if(event.detail.value.length == 1){
            this.oldValue = event.detail.value[0];
        }
        this.filteringRecords();
    }
    countName(event){
        this.searchName = event.detail.value;    
    }
    @wire(countRecords, {objName : '$value'})
    wiredCount({data, error}){
        if(data){
            for(var i=0; i<data.length; i++){
            this.countTotalRecords = data[i].expr0;
            }
        }
    }
    
    countName(event){
        this.searchName = event.detail.value;
        this.filteringRecords();
    }
    countPhone(event){
        this.searchPhone = event.detail.value;
        this.filteringRecords();
    }
    countEmail(event){
        this.searchEmail = event.detail.value;
        this.filteringRecords();


    }
    filteringRecords(){
        this.query=this.value+' Where ';
        if(this.searchName!=''){
            this.query=this.query+'Name LIKE \'%'+this.searchName+'%\' AND ';
        }
        if(this.searchEmail!=''){
            this.query=this.query+'Email LIKE \'%'+this.searchEmail+'%\' AND ';
        }
        if(this.searchPhone!=''){
            this.query=this.query+'Phone LIKE \'%'+this.searchPhone+'%\' AND ';
        }
        if(this.searchName==''&&this.searchEmail==''&&this.searchPhone=='')
        {
            this.query=this.query.substring(0, this.query.indexOf('Where'));
        }
        else 
        {
           this.query=this.query.substring(0,this.query.length-4);
        }

        console.log('This is query : ' + this.query);
        if(this.valueCheckbox==0)
        {
            this.valueCheckbox.push(this.oldValue);
        }
        this.isLoaded = true;
      var  map1 = new Map();
      var  map2 = new Map();
        console.log('Name : '+ this.searchName + ' Phone :' + this.searchPhone + ' Email : ' + this.searchEmail);
        console.log('Value of checkbox : ' + this.valueCheckbox);
        filterNames
            ({
                
                query : this.query,
                listOfRecordType:this.valueCheckbox,
                allRecordType : this.allRecordType,
            })
            .then(result => {
                this.listofRecordCount = [];
                 map1=result;
                 for(var key in map1)
                 {
                     console.log(key);
                     this.listofRecordCount.push({
                         Id:key,
                         Name:map1[key],
                     });
                     
                 }
                 
                console.log('result: '+  this.listofRecordCount);
                this.isLoaded = false;
            })
            .catch(error => {
             //   this.error = error.body.message;
                this.error = error;
                console.log(this.error);
            });
            accountContact({
                name:this.searchName
            })
            
            .then(result=>{
                this.listOfContactCount = [];
                map2=result;
                if(this.value == 'Account'){
                    this.account = true;
                for(var key in map2){
                    console.log(key);
                    this.listOfContactCount.push({
                        Id:key,
                        Name:map2[key],
                    });
                }
            }
                console.log('Result: ' + this.listOfContactCount);
            })
        
    }
    

  closePanel(){
      console.log('This is panel ');
      this.template.querySelector('.closePanel').style.display ='none';
  }
  showPanel(){
      console.log('Show Panel');
      this.template.querySelector('.closePanel').style.display ='inline-block';
  }
  viewResults(){
      //alert('You click on a button !!');
      viewRecords({
        query : this.query,
        filterByName : this.filteringName,
        listOfRecordType:this.valueCheckbox,
        allRecordType : this.allRecordType,
      })
      .then(result => {
        this.viewContactsList = result;
        this.totalCount = this.viewContactsList.length;
                 console.log('This is total count' + this.totalCount);
        console.log('This is related contacts : ' + this.viewContactsList);
      })
      this.template.querySelector('.mainDiv').style.display = 'none';
      this.template.querySelector('.childComponent').style.display = 'block';
  }

  showId(event){

      if(event.target.checked){
        this.checkedContacts.push( event.target.value);
      }
      else{
          const index = this.checkedContacts.indexOf(event.target.value);
          console.log('This is the index : ' + index);
          this.checkedContacts.splice(index, 1);
      }
    console.log('This is checkbox value : '+this.checkedContacts);
  }

  checkAll(event){
      let i;
      let j;
      this.checkedContacts = [];
      let checkboxes = this.template.querySelectorAll('[data-id="check"]');

      for(i = 0; i < checkboxes.length; i++ ){
          checkboxes[i].checked = event.target.checked;
          
          
      }
      for(j = 0; j < this.viewContactsList.length; j++){
        this.checkedContacts.push(this.viewContactsList[j].Id);
        console.log('Incoming IDs : ' + this.viewContactsList[j].Id);
      }
      console.log('These are all IDs : ' + this.checkedContacts);
  }
  filtering(event){
      this.filteringName = event.detail.value;
      viewRecords({
        query : this.query,
        filterByName : this.filteringName,
        listOfRecordType:this.valueCheckbox,
        allRecordType : this.allRecordType,
      })
      .then(result => {
        this.viewContactsList = result;
        this.totalCount = this.viewContactsList.length;
                 console.log('This is total count' + this.totalCount);
        console.log('This is related contacts : ' + this.viewContactsList);
      })
  }
}