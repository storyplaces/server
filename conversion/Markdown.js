/**
 * Created by kep1u13 on 20/04/2017.
 */

"use strict";

exports.render = render;

let marked = require('marked');
let renderer = new marked.Renderer();

renderer.image = function (href, title, text) {
    return "";
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