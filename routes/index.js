const express = require('express');
const router = express.Router();

const parser = require('rss-parser');
const request = require("request");
const cheerio = require("cheerio");

const URL_RSS = 'https://www.057.ua/rss';

router.get("/news/:count", (req, res) => {
    getLinks(req.params.count, URL_RSS)
        .then(links => {
            return Promise.all(links.map(link => parseHTML(link)))
        })
        .then(feed => {
            res.render('index', {feed: feed});
        })
        .catch(error => {
            console.log(error);
        })
});

function getLinks(count, url_rss) {
    return new Promise(function (resolve, reject) {
        const links = [];
        parser.parseURL(url_rss, function (err, parsed) {
            if (!err) {
                const slice = parsed.feed.entries.slice(0, count);
                slice.map(item => {
                    links.push(item.link);
                });
                resolve(links);
            }
            else {
                reject(err);
            }
        });
    })
}

function parseHTML(link) {
    return new Promise(function (resolve, reject) {
        request(link, function (error, response, body) {
            if (!error) {
                let feed_item = getFeedFromHTML(body, link);
                resolve(feed_item);
            } else {
                reject(error);
            }
        });
    })
}

function getFeedFromHTML(body, link) {
    let $ = cheerio.load(body);
    let title = $(".title-container h1").text();
    let text = $(".article-text p:not(:last-child)").text();
    let img_src_arr = getImages($);
    return ({title: title, text: text, link: link, img: img_src_arr})
}

function getImages($) {
    let img_src_arr = [];
    let article_photo = $(".article-photo img").attr("src");
    if (article_photo !== undefined) img_src_arr.push(article_photo);
    $(".fotorama img").each(function () {
        img_src_arr.push($(this).attr("src"));
    });
    return img_src_arr;
}


module.exports = router;
