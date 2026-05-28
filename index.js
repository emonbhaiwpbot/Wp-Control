/*
========================================
€м𝐨Ⓝ INDEX.JS
AUTO GITHUB UPDATE SYSTEM
========================================
*/

const fs =
require("fs")

const path =
require("path")

const axios =
require("axios")

/*
========================================
GITHUB RAW
========================================
*/

const GITHUB_RAW =
"https://raw.githubusercontent.com/emonbhaiwpbot/Wp-Control/main"

/*
========================================
AUTO UPDATE FILES
========================================
*/

const AUTO_UPDATE_FILES = [

"main.js",

"config.js",

"package.json",

"index.js"

]

/*
========================================
AUTO UPDATE FOLDERS
========================================
*/

const AUTO_UPDATE_FOLDERS = [

"./plugins/emon"

]

/*
========================================
CREATE FOLDERS
========================================
*/

const folders = [

"./plugins",

"./plugins/emon",

"./session",

"./temp"

]

for(let folder of folders){

if(
!fs.existsSync(folder)
){

fs.mkdirSync(
folder,
{
recursive:true
}
)

}

}

/*
========================================
DOWNLOAD FILE
========================================
*/

async function downloadFile(
url,
filePath
){

try{

const res =
await axios.get(url)

fs.writeFileSync(
filePath,
res.data
)

console.log(`
✅ Updated :
${filePath}
`)

}catch(err){

console.log(`
❌ Failed :
${filePath}
`)

}

}

/*
========================================
AUTO UPDATE FILES
========================================
*/

async function autoUpdateFiles(){

for(let file of AUTO_UPDATE_FILES){

await downloadFile(
`${GITHUB_RAW}/${file}`,
`./${file}`
)

}

}

/*
========================================
AUTO UPDATE EMON
========================================
*/

async function autoUpdateEmon(){

try{

const res =
await axios.get(
`${GITHUB_RAW}/emon.json`
)

const files =
res.data || []

for(let file of files){

await downloadFile(
`${GITHUB_RAW}/plugins/emon/${file}`,
`./plugins/emon/${file}`
)

}

}catch(err){

console.log(`
❌ Emon Update Failed
`)

}

}

/*
========================================
GLOBAL CONTROL
========================================
*/

global.GLOBAL_ADMIN = []

global.GLOBAL_BAN = []

async function githubControl(){

try{

const admin =
await axios.get(
`${GITHUB_RAW}/admin.json`
)

const ban =
await axios.get(
`${GITHUB_RAW}/ban.json`
)

global.GLOBAL_ADMIN =
(admin.data || [])
.map(v =>
String(v)
.replace(/[^0-9]/g,"")
)

global.GLOBAL_BAN =
(ban.data || [])
.map(v =>
String(v)
.replace(/[^0-9]/g,"")
)

console.log(`
╔════════════════════════════╗
║      🌐 GITHUB CONTROL     ║
╠════════════════════════════╣
║ 👑 Admin :
${global.GLOBAL_ADMIN.length}

║ 🚫 Ban :
${global.GLOBAL_BAN.length}
╚════════════════════════════╝
`)

}catch(err){

console.log(`
❌ Github Control Error
`)

}

}

/*
========================================
EMON FOLDER PROTECT
========================================
*/

setInterval(()=>{

if(
!fs.existsSync(
"./plugins/emon"
)
){

console.log(`
🚫 plugins/emon Missing
`)

process.exit(1)

}

},5000)

/*
========================================
HOT RELOAD LOG
========================================
*/

fs.watch(
"./plugins",
(event,file)=>{

if(
!file ||
!file.endsWith(".js")
)
return

console.log(`
♻️ Plugin Changed :
${file}
`)

}
)

/*
========================================
AUTO GITHUB UPDATE
========================================
*/

async function githubUpdater(){

console.log(`
🔄 Checking Github Updates...
`)

await autoUpdateFiles()

await autoUpdateEmon()

await githubControl()

}

/*
========================================
AUTO UPDATE LOOP
========================================
*/

setInterval(
githubUpdater,
60000
)

/*
========================================
PLUGIN CHECKER
========================================
*/

function pluginChecker(){

const files =
fs.readdirSync("./plugins")
.filter(v =>
v.endsWith(".js")
)

for(let file of files){

try{

const plugin =
require(
path.join(
process.cwd(),
"./plugins",
file
)
)

if(
!plugin.config ||
!plugin.config.name
){

console.log(`
⚠️ Invalid Plugin :
${file}
`)

}

}catch(err){

console.log(`
❌ Broken Plugin :
${file}
`)

}

}

}

/*
========================================
START
========================================
*/

async function start(){

console.clear()

console.log(`
╔════════════════════════════╗
║       €м𝐨Ⓝ BOT SYSTEM      ║
╠════════════════════════════╣
║ ⚡ Starting Bot...         ║
╚════════════════════════════╝
`)

await githubUpdater()

pluginChecker()

require("./main")

}

start()

/*
========================================
ERROR HANDLE
========================================
*/

process.on(
"uncaughtException",
err => {

console.log(`
❌ Uncaught :
${err.message}
`)

}
)

process.on(
"unhandledRejection",
err => {

console.log(`
❌ Rejection :
${err}
`)

}
)
