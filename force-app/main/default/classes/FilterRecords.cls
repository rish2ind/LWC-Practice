public with sharing class FilterRecords {

    @AuraEnabled(cacheable=true)
    public static List<RecordType> getRecords(String objName){
        List<RecordType> recordTypeList = [SELECT  Id, Name FROM RecordType WHERE sObjectType=:objName];
        return recordTypeList;
    }

    @AuraEnabled(cacheable=true)
    public static List<sObject> countRecords(String objName){
        
        String totalRecords = 'Select COUNT(Id) from ' + objName;
        List<sObject> tRecords = Database.query(totalRecords);
        return tRecords;
    }
    @AuraEnabled(cacheable=true)
    public static Map<String,Integer> filterNames(String query, list<String> listOfRecordType, list<String> allRecordType){
        String p;
        Map<String,Integer> mapOfCount= new Map<String,Integer>();
            String query1='SELECT RecordType.Name r, Count(Id) c FROM '+query;
           

            query1+=' GROUP BY RecordType.Name ';
            AggregateResult[] groupedResults;
            System.debug('query '+query1);
            groupedResults=Database.query(query1);
            integer count=0;
            for(integer i=0;i<allRecordType.size();i++)
            {
                mapOfCount.put(allRecordType[i],0);
            }
            for(AggregateResult ar : groupedResults){
                system.debug('RT Name '+ar.get('r') + ' count '+ar.get('c'));
                count+=Integer.valueOf(ar.get('c'));
                for(integer j=0;j<listOfRecordType.size();j++)
                {
                    if(listOfRecordType[j]==ar.get('r'))
                    {
                        mapOfCount.put(listOfRecordType[j],Integer.valueOf(ar.get('c')));
                       
                        break;
                    }
               }             
            }
            mapOfCount.put('Total Results ',count);
          
            System.debug(mapOfCount);
            return mapOfCount;
    }
    @AuraEnabled(cacheable=true)
    public static Map<String,Integer> accountContact(String name){
        Map<String,Integer> mapOfCount= new Map<String,Integer>();

        String accountString = 'Select Id from Account where Name like \'%'+name+'%\'';
        List<Account> accList = Database.query(accountString);
        Set<Id> setId = new Set<Id>();
        for(Account acc : accList){
            setId.add(acc.Id);
        }
        integer count = 0;
        System.debug('This is account Id : ' + setId);
        AggregateResult[] countContact = [Select RecordType.Name r, COUNT(Id) c FROM Contact where accountId in :setId GROUP BY RecordType.Name];
        System.debug('This is the list of Contact : ' + countContact);
       
        for(AggregateResult ar : countContact){
            system.debug('RT Name '+ar.get('r') + ' count '+ar.get('c'));
            count+=Integer.valueOf(ar.get('c'));
            
            if((String)ar.get('r') != null){
                mapOfCount.put((String)ar.get('r'),Integer.valueOf(ar.get('c')));
            }
        }
            mapOfCount.put('Total Count', count);
            System.debug('This is total count : ' + mapOfCount);
            return mapOfCount;
    }
    // @AuraEnabled(cacheable=true)
    // public static List<Contact> viewContacts(String name){
    //     String accountString = 'Select Id from Account where Name like \'%'+name+'%\'';
    //     List<Account> accList = Database.query(accountString);
    //     Set<Id> setId = new Set<Id>();
    //     for(Account acc : accList){
    //         setId.add(acc.Id);
    //     }
    //     List<Contact> conList = [Select Name from Contact where accountId in :setId];
    //     System.debug('This is contact list : ' + conList);
    //     return conList;
    // }
    @AuraEnabled(cacheable=true)
    public static List<sObject> viewRecords(String query, list<String> listOfRecordType, list<String> allRecordType){
        String p;
        String query1='SELECT Name FROM '+ query;
        

        
        List<sObject> groupedResults = Database.query(query1);
        // System.debug('query '+query);
        // groupedResults=Database.query(query);
        // integer count=0;
        
        return groupedResults;
    }
}
