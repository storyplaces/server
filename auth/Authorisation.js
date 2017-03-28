exports.convertRolesToPrivileges = convertRolesToPrivileges;
exports.hasPrivileges = hasPrivileges;

var rolesToPrivileges = {
    "author": ["createStory", "deleteOwnStory", "editOwnStory", "requestPublicationOfOwnStory", "previewOwnStory", "listOwnStories"]
};


function convertRolesToPrivileges(roles) {
    var privileges = [];

    roles.forEach(function(role) {
        var rolePrivileges = rolesToPrivileges[role];
        if (rolePrivileges) {
            privileges = privileges.concat(rolePrivileges);
        }
    });

    return Array.from(new Set(privileges));
}

function hasPrivileges(requiredPrivileges, jwtPrivileges, match) {
    if (match === "all") {
        return allPrivilegesInJWT(requiredPrivileges, jwtPrivileges);
    }

    return anyPrivilegesInJWT(requiredPrivileges, jwtPrivileges);
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