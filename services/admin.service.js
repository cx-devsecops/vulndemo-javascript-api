const fs = require("fs");
const { stdout, stderr } = require("process");
const { execFile } = require('child_process');

// Allowlist of administrative commands. The client may only select one of
// these entries by name; the executable and its arguments are fixed here.
const ALLOWED_COMMANDS = new Map([
  ['date', ['date', []]],
  ['uptime', ['uptime', []]],
  ['whoami', ['whoami', []]],
  ['hostname', ['hostname', []]],
  ['df', ['df', ['-h']]],
]);

exports.runCommand = (data, callback) => {
  const entry = ALLOWED_COMMANDS.get(data.command);
  if (!entry) {
    return callback(new Error('Command not allowed'));
  }
  const [file, args] = entry;
  // execFile does not spawn a shell, so no shell metacharacters are interpreted
  execFile(file, args, (err,stdout,stderr) => {
    if (err){
      console.log('Error: '+err)
      return callback(err)
    }
    else {
      console.log('Stdout: '+stdout)
      return callback(null,stdout)
    }
  })
      
      

};

exports.getFile = (data, callback) => {
  fs.readFile(data.fileName, 'utf8', (err, filedata) => {
    if (err){
      console.log('Error true')
      return callback(err);
    }
    else {
      console.log('Error false')
      console.log('File Content: '+filedata)
      return callback(null,filedata)
    }
  })

};

