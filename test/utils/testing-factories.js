exports.basicPage = basicPage;
exports.basicChapter = basicChapter;
exports.basicReadingStory = basicReadingStory;

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

