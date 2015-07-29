#! /usr/bin/env node

var fs = require('fs');
var _ = require('lodash');
var Table = require('cli-table');
var figures = require('figures');
var algoliasearch = require('algoliasearch');

var each = _.each;
var filter = _.filter;
var map = _.map;

var client = algoliasearch('MI4MSOKC78', '20dc1cdfee4ce4a4573f2a648ea97d79');
var index = client.initIndex('images');

var table = new Table({
    head: ['ID', 'Date', 'GID', 'LBB', 'Tags 3', 'Tags 2', 'Tag', 'ETags A', 'ETags B'],
    colWidths: [9, 8, 7, 5, 8, 8, 7, 9, 9]
});

function creditsContainLBB (credits) {
    return filter(credits, function (credit) {
        return credit.isLbb;
    }).length;
}

function tagsMatchingQuery (tags) {
    return filter(map(tags, function (tag) {
        switch (tag.matchLevel) {
            case 'full':
                return figures.circleFilled;
                break;
            case 'partial':
                return  figures.circleDotted;
                break;
            default:
                return false;
        }
    }));
}

function pad (n){
    return n < 10 ? '0' + n : n;
}

var currentTime = new Date();
var ym = process.argv[3] || currentTime.getFullYear() + pad(currentTime.getMonth() + 1);

index.search(process.argv[2], {
    hitsPerPage: 999,
    facetFilters: [
        'ym:' + ym
    ]
}, function searchDone(err, contents) {
    each(contents.hits, function (row) {
        table.push([row.objectID, row.ym.substring(4, 6) + '/' + row.ym.substring(2, 4), row.gid, creditsContainLBB(row.credits) ? figures.tick : figures.cross, tagsMatchingQuery(row._highlightResult.tags3).join(''), tagsMatchingQuery(row._highlightResult.tags2).join(''), tagsMatchingQuery(row._highlightResult.tags1).join(''), tagsMatchingQuery(row._highlightResult.etagsA).join(''), tagsMatchingQuery(row._highlightResult.etagsB).join('')]);
    });

    console.log(table.toString());
});