var request = require('request');
var cheerio = require('cheerio');
var factory = require('./factory');

var url_prefix = factory.url_prefix;
var limit = factory.comment_limit;
var use_limit = factory.use_limit;

/**
 * Get the full comments page for a kickstarter project.
 * Callback sends a JSON object which is an array of comment objects.
 */
exports.getKickstarterComments = function(ks_url, cb){
    ks_url = ks_url + "/comments";
    var comments_blob = factory.create();
    comments_blob = [];
    var options = factory.getOptions(ks_url);
    request(options, function(err, resp, body){
        var $ = cheerio.load(body);
        
        //Iterate through all comment items
        iterateThroughCommentContent($, function(comments_blob){
            //Send back array of comments.
            cb(comments_blob);
        });
    });
}

/**
 * Go through the comments web-page and fetch comment details and contents.
 * Currently ONLY retreives Contributor comments.
 * Callback sends a JSON blob of comments gotten.
 * JSON blob is a single JSON object which is an array of comment objects.
 * 
 * @param {*} blob The webpage code to iterate through, containing all comments.
 * @param {*} cb The array of comments objects. JSON data.
 */
function iterateThroughCommentContent(blob, cb){
    var comments_blob = [];
    blob('.collaborator').each(function(){
        //URL extension of the comment. DOES NOT CONTAIN "www.kickstarter.com/"
        var commentURL = blob(this).find('.grey-dark').attr('href');
        //Add url_prefix to construct full URL of the comment.
        commentURL = url_prefix + commentURL;
        //Date-Time in "Y-M-DT00:00:00-00:00" format where "-00:00" is offset from GMT
        var commentDateTimeItem = blob(this).find('data').attr('data-value');
        //For some reason this specific Date-Time item was enclosed in quotes, so get rid of quotes.
        commentDateTimeItem = commentDateTimeItem.replace(/\"/g, "");
        //Change Date-Time format to Unix milliseconds.
        var commentTime = factory.getTimeFromDate(commentDateTimeItem);
        //The avatar image used by the commentor.
        var commentAvatar = blob(this).find('img').attr('src');
        var commentAuthorItem = blob(this).find('.author');
        //The text contained in the author section. This is the name of the commentor.
        var commentAuthor = commentAuthorItem.text();
        //The ID of the comment.
        var commentID = blob(this).attr('id');
        var commentTextItem = blob(this).find('p');
        //The actual text contents of the comment (The comment itself).
        var commentText = commentTextItem.text();

        //If commentText is empty, then we can't see it publicly. Most likely because is because it is only visible to backers.
        if(commentText == "" || commentText == undefined){
            commentText = "This comment may be a backer-only comment"
        }

        commentText = commentText + " [Read more](" + commentURL + ")";
        

        //Construct JSON comment object
        var comment = {
            "name": commentAuthor,
            "avatar": commentAvatar,
            "comment_id": commentID,
            "comment_time": commentTime,
            "comment_url": commentURL,
            "comment_blurb": commentText
        }

        //If we are using a limit, only push comments to comment-array if the limit has not been reached.
        if(use_limit == true){
            if(comments_blob.length < limit){
                comments_blob.push(comment);
            }
        }
        else{
            comments_blob.push(comment);
        }

    });

    //Callback sends comment-array.
    cb(comments_blob);
}