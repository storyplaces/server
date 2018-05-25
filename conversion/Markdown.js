/**
 * Created by kep1u13 on 20/04/2017.
 */

"use strict";

exports.render = render;

let marked = require('marked');
let renderer = new marked.Renderer();

let canEmbedYouTube;
let canKeepScript;

renderer.image = function (href, title, text) {
    return "";
};

renderer.paragraph = function (text) {
    if (text.match(/^@@(.+)$/)) {
        let id = text.replace(/^@@/g, '');
        let element = `<iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        return `<div class="youtube-container">${element}</div>`;
    }

    return '<p>' + text + '</p>\n';
};

marked.setOptions({
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});

function render(markdown) {
    return marked(markdown);
}
