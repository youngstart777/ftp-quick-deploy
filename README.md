# FTP QUICK DEPLOY
## _Quick way to upload React or simiular projects via FTP_


FTP Quick Deploy is a package that helps uploading you'r project to the server via ftp with only one command.

## Features

- Upload via FTP
- (optional) Refresh cache for Siteground hosting


## Installation


For development environmt...

```sh
npm install ftp-quick-deploy --save-dev
```

then craete a file on the root of the application [as a sibling to the 'build' folder] called `deploy.js` (the name of the file is just a convention) and add the following code to it:

```sh
const deploy = require('ftp-quick-deploy');

deploy({
    host: "<<your-host>>",
    port: "<<your-port>>", // default port 21
    username: "<<your-username>>",
    pass: "<<your-password>>",
    remote_path: "<<your-remote-path>>",
    folder: "<<your-local-folder>>", // defaults to 'build'
    sg_site_id: "<<your-siteground-id>>",  // optional
    sg_username: "<<your-siteground-username>>",  // optional
    sg_pass: "<<your-siteground-password>>",  // optional
})
```

replace the placeholders with you'r information (e.g. `host: "<<your-host>>",` -> `host: "ftp.your-domain.com",` ).
### NOTE: The Siteground information is just for refreshing the cache - it is not required.
### NOTE: The port is not required if its 21.

then add to the package.json an entry in the 'scripts' property like so:

```sh
"deploy": "node deploy.js"
```

so in a tipical react app the package.json scripts property will look something like:

```sh
  "scripts": {
      "start": "react-scripts start",
      "build": "react-scripts build",
      "deploy": "node deploy.js",
      "test": "react-scripts test",
      "eject": "react-scripts eject"
   },
```

then run the following command from you'r console AFTER YOU RAN THE 'build' COMMAND.

```sh
npm run deploy
```

thats it!!


## License


**Free Software, Hell Yeah!**
