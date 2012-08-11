var _ = require('underscore');
var fs = require('fs');
var readline = require('readline');

var pre = {};

pre.processors = {
    log: function(args) {
        var output = "console.log('[Maki Debug] This is a log message:" + args[0] + "');";

        return output;
    }
}

pre.process = function(path, callback) {
    callback = callback || function() {};

    var tmp = path + '.tmp';
    var newLine = '\n';
    var readStream = fs.createReadStream(path);
    var writeStream = fs.createWriteStream(tmp);
    var interface = readline.createInterface({
        'input': readStream, 'output': writeStream
    });

    interface.on('line', function(line) {
        line = line.trim();

        // .
        if ((/^\/\/#[a-zA-Z0-9]+:.*$/).test(line)) {
            var input = line.trim().split('//#')[1].split(':');
            var name = input[0];

            console.log(line);
            writeStream.write(
                pre.processors[name].call(this, _(input).rest())
            ); 
        } else {
            writeStream.write(line);
        }

        // .
        writeStream.write(newLine);
    }).on('close', function() {
        fs.unlinkSync(path);
        fs.renameSync(tmp, path);

        callback.call(this);
    });
}

module.exports = pre;
