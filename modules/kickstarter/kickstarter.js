const ks_projects = require('./kickstarter_projects.js');
const ks_comments = require('./kickstarter_comments.js');
const ks_updates = require('./kickstarter_updates.js');
const factory = require('./factory.js');

var url_prefix = factory.url_prefix;
var counter = 0;

exports.go = function(url_created, cb){
    counter = 0;
    ks_projects.getKickstarterBlob(url_created, function(JSON_BLOB_PROJECTS){
        console.log("Getting updates for kickstarter profile \"" + JSON_BLOB_PROJECTS.slug + "\"...");

        JSON_BLOB_PROJECTS.projects.forEach(function(element){
            
            var project_url = url_prefix + "/projects/" + JSON_BLOB_PROJECTS.slug + "/" + element.slug;
            ks_comments.getKickstarterComments(project_url, function(JSON_BLOB_COMMENTS){
                var temp_comments = factory.create();
                temp_comments = JSON_BLOB_COMMENTS;
                element.comments = temp_comments;

                ks_updates.getKickstarterUpdates(project_url, function(JSON_BLOB_UPDATES){
                    var temp_updates = factory.create();
                    temp_updates = JSON_BLOB_UPDATES;
                    element.updates = temp_updates;
                    ++counter;

                    console.log("\tProject \"" + element.slug + "\" " + counter + " of " + JSON_BLOB_PROJECTS.projects.length + " done.");
                    
                    if(counter == JSON_BLOB_PROJECTS.projects.length){
                        cb(JSON_BLOB_PROJECTS);
                    }
                });
            });
        });
    });
}