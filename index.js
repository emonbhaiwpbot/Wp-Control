/*
========================================
€м𝐨Ⓝ INDEX.JS
ULTIMATE AUTO UPDATE SYSTEM
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
GLOBAL
========================================
*/

global.GLOBAL_ADMIN = []

global.GLOBAL_BAN = []

/*
========================================
CREATE FOLDERS
========================================
*/

const folders = [

"./plugins",

"./plugins/emon",

"./session",

"./temp",

"./backup"

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

console.log(`
📁 Created :
${folder}
`)

}

}

/*
========================================
DOWNLOAD FILE
========================================
*/

async function downloadFile(
url,
savePath
){

try{

const res =
await axios.get(url)

const oldData =
fs.existsSync(savePath)
? fs.readFileSync(
savePath,
"utf8"
)
: ""

if(
oldData !== res.data
){

fs.writeFileSync(
savePath,
res.data
)

console.log(`
✅ Updated :
${savePath}
`)

return true

}

return false

}catch(err){

console.log(`
❌ Failed :
${savePath}
`)

return false

}

}

/*
========================================
AUTO UPDATE MAIN FILES
========================================
*/

async function updateMainFiles(){

const files = [

"main.js",

"config.js",

"package.json",

"index.js"

]

for(let file of files){

const updated =
await downloadFile(
`${GITHUB_RAW}/${file}?t=${Date.now()}`,
`./${file}`
)

if(
updated &&
(
file === "main.js" ||
file === "config.js"
)
){

console.log(`
♻️ Restarting Bot...
`)

process.exit(1)

}

}

}

/*
========================================
AUTO UPDATE EMON FILES
========================================
*/

async function updateEmonFiles(){

try{

const emon =
await axios.get(
`${GITHUB_RAW}/emon.json?t=${Date.now()}`
)

const files =
emon.data || []

for(let file of files){

await downloadFile(
`${GITHUB_RAW}/plugins/emon/${file}?t=${Date.now()}`,
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
GITHUB CONTROL
========================================
*/

async function githubControl(){

try{

const admin =
await axios.get(
`${GITHUB_RAW}/admin.json?t=${Date.now()}`
)

const ban =
await axios.get(
`${GITHUB_RAW}/ban.json?t=${Date.now()}`
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
❌ Github Control Failed
`)

}

}

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
EMON PROTECT
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

⚠️ BOT STOPPED
`)

process.exit(1)

}

},5000)

/*
========================================
AUTO BACKUP
========================================
*/

setInterval(()=>{

try{

const time =
Date.now()

fs.cpSync(
"./plugins",
`./backup/plugins-${time}`,
{
recursive:true
}
)

console.log(`
💾 Backup Created
`)

}catch{}

},3600000)

/*
========================================
TEMP CLEANER
========================================
*/

setInterval(()=>{

const temp =
"./temp"

if(
!fs.existsSync(temp)
)
return

for(let file of fs.readdirSync(temp)){

try{

fs.unlinkSync(
`${temp}/${file}`
)

}catch{}

}

console.log(`
🗑️ Temp Cleaned
`)

},600000)

/*
========================================
AUTO GITHUB SYNC
========================================
*/

async function githubSync(){

console.log(`
🔄 Checking Github Updates...
`)

await updateMainFiles()

await updateEmonFiles()

await githubControl()

}

/*
========================================
AUTO LOOP
========================================
*/

setInterval(
githubSync,
30000
)

/*
========================================
START
========================================
*/

async function start(){

console.clear()

console.log(`
╔════════════════════════════╗
║      €м𝐨Ⓝ BOT SYSTEM       ║
╠════════════════════════════╣
║ ⚡ Starting Bot...         ║
╚════════════════════════════╝
`)

await githubSync()

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
