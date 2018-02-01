var fs = require('fs');

/**
 * Write contents to file of specified file-name and directory.
 */
exports.writeFile = function(blob, filename, dir, cb){
    fs.writeFile(dir + '/' + filename + '.json', JSON.stringify(blob), function(err){
        if(err){
            cb(err);
        }
        else{
            cb("\tFile written to disk.");
        }
    });
}

var commentItem = {
    "creator": "",
    "slug": "",
    "avatar": "",
    "comment": {
        "name": "",
        "avatar": "",
        "comment_id": "",
        "comment_time": "",
        "comment_url": "",
        "comment_blurb": "",
    }
};

var updateItem = {
    "creator": "",
    "slug": "",
    "avatar": "",
    "comment": {
        "name": "",
        "avatar": "",
        "update_url": "",
        "update_time": "",
        "update_title": "",
        "update_blurb": "",
    }
};