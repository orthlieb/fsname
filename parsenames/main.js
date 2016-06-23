#!/usr/bin/env node

var directory = require('node-dir');
var program = require('commander');
var cheerio = require('cheerio');
var fs = require('fs');
var _ = require('underscore');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

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
            if (end == -1) // Half a tag
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

String.prototype.toTitleCase = function() {
    var i, j, str, lowers, uppers;
    str = this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Certain minor words should be left lowercase unless
    // they are the first or last words in the string
    lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
        'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'
    ];
    for (i = 0, j = lowers.length; i < j; i++)
        str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
            function(txt) {
                return txt.toLowerCase();
            });

    // Certain words such as initialisms or acronyms should be left uppercase
    uppers = ['Id', 'Tv'];
    for (i = 0, j = uppers.length; i < j; i++)
        str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
            uppers[i].toUpperCase());

    return str;
}

program
    .version('0.0.1')
    .command('getnames <dir>')
    .action(function(dir) {
        directory.files(dir, function(err, files) {
            if (err) throw err;

            var SEP = "\t";
            console.log("name" + SEP + "gender" + SEP + "meaning");

            for (i in files) {
                // We have an array of files now, so now we'll iterate that array
                //            console.log(files[i]);
                var data = fs.readFileSync(files[i], 'utf8');
                try {
                    var s = new Scooper(data);
                    var row = "";
                    s.scoop('<div class="namemain">Given Name ', '</div>');
                    row += s.result.toTitleCase();
                    var gender = s.find('<span class="masc">') ? 0 : 1;
                    s.scoop('<div style="padding:3px;padding-left:10px;">', '</div');
                    var meaning = entities.decode(s.result.replace("Expand Name Links", "").trim());
                    row += SEP + meaning;
                    row += SEP + gender;
                    console.log(row);
                } catch (err) {
                    console.error(files[i], err.message);
                }
            }
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
