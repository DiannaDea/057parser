var express = require('express');
var router = express.Router();
var parser = require('rss-parser');
var request = require("request");
var cheerio = require("cheerio");

/* GET home page. */


router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get("/feed/:count", (req, res) => {

    getLinks(req.params.count).then(links => {
        Promise.all(links.map(link => parseHTML(link))).then(feed => {
            console.log(feed);
            res.render('index', {feed: feed});
        })
    });
});

function getLinks(count) {

    return new Promise(function (resolve, reject) {
        const links = [];
        parser.parseURL('https://www.057.ua/rss', function (err, parsed) {
            const slice_parsed = parsed.feed.entries.slice(0, count);
            slice_parsed.map(item => {
                links.push(item.link);
            });
            resolve(links);
        });
    })
}



function parseHTML(link) {
    return new Promise(function (resolve, reject) {
        request(link, function (error, response, body) {
            if (!error) {
                let $ = cheerio.load(body);
                let title = $(".title-container h1").text();
                let text = $(".article-text p").text();
                let image_src = $(".article-photo--main img").attr("src");
                let new_obj = ({title: title, text: text, link: link});
                resolve(new_obj);
            } else {
                console.log("Произошла ошибка: " + error);
            }
        });
    })
}

module.exports = router;
