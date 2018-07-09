const fs = require('fs');
const yargs = require('yargs');
const kickstarter = require('./modules/kickstarter/kickstarter');
const utils = require('./modules/utils');
const discord = require('./modules/discord/discord');

const argv = yargs
    .options({
        w: {
            demand: true,
            alias: 'wurl',
            describe: 'Webhook URL of Discord server.',
            string: true
        },
        a: {
            demand: true,
            alias: 'address',
            describe: 'URL of Kickstarter profile to track.',
            string: true
        }
    })
    .help()
    .alias('help', 'h')
    .argv;

const url_created = argv.a + '/created';
var JSON_OLD;

/**
 * 
 * @param {*} url_created 
 * @param {*} cb 
 */
function getCurrentProjectList(url_created, cb){
    kickstarter.go(url_created, function(JSON_BLOB_PROJECTS){
        cb(JSON_BLOB_PROJECTS);
    });
}

/**
 * 
 * @param {*} url_created 
 * @param {*} cb 
 */
function loopThrough(url_created, cb){
    getCurrentProjectList(url_created, function(JSON_CURRENT){
        if(fs.existsSync(__dirname + '/ks_projects.json')){
            //Compare all
            console.log("File found... comparing contents of old to new");

            //Read contents of old JSON file to compare
            fs.readFile(__dirname + "/ks_projects.json", function(err, data){
                if(!err){
                    iterateThroughProjects(JSON_CURRENT, JSON.parse(data), function(result){
                        cb(JSON_CURRENT);
                    });
                }
                else{
                    console.log(err);
                }
            });
        }
        else{
            console.log("File does not exist... initializing.");
            utils.writeFile(JSON_CURRENT, "/ks_projects", __dirname, function(result){
                console.log(result);
            });

            //Send initialize webhook.
            // Name, Avatar, Link to profile, Initialize message
            discord.InitializeMessage(argv.w, JSON_CURRENT.creator, JSON_CURRENT.avatar, argv.a, JSON_CURRENT.creator + "'s file has been created. You should now get updates for this kickstarter profile!");
        }
    });
}

/**
 * Was originally going to use setInterval() to run the program on a set time, but probably going to go with
 * chronotab in Linux instead.
 */
//setInterval(function(){
    loopThrough(url_created, function(result){
        console.log("\tOverwriting old data.");
        utils.writeFile(result, "/ks_projects", __dirname, function(result){
            console.log(result);
        });
    });
//}, schedule);

function checkIfFileExists(file){
    return fs.existsSync(file);
}

/**
 * Go through the NEW projects and see if there is a match in the OLD projects.
 * @param {*} JSON_NEW The JSON object which contains the newly fetched project information.
 * @param {*} JSON_OLD The JSON object which contains the old saved-to-file project information.
 * @param {*} cb 
 */
function iterateThroughProjects(JSON_NEW, JSON_OLD, cb){

    
    for(var i = 0; i < JSON_NEW.projects.length; ++i){
        var projectIndex = indexOfProjectSlug(JSON_OLD.projects, JSON_NEW.projects[i].slug);
        if(projectIndex > -1){
        //Project exists already 
            //Comments?
            for(var j = 0; j < JSON_NEW.projects[i].comments.length; ++j){
                var commentIndex = indexOfCommentID(JSON_OLD.projects[projectIndex].comments, JSON_NEW.projects[i].comments[j].comment_id);
                if(commentIndex == -1){
                    //Send comment update
                    discord.NewCommentMessageIndex(argv.w, JSON_NEW, i, j);
                    console.log("\tNew comment: project " + i + " comment " + j);
                }
            }
            //Updates?
            for(var k = 0; k < JSON_NEW.projects[i].updates.length; ++k){
                var updateIndex = indexOfUpdateTime(JSON_OLD.projects[projectIndex].updates, JSON_NEW.projects[i].updates[k].update_time);
                if(updateIndex == -1){
                    //Send comment update
                    discord.NewUpdateMessageIndex(argv.w, JSON_NEW, i, k);
                    console.log("\tNew update: project " + i + " update " + k);
                }
            }
        }
        else{
            //New project
            discord.NewProjectMessageIndex(argv.w, JSON_NEW, i);
            console.log("\tNew project");
        }

        //If we've looped through all projects, callback.
        if(i == (JSON_NEW.projects.length - 1)){
            cb();
        }
    }
}

/**
 * Find the index of sent projects[X].slug, if it exists. If not, return -1.
 * @param {*} jsonObject The passed projects array
 * @param {*} element The projects.slug item to match.
 */
function indexOfProjectSlug(jsonObject, element){
    var ret = -1;
    for(var i = 0; i < jsonObject.length; ++i){
        if(jsonObject[i].slug == element){
            return i;
        }
    }
    return ret;
}

/**
 * Find the index of sent projects.updates[X].update_time, if it exists. If not, return -1.
 * @param {*} jsonObject The passed projects.updates array.
 * @param {*} element The update_time item to match.
 */
function indexOfUpdateTime(jsonObject, element, cb){
    var ret = -1;
    for(var i = 0; i < jsonObject.length; ++i){
        if(jsonObject[i].update_time == element){
            return i;
        }
    }
    return ret;
}

/**
 * Find the ID of sent project.comments[X].comment_id, if it exists. If not, return -1.
 * @param {*} jsonObject The passed projects.comments array.
 * @param {*} element Theh comment_time item to match.
 */
function indexOfCommentID(jsonObject, element){
    var ret = -1;
    for(var i = 0; i < jsonObject.length; ++i){
        if(jsonObject[i].comment_id == element){
            return i;
        }
    }
    return ret;
}