const request = require('request');
const cheerio = require('cheerio');
const ks_comments = require('./kickstarter_comments.js');
const ks_updates = require('./kickstarter_updates.js');
const factory = require('./factory.js');

var url_prefix = factory.url_prefix;
var limit = factory.project_limit;
var use_limit = factory.use_limit;


/*
    Fetch list of all projects made by a creator profile given by URL.
*/
exports.getKickstarterBlob = function(ks_url, cb){
    var ks_blob = factory.create();
    var temp_projects = [];
    var options = factory.getOptions(ks_url);
    request(options, function(err, resp, body){
        var $ = cheerio.load(body);
        var dataProjectsBlob = $("#react-profile-created").attr("data-projects");
        var projectsJSON = JSON.parse(dataProjectsBlob);
        var kickstarterAvatar = projectsJSON[0].creator.avatar.medium;
        kickstarterAvatar = kickstarterAvatar.replace("amp;", "");

        iterateThroughProjectContent(projectsJSON, function(temp_projects){
            ks_blob = {
                "creator": projectsJSON[0].creator.name,
                "slug": projectsJSON[0].creator.slug,
                "avatar": kickstarterAvatar,
                "projects": temp_projects
            }
            cb(ks_blob);
        });
    });
}

/*
    Iterate through the contents of the kickstarter project page.
    Get Updates, Comments, and save it all to a JSON.
*/
function iterateThroughProjectContent(blob, cb){
    var projects_blob = [];
    blob.forEach(function(element){
        var projectInfo = factory.create();
        projectInfo =  {
            "name": element.name,
            "blurb": element.blurb,
            "state": element.state,
            "slug": element.slug,
            "state": element.state,
            "deadline": element.deadline,                       //Unix timecode integer
            "state_changed_at": element.state_changed_at,       //Unix timecode integer
            "created_at": element.created_at,                   //Unix timecode integer
            "launched_at": element.launched_at,                 //Unix timecode integer
            "updates": [],
            "comments": []
        };
        if(use_limit == true){
            if(projects_blob.length < limit){
                projects_blob.push(projectInfo);
            }
        }
        else{
            projects_blob.push(projectInfo);
        }
    });
    cb(projects_blob);
}