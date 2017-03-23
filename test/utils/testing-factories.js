exports.basicPage = basicPage;
exports.basicChapter = basicChapter;
exports.basicReadingStory = basicReadingStory;
exports.basicAuthoringStory = basicAuthoringStory;

function basicChapter(id, name) {
    return {
        id: id,
        name: name || "Test Chapter",
        colour: "blue",
        pageIds: [],
        allowMultipleReadings: false,
        unlockedByPageIds: [],
        unlockedByPagesOperator: "and",
        locksAllOtherChapters: false,
        locksChapterIds: []
    };
}

function basicPage(id, name) {
    return {
        id: id,
        name: name || "New Page",
        content: "",
        pageHint: "",
        locationId: "",
        allowMultipleReadings: false,
        unlockedByPageIds: [],
        unlockedByPagesOperator: "and",
        finishesStory: false
    };
}

function basicReadingStory(id, title) {
    return {
        id: id,
        title: title,
        conditions: [],
        pages: [],
        functions: [],
        locations: []
    };
}

function basicAuthoringStory(id, title, description, audience, tags) {
    return {
        id: id,
        title: title,
        description: description,
        audience: audience,
        tags: tags
    }
}

