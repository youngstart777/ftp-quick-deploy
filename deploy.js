const { exec } = require('child_process');
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const progress_bar = require('progress');
const notifier = require('node-notifier');


const deploy = (options) => {

    console.log("Deploying Build Folder...");

    const data = [
        `open ${options.host}${options.port ? (':' + options.port) : ''}`,
        `${options.username}`,
        `${options.pass}`,
        `cd ${options.remote_path}`,
        "binary",
        "prompt off",
    ]

    function readFilesRecursively(folderPath) {
        let filesArray = [];
        const files = fs.readdirSync(folderPath);
        files.forEach((file) => {
            const filePath = (folderPath + "/" + file);
            if (fs.statSync(filePath).isDirectory()) {
                filesArray = filesArray.concat(readFilesRecursively(filePath));
            } else {
                filesArray.push(filePath);
            }
        });
        return filesArray;
    }


    function getFoldersRecursively(folderPath) {
        let foldersArray = [];
        const files = fs.readdirSync(folderPath);
        files.forEach((file) => {
            const newPath = (folderPath + "/" + file);
            if (fs.statSync(newPath).isDirectory()) {
                foldersArray.push(newPath)
                foldersArray = foldersArray.concat(getFoldersRecursively(newPath))
            }
        });
        return foldersArray;
    }

    async function run(url, actions = []) {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1024 });

        // Navigate to the URL
        await page.goto(url);

        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            try {
                await page.waitForSelector(action.selector);
            } catch (error) {
                page.reload();
                await page.waitForSelector(action.selector);
            }
            switch (action.action_type) {
                case "click":
                    await page.click(action.selector);
                    break;
                case "type":
                    await page.type(action.selector, action.value);
                    break;
            }
        }

        await new Promise(r => setTimeout(r, 2000));

        // Close the browser
        await browser.close();
        console.log("\n Cache refreshed successfully!! \n");
    }

    async function refreshCatchSiteground(sg_site_id) {

        return run(`https://tools.siteground.com/cacher?siteId=${sg_site_id}`, [
            {
                selector: `input[data-e2e="input-username"]`,
                action_type: "type",
                value: options.sg_username,
                wait: 500,
            },
            {
                selector: `button[type="submit"]`,
                action_type: "click",
                wait: 500,
            },
            {
                selector: `input[name="fields.password.name"]`,
                action_type: "type",
                value: options.sg_pass,
                wait: 500,
            },
            {
                selector: `button[type="submit"]`,
                action_type: "click",
                wait: 2500,
            },
            {
                selector: `li[data-e2e='super-cacher-dynamic']`,
                action_type: "click",
                wait: 500,
            },
            {
                selector: `span[data-e2e='table-action-flush-cache']`,
                action_type: "click",
                wait: 2500,
            },
        ]);
    }

    const folder = options.folder || "build";

    getFoldersRecursively(folder).map(i => data.push("mkdir " + i.replace(`${folder}/`, "")))
    readFilesRecursively(folder).map(i => data.push("put " + i + " " + i.replace(`${folder}/`, "")))

    data.push("quit")

    fs.writeFileSync("ftp.txt", data.join("\n"))

    const bar = new progress_bar('Uploading :filename... [:bar] :current/:total', {
        complete: '*',
        width: 30,
        total: (data.length + 5),
    });

    const ls = spawn("ftp -s:ftp.txt", [], { shell: true });


    ls.stdout.on('data', function (data) {
        bar.tick({
            filename: data.toString().replace("\n", ""),
        });
        if (bar.complete) {
            console.log('\ncompleted!\n');
        }
    });

    ls.stderr.on('data', function (data) {
        console.log('- err: ' + data.toString());
    });

    ls.on('exit', function (code) {
        fs.rmSync("ftp.txt");
        console.log("\nUploaded Successfully!\n");

        if (options.sg_site_id) {
            console.log("\nRefreshing Cache...\n");
            if (!options.sg_username || !options.sg_pass) {
                console.log("\nMissing Siteground Cred\n");
            } else {
                refreshCatchSiteground(options.sg_site_id)
                .then((x) => {
                    notifier.notify(
                        {
                          title: 'FTP Upload Complete!!',
                          message: 'Uploaded files and folders!!',
                          icon: path.join(__dirname, 'ftp_icon.jpg'),
                          sound: true,
                          wait: true
                        }
                      );
                      
                });
            }
        }
    })
}


module.exports = deploy;