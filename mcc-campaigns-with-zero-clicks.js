/* 
Name: MCC Level AdWords script to list accounts with campaigns with zero clicks

Description: Script is checking MCC for campaigns with zero clicks on child accounts.
             Results are storing in log console and sending by e-mail.

Version: 1.0 

Author: Michal Brys (www.michalbrys.com)
*/

function main() {

    /* =======  Configure script ======== */      
    
    // Check accounts with criteria in date range
    var DATE_RANGE_TO_CHECK = "TODAY"; 
    
    /* Example values: 
    TODAY, YESTERDAY, LAST_7_DAYS, THIS_WEEK_SUN_TODAY, 
    LAST_WEEK, LAST_14_DAYS, LAST_30_DAYS, LAST_BUSINESS_WEEK, 
    LAST_WEEK_SUN_SAT, THIS_MONTH, LAST_MONTH, ALL_TIME */      
      
    // Check accounts with condition
    // Criteria works with AND operator  
    var CONDITION = "LabelNames CONTAINS 'your-label'";
      
    /* Example values: 
    Impressions > 100
    Clicks > 300
    LabelNames CONTAINS 'ACCOUNT_LABEL'
    */
    
    // Optional: uncomment line 35 and line 57 to check particular IDs
    //  var WITH_IDS = ['123-456-7890'];
      
    /* Example values: 
    WITH_IDS = ['123-456-7890']
    WITH_IDS = ['123-456-7890','123-456-7890']
    */
    
    // Email to send results
    var E_MAIL = "your-email-address@gmail.com";
    
    // Script name to display in e-mail subject  
    var SCRIPT_NAME = "AdWords: Campaigns with zero clicks";  
      


    /* =======  Script Code ======== */    
      
    // Keep track of the MCC account for future reference.
    var mccAccount = AdWordsApp.currentAccount();
    
    // Select your accounts
    var accountSelector = MccApp.accounts()
        //.withIds(WITH_IDS) // enable check of particular IDs 
        .withCondition(CONDITION)
        .forDateRange(DATE_RANGE_TO_CHECK);
    
    var summaryEmailData = [];
      
    var accountIterator = accountSelector.get();
    
    // Iterate through the list of accounts
    while (accountIterator.hasNext()) {
        var account = accountIterator.next();
    
        // Select the client account
        MccApp.select(account);
    
        // Select campaigns under the client account with zero resukts today
        var campaignIterator = AdWordsApp.campaigns().withCondition('Clicks = 0').withCondition("Status = ENABLED").forDateRange('TODAY').get();
      
        // Operate on client account
        while (campaignIterator.hasNext()) {
            var campaign = campaignIterator.next();
            var stats = campaign.getStatsFor('TODAY');
            var accountName = account.getName() ? account.getName() : '--';
            var accountId = account.getCustomerId();
            var campaignName = campaign.getName(); 
            var clicks = stats.getClicks().toFixed(0);
            var impressions = stats.getImpressions().toFixed(0);
         
            Logger.log('%s,%s,%s,%s,%s', accountId ,accountName, campaignName, clicks, impressions);
         
            summaryEmailData.push({
                'accountId': accountId,
                'accountName': accountName,
                'campaignName': campaignName,
                'clicks': clicks,
                'impressions': impressions     
            });
        }
    }
    
    // Switch back to MCC account
    MccApp.select(mccAccount);
    
    // Send e-mail with results
    if(summaryEmailData.length > 0) {
        sendSummaryEmail(summaryEmailData);
      }
      
        function sendSummaryEmail(summaryEmailData) {
            var subject = SCRIPT_NAME+'';
            var body = subject;
            var htmlBody = '<html><body>'+subject;
        
            htmlBody += '<br/ ><br/ >';
            htmlBody += '<table border="1" width="95%" style="border-collapse:collapse;">';
            htmlBody += '<tr>';
            htmlBody += '<td align="left"><b>Account</b></td>';
            htmlBody += '<td align="left"><b>Campaign</b></td>';
            htmlBody += '<td align="center"><b>Clicks</b></td>';
            htmlBody += '<td align="center"><b>Impressions</b></td>';
            htmlBody += '</tr>';
        
            for(var i in summaryEmailData) {
                var row = summaryEmailData[i];
                htmlBody += '<tr><td align="left">' + row.accountName + 
                     '</td><td align="left">' + row.campaignName + 
                     '</td><td align="center">' + row.clicks + 
                     '</td><td align="center">' + row.impressions +  
                     '</td></tr>';
            }
        
            htmlBody += '</table>';
            htmlBody += '<br/ >';
            htmlBody += Utilities.formatDate(new Date(),AdWordsApp.currentAccount().getTimeZone(),'MMMM dd, yyyy @ hh:mma z');
            htmlBody += '</body></html>';
            var options = { htmlBody : htmlBody };
            
            // Send e-mail with results
            MailApp.sendEmail(E_MAIL, subject, body, options);
      }
}