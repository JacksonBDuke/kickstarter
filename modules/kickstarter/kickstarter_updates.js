var request = require('request');
var cheerio = require('cheerio');
var factory = require('./factory');

var url_prefix = factory.url_prefix;
var limit = factory.update_limit;
var use_limit = factory.use_limit;

/**
 * Get the updates web-page for a specific project URL.
 * Callback sends a JSON object array of updates.
 */
exports.getKickstarterUpdates = function(ks_url, cb){
    ks_url = ks_url + "/updates";
    var updates_blob = factory.create();
    updates_blob = [];
    var options = factory.getOptions(ks_url);
    request(options, function(err, resp, body){
        var $ = cheerio.load(body);
        
        //Go through all updates
        iterateThroughUpdateContent($, function(updates_blob){
            //Send back array of updates
            cb(updates_blob);
        });
    });
}

/**
 * Go through updates web-page and fetch update details and contents.
 * ONLY fetches the smaller blurb that is displayed on the general updates page.
 * The user is expected to click on the "Read more" link to go to the full page if they want.
 * 
 * @param {*} blob The webpage code to iterate through, containing all updates.
 * @param {*} cb The array of comments objects. JSON data.
 */
function iterateThroughUpdateContent(blob, cb){
    var updates_blob = [];
    blob('.link').each(function(){
        var updateURL = blob(this).attr('href');
        //Date-Time in "Y-M-DT00:00:00-00:00" format where "-00:00" is offset from GMT
        var updateDateTimeItem = blob(this).find('p time').attr('datetime');
        //Change Date-Time format to Unix milliseconds.
        var updateTime = factory.getTimeFromDate(updateDateTimeItem);
        //Update title.
        var updateTitle = blob(this).find('.grid-post__title');
        var updateTitleText = updateTitle.text();
        updateTitleText = updateTitleText.replace(/[\r\n]/g, "")
        //Contents of the update message.
        var updateTextItem = blob(this).find('.grid-post__content p');
        var updateText = updateTextItem.text();
        //Include a discord-formatted text-link to original Update.
        updateText = updateText.replace("Read more", "[Read more](" + url_prefix + updateURL + ")");

        //If updaetText is empty, then we can't see it publicly. Most likely because is because it is only visible to backers.
        if(updateText == "" || updateText == undefined){
            updateText = "This update may be a backer-only update [Read more](" + url_prefix + updateURL + ")";
        }

        //Construct update JSON part
        var updatePart = {
            "update_url": url_prefix + updateURL,
            "update_time": updateTime,
            "update_title": updateTitleText,
            "update_blurb": updateText
        }
        
        //If we are using a limit, then only push to updates array if the limit has not been reached.
        if(use_limit == true){
            if(updates_blob.length < limit){
                updates_blob.push(updatePart);
            }
        }
        else{
            updates_blob.push(updatePart);
        }
    });
    cb(updates_blob);
}