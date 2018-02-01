var request = require('request');
var factory = require('../kickstarter/factory.js');

var discordURL = "REDACTED";
var url_prefix = factory.url_prefix;

exports.Post = function(discordUsername, discordAvatar, discordContent){
    request({
        method: 'POST',
        url: discordURL,
        json: {
            "content": discordContent,
            "username": discordUsername,
            "avatar_url" : discordAvatar
        }
    });
};

// Name, Avatar, Link to profile, Initialize message
exports.InitializeMessage = function(passed_name, avatar_url, profile_url, message){
    request({
        "method": 'POST',
        "url": discordURL,
        "json":{
            "embeds":[
                {
                    "url": profile_url,
                    "author":{
                        "name": passed_name,
                        "icon_url": avatar_url
                    },
                    "fields":[
                        {
                            "name": "Kickstarter",
                            "value": message
                        }
                    ]
                }
            ]
        }
    })
}

exports.Pass = function(passed_json){
    request({
        "method": 'POST',
        "url": discordURL,
        "json":{
            "embeds":[
                {
                    "title": passed_json.project_name,
                    "url": passed_json.project_url,
                    "author":{
                        "name": passed_json.creator_name,
                        "icon_url": passed_json.creator_avatar
                    },
                    "fields":[
                        {
                            "name": passed_json.posts[0].post_title,
                            "value": passed_json.posts[0].post_blurb
                        }
                    ]
                }
            ]
        }
    })
}

exports.NewProjectMessageIndex = function(passed_json, project_index){
    var project_url = url_prefix + "/projects/" + passed_json.slug + "/" + passed_json.projects[project_index].slug + "/"
    var theEmbeds = [
        {
            "url": project_url,
            "author":{
                "name": passed_json.creator + " Kickstarter",
                "icon_url": passed_json.avatar
            },
            "fields":[
                {
                    "name": "New Project: " + passed_json.projects[project_index].name,
                    "value": "[" + passed_json.projects[project_index].blurb + "](" + project_url + ")"
                }
            ]
        }
    ];

    if(passed_json.projects[project_index].updates.length > 0){
        var theUpdates = [];
        for(var i = 0; i < passed_json.projects[project_index].updates.length; ++i){
            theUpdates.push(
                {
                    "name": passed_json.projects[project_index].updates[i].update_title,
                    "value": passed_json.projects[project_index].updates[i].update_blurb
                }
            );
        }

        theEmbeds.push({
            "url": project_url + "/updates",
            "author":{
                "name": passed_json.projects[project_index].name + " Updates",
                "icon_url": passed_json.avatar
            },
            "fields": theUpdates
        });
    }
    if(passed_json.projects[project_index].comments.length > 0){
        var theComments = [];
        for(var i = 0; i < passed_json.projects[project_index].comments.length; ++i){
            theComments.push(
                {
                    "name": passed_json.projects[project_index].comments[i].name,
                    "value": passed_json.projects[project_index].comments[i].comment_blurb
                }
            );
        }

        theEmbeds.push({
            "url": project_url + "/comments",
            "author":{
                "name": passed_json.projects[project_index].name + " Comments",
                "icon_url": passed_json.avatar
            },
            "fields": theComments
        });
    }

    request({
        "method": 'POST',
        "url": discordURL,
        "json":{
            "embeds": theEmbeds
        }
    });
}

exports.NewCommentMessageIndex = function(passed_json, project_index, comment_index){
    var json_to_send = {
        "embeds":[
            {
                "title": "New contributor comment on " + passed_json.projects[project_index].name,
                "url": url_prefix + "/projects/" + passed_json.slug + "/" + passed_json.projects[project_index].slug + "/",
                "author":{
                    "name": passed_json.projects[project_index].comments[comment_index].name,
                    "icon_url": passed_json.projects[project_index].comments[comment_index].avatar
                },
                "fields":[
                    {
                        "name": passed_json.projects[project_index].comments[comment_index].name,
                        "value": passed_json.projects[project_index].comments[comment_index].comment_blurb
                    }
                ]
            }
        ]
    }

    request({
        method: 'POST',
        url: discordURL,
        json:json_to_send
        /*{
            embeds:[
                {
                    title: "New contributor comment on " + passed_json.projects[project_index].name,
                    url: url_prefix + "/projects/" + passed_json.slug + "/" + passed_json.projects[project_index].slug + "/",
                    author:{
                        name: passed_json.projects[project_index].comments[comment_index].name,
                        icon_url: passed_json.projects[project_index].comments[comment_index].avatar
                    },
                    fields:[
                        {
                            name: passed_json.projects[project_index].comments[comment_index].name,
                            value: passed_json.projects[project_index].comments[comment_index].comment_blurb
                        }
                    ]
                }
            ]
        }*/
    });
}

exports.NewUpdateMessageIndex = function(passed_json, project_index, update_index){
    var json_to_send = {
        "embeds":[
            {
                //description: "This is to test what the description field looks like",
                "title": "New update for " + passed_json.projects[project_index].name,
                "url": url_prefix + "/projects/" + passed_json.slug + "/" + passed_json.projects[project_index].slug + "/",
                "author":{
                    "name": passed_json.creator,
                    "icon_url": passed_json.avatar
                },
                "fields":[
                    {
                        "name": passed_json.projects[project_index].updates[update_index].update_title,
                        "value": passed_json.projects[project_index].updates[update_index].update_blurb
                    }
                ]
            }
        ]
    }

    //console.log(JSON.stringify(json_to_send));

    request({
        method: 'POST',
        url: discordURL,
        json:json_to_send
    });
}

exports.NewProjectMessage = function(passed_json){
    request({
        "method": 'POST',
        "url": discordURL,
        "json":{
            "embeds":[
                {
                    "url": passed_json.project_url,
                    "author":{
                        "name": passed_json.creator_name + " Kickstarter",
                        "icon_url": passed_json.creator_avatar
                    },
                    "fields":[
                        {
                            "name": passed_json.project.name,
                            "value": passed_json.project.blurb
                        }
                    ]
                }
            ]
        }
    });
}

exports.NewCommentMessage = function(passed_json){
    request({
        "method": 'POST',
        "url": discordURL,
        "json":{
            "embeds":[
                {
                    "title": "New contributor comment on " + passed_json.project.name,
                    "url": url_prefix + "/projects/" + passed_json.slug + "/" + passed_json.project.slug + "/",
                    "author":{
                        "name": passed_json.comment.name,
                        "icon_url": passed_json.comment.avatar
                    },
                    "fields":[
                        {
                            "name": passed_json.comment.name,
                            "value": passed_json.comment.comment_blurb
                        }
                    ]
                }
            ]
        }
    });
}

exports.NewUpdateMessage = function(passed_json){
    request({
        "method": 'POST',
        "url": discordURL,
        "json":{
            "embeds":[
                {
                    "title": "New update for " + passed_json.project.name,
                    "url": url_prefix + "/projects/" + passed_json.slug + "/" + passed_json.project.slug + "/",
                    "author":{
                        "name": passed_json.creator,
                        "icon_url": passed_json.avatar
                    },
                    "fields":[
                        {
                            "name": passed_json.project.update.update_title,
                            "value": passed_json.project.update.update_blurb
                        }
                    ]
                }
            ]
        }
    });
}

exports.NewPreformattedMessage = function(passed_json){
    request({
        "method": 'POST',
        "url": discordURL,
        "json": passed_json
    });
}