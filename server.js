let http = require("http");
let fs = require("fs");
let glob = require("glob");

let port = 3030;
let path = `http://localhost:${port}`;

// function getFiles(dir){
//     let arr = [];

//     fs.readdir(dir, (err, files) => {

//         for(let key in files){
//             if(files[key] == ".DS_Store") continue;

//             if(!files[key].match(/.*\..*/)){
//                 let nestedFiles = getFiles(dir + '/' + files[key]);

//                 for(let i = 0; i < nestedFiles.length; i++){
//                     arr.push(nestedFiles[i]);
//                 }

//                 continue;
//             }

//             arr.push(files[key]);
//         }
//     });
//     console.log(arr);

//     return arr;
// }

http.createServer(async (req, res) => {
    if(req.url === "" || req.url === "/" ){
        let file = "index.html";
        fs.readFile(file, function(err, data) {
            if(err) console.log(err);
            res.setHeader("Content-Type", "text/html; charset=utf-8;");
            res.end(data);
        })
    } else if(req.url.match(/pics/)) {
        // fs.readdir("images", (err, files) => {
        //     if(err) console.log(err);

        //     let obj = [];

        //     for(let key in files){
        //         if (files[key] == ".DS_Store") continue;

        //         obj.push(files[key]);
        //     }

        //     res.end(JSON.stringify(obj));

        // });
        // let files = getFiles("images");
        // res.end(JSON.stringify(files));

        var getDirectories = function (src, callback) {
            glob(src + '/**/*', callback);
          };
          getDirectories('images', function (err, files) {
            if (err) {
              console.log('Error', err);
            } else {
              res.end(JSON.stringify(files));
            }
          });


    } else {
        fs.readFile(req.url.substr(1), function(err, data) {
            res.end(data);
        })
    }   

}).listen(port, () => {
    console.log(path);
})