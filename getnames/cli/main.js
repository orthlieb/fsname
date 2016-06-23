#!/usr/bin/env node

var directory = require('node-dir');
var program = require('commander');
var cheerio = require('cheerio');
var fs = require('fs');
var _ = require('underscore');

function Scooper(data) {
    this.cursor = 0;
    this.data = data;
    this.result = null;
    this.scoop = function(tagStart, tagEnd) {
        // Scoop out the middle of a begin/end tag.
        this.result = null;
        var start = this.data.indexOf(tagStart, this.cursor);
        if (start == -1)
            return false;
        var end = this.data.indexOf(tagEnd, start + tagStart.length);
        if (end == -1)  // Half a tag
            return false;
        this.cursor = end;
        this.result = this.data.slice(start + tagStart.length, end);
        this.result = this.result.replace(/(<([^>]+)>)/igm, ''); // strip HTML
        this.result = this.result.trim();
        return true;
    },
    this.find = function(tag) {
        var location = this.data.indexOf(tag, this.cursor);
        if (location == -1)
            return false;
        this.cursor = location + tag.length;
        this.result = tag;
        return true;
    }
}

program
    .version('0.0.1')
    .command('getnames <dir>')
    .action(function (dir) {
        directory.files(dir, function(err, files) {
            if (err) throw err;

            // We have an array of files now, so now we'll iterate that array
            files.forEach(function(path) {
                console.log('getnames %s', path);
                fs.readFile(path, 'utf8', function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    try {
                        var s = new Scooper(data);
                        var row = "";
                        s.scoop('<div class="namemain">Given Name ', '</div>');
                        row += s.result;
                        row += "," + s.find('<span class="masc">') ? "MALE" : "FEMALE");
                        s.scoop('<div style="padding:3px;padding-left:10px;">', '</div>');
                        row += "," + s.result;
                        console.log(row);
                    } catch (err) {
                        console.log(err.message);
                    }
                });
            });
        });
    });
program.parse(process.argv);

// free memory associated with the window
//   <div class="namemain">Given Name 'AAMIR</div>
//   <div class="nameinfo" valign="top">
//         <div class="namesub">
//             <span class="namesub">GENDER:</span>
//             <span class="info">
//                 <span class="masc">Masculine</span>
//             </span>
//         </div>
//         <div class="namesub">
//             <span class="namesub">USAGE:</span>
//             <span class="info"><a href="/names/usage/arabic" class="usg">Arabic</a></span>
//         </div>
//         <div class="namesub">
//             <span class="namesub">OTHER SCRIPTS:</span>
//             <span class="info"><a href="/support/transcribe.php?type=AR&target=%22Ami%21r" class="trn">&#1593;&#1575;&#1605;&#1585;</a> <b>(Arabic)</b></span>
//         </div>
//     </div>
//     <div class="namemain" style="clear:none">Meaning & History</div>
//     <div style="padding:3px;padding-left:10px;">
//         Means "prosperous, substantial" in Arabic.
//     </div>
//     <div class="namemain" style="clear:both">Related Names</div>
//     <div class="nameinfo">
//         <div class="namesub">
//             <span class="namesub">SAME SPELLING:</span>
//             <span class="info"><a href="/name/aamir" class="ngl">Aamir</a></span>
//         </div>
//     </div>
