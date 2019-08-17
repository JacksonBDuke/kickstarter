const fs = require('fs');

exports.url_prefix = 'https:\/\/www.kickstarter.com';
exports.project_limit = 5;
exports.comment_limit = 10;
exports.update_limit = 5;
exports.use_limit = true;

function emptyVar(){
    
}
    
exports.create = function(){
        return new emptyVar;
}

/**
 * Changes Date-Time format from "Y-M-DT00:00:00-00:00" format where "-00:00" is offset from GMT
 * to UNIX milliseconds format.
 */
exports.getTimeFromDate = function(date){
    var dateItem = new Date(date);
    return dateItem.getTime();
}

exports.getOptions = function(url_passed){
    var options = {
        url: url_passed,
        headers:{
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        }
    };
    return options;
}