exports.basicChapter = basicChapter;
exports.basicPage = basicPage;

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
    }
}

