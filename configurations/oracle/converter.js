/*
    This converts text (log) file to ndjson format which could be pushed to ElasticSearch index
    Required 2 parameters - first is filename to be converted, second is pipeline name
*/
const fs = require("fs");
console.log("Converting...");
const args = process.argv.slice(2);
fs.readFile(`./${args[0]}`, "utf8", function (err, data) {
  if (err) return console.log(err);
  const textByLine = data.split("\n");
  const ndjson = textByLine.map((line) => {
    line = line.replace(/\"/g, '\\"');
    return line !== ""
      ? `{ "index": { "_index": "", "pipeline": "${args[1]}" } }\n{ "message": "${line}" }`
      : "";
  });
  fs.writeFile(`./${args[0]}_converted`, ndjson.join("\n"), function (err) {
    if (err) return console.log(err);
    console.log("Done!");
  });
});
