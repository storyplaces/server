"use strict;"



exports.convertRolesToPrivileges = convertRolesToPrivileges;
exports.hasPrivileges = hasPrivileges;
exports.doesNotHavePrivileges = doesNotHavePrivileges;

var rolesToPrivileges = {
    "author": ["createStory", "deleteOwnStory", "editOwnStory", "requestPublicationOfOwnStory", "previewOwnStory", "listOwnStories", "updateOwnUser", "fetchOwnUser", "getOwnImage", "uploadOwnImage", "deleteOwnImage"],
    "admin": ["getReviewStories", "updateReadingStoryPublishStatus", "deleteReadingStory", "previewAnyStory", "adminMenu", "fetchAnyStory", "requestPublicationOfAnyStory", "requestPreviewOfAnyStory", "editAnyStory"]
};


function convertRolesToPrivileges(roles) {
    var privileges = [];

    roles.forEach(function(role) {
        var rolePrivileges = rolesToPrivileges[role];
        if (rolePrivileges) {
            privileges = privileges.concat(rolePrivileges);
        }
    });

    return unique(privileges);
}

function hasPrivileges(requiredPrivileges, jwtPrivileges, match) {
    if (match === "all") {
        return allPrivilegesInJWT(requiredPrivileges, jwtPrivileges);
    }

    return anyPrivilegesInJWT(requiredPrivileges, jwtPrivileges);
}

function doesNotHavePrivileges(requiredPrivileges, jwtPrivileges, match){
    return !hasPrivileges(requiredPrivileges, jwtPrivileges, match);
}

function allPrivilegesInJWT(requiredPrivileges, jwtPrivileges) {
    return requiredPrivileges.every(function (requiredPrivilege) {
        return jwtPrivileges.indexOf(requiredPrivilege) !== -1;
    });
}

function anyPrivilegesInJWT(requiredPrivileges, jwtPrivileges) {
    return requiredPrivileges.some(function (requiredPrivilege) {
        return jwtPrivileges.indexOf(requiredPrivilege) !== -1;
    });
}

function unique(privileges) {
    return Array.from(new Set(privileges));
}
