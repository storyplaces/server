Array.prototype.getById = function (searchId) {
    var results = this.filter(function (item) {
        return (item.id != undefined) && (item.id == searchId);
    })

    if (results.length > 1) {
        throw new Error("More than one match");
    }

    if (results.length == 0) {
        return undefined;
    }

    return results[0];
};

Array.prototype.contains = function (searchItem) {
    return this.indexOf(searchItem) != -1;
};

