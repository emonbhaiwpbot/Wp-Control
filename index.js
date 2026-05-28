/*
========================================
€м𝐨Ⓝ INDEX.JS
FULL FIXED VERSION
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

const newData =
typeof res.data === "object"
? JSON.stringify(
res.data,
null,
2
)
: res.data

const oldData =
fs.existsSync(savePath)
? fs.readFileSync(
savePath,
"utf8"
)
: ""

if(oldData !== newData){

fs.writeFileSync(
savePath,
newData
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
UPDATE MAIN FILES
========================================
*/

async function updateMainFiles(){

const files = [

"main.js",
"config.js",
"index.js",
"package.json"

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
UPDATE PACKAGE
========================================
*/

async function updatePackage(){

try{

const res =
await axios.get(
`${GITHUB_RAW}/package.json?t=${Date.now()}`
)

const data =
JSON.stringify(
res.data,
null,
2
)

fs.writeFileSync(
"./package.json",
data
)

console.log(`
✅ package.json Synced
`)

}catch(err){

console.log(`
❌ package.json Failed
`)

}

}

/*
========================================
UPDATE EMON FILES
========================================
*/

async function updateEmonFiles(){

try{

const res =
await axios.get(
`${GITHUB_RAW}/emon.json?t=${Date.now()}`
)

const files =
res.data || []

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
PLUGIN CHECKER
========================================
*/

function pluginChecker(){

try{

const files =
fs.readdirSync("./plugins")
.filter(v =>
v.endsWith(".js")
)

for(let file of files){

try{

delete require.cache[
require.resolve(
path.join(
process.cwd(),
"./plugins",
file
)
)
]

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

console.log(err.stack)

}

}

}catch(err){

console.log(err)

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
`)

process.exit(1)

}

},5000)

/*
========================================
TEMP CLEANER
========================================
*/

setInterval(()=>{

try{

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

}catch{}

},600000)

/*
========================================
AUTO BACKUP
========================================
*/

setInterval(()=>{

try{

const backup =
`./backup/${Date.now()}`

fs.mkdirSync(
backup,
{
recursive:true
}
)

fs.cpSync(
"./plugins",
`${backup}/plugins`,
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
AUTO GITHUB SYNC
========================================
*/

async function githubSync(){

console.log(`
🔄 Checking Github Updates...
`)

await updateMainFiles()

await updatePackage()

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
`)

console.log(err.stack)

}
)

process.on(
"unhandledRejection",
err => {

console.log(`
❌ Rejection :
`)

console.log(err)

}
)

