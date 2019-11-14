let http = require("http");
let fs = require("fs");

let port = 3030;
let path = `http://localhost:${port}`;

http.createServer((req, res) => {
    if(req.url === "" || req.url === "/" ){
        let file = "index.html";
        fs.readFile(file, function(err, data) {
            if(err) console.log(err);
            res.setHeader("Content-Type", "text/html; charset=utf-8;");
            res.end(data);
        })
    } else{
        fs.readFile(req.url.substr(1), function(err, data) {
            res.end(data);
        })
    }   

}).listen(port, () => {
    console.log(path);
})