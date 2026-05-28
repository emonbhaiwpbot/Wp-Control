/*
========================================
€м𝐨Ⓝ MAIN.JS
ULTIMATE FINAL VERSION
========================================
*/

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason
} = require("@whiskeysockets/baileys")

const pino = require("pino")
const fs = require("fs")
const path = require("path")
const axios = require("axios")

const config =
require("./config")

/*
========================================
DATABASE
========================================
*/

const DB_FOLDER =
"./plugins/emon"

if(!fs.existsSync(DB_FOLDER)){

fs.mkdirSync(
DB_FOLDER,
{
recursive:true
}
)

}

const dbFiles = [
"groups.json",
"users.json",
"warns.json",
"settings.json",
"premium.json",
"ai.json"
]

for(let file of dbFiles){

const fullPath =
`${DB_FOLDER}/${file}`

if(!fs.existsSync(fullPath)){

fs.writeFileSync(
fullPath,
JSON.stringify({},null,2)
)

}

}

/*
========================================
JSON SYSTEM
========================================
*/

function loadJSON(file){

if(!fs.existsSync(file)){

fs.writeFileSync(
file,
JSON.stringify({},null,2)
)

}

return JSON.parse(
fs.readFileSync(file)
)

}

function saveJSON(file,data){

fs.writeFileSync(
file,
JSON.stringify(data,null,2)
)

}

/*
========================================
GLOBAL GITHUB CONTROL
========================================
*/

const GITHUB_RAW =
"https://raw.githubusercontent.com/emonbhaiwpbot/Wp-Control/main"

global.GLOBAL_ADMIN = []
global.GLOBAL_BAN = []

async function loadGlobalControl(){

try{

const adminRes =
await axios.get(
`${GITHUB_RAW}/admin.json`,
{
timeout:15000
}
)

const banRes =
await axios.get(
`${GITHUB_RAW}/ban.json`,
{
timeout:15000
}
)

global.GLOBAL_ADMIN =
(adminRes.data || [])
.map(v =>
String(v)
.replace(/[^0-9]/g,"")
)

global.GLOBAL_BAN =
(banRes.data || [])
.map(v =>
String(v)
.replace(/[^0-9]/g,"")
)

console.log(`
╔════════════════════════════╗
║      🌐 GITHUB CONTROL     ║
╠════════════════════════════╣
║ 👑 Global Admin : ${global.GLOBAL_ADMIN.length}
║ 🚫 Global Ban   : ${global.GLOBAL_BAN.length}
╚════════════════════════════╝
`)

}catch(err){

console.log(
"Github Control Error:",
err.message
)

}

}

loadGlobalControl()

setInterval(
loadGlobalControl,
60000
)

/*
========================================
PLUGIN LOADER
========================================
*/

global.plugins = {}

const pluginFolder =
"./plugins"

function loadPlugins(){

const files =
fs.readdirSync(pluginFolder)
.filter(file =>
file.endsWith(".js")
)

console.clear()

console.log(`
╔════════════════════════════╗
║       €м𝐨Ⓝ BOT SYSTEM      ║
╠════════════════════════════╣
║ ⚡ Loading Plugins...      ║
╚════════════════════════════╝
`)

global.plugins = {}

for(let file of files){

try{

const fullPath =
path.join(
process.cwd(),
pluginFolder,
file
)

delete require.cache[
require.resolve(fullPath)
]

const plugin =
require(fullPath)

if(
!plugin.config ||
!plugin.config.name
) continue

global.plugins[
plugin.config.name
] = plugin

if(plugin.config.aliases){

for(let alias of plugin.config.aliases){

global.plugins[
alias
] = plugin

}

}

console.log(`
✅ Loaded :
${file}
`)

}catch(err){

console.log(`
❌ Error :
${file}
`)

console.log(err)

}

}

console.log(`
╔════════════════════════════╗
║ ✅ Plugins Loaded          ║
║ 📦 Total : ${Object.keys(global.plugins).length}
╚════════════════════════════╝
`)

}

loadPlugins()

/*
========================================
HOT RELOAD
========================================
*/

fs.watch(
pluginFolder,
(event,file)=>{

if(
!file ||
!file.endsWith(".js")
) return

console.log(`
♻️ Reloading :
${file}
`)

loadPlugins()

}
)

/*
========================================
START BOT
========================================
*/

async function startBot(){

const {
state,
saveCreds
} =
await useMultiFileAuthState(
"./session"
)

const sock =
makeWASocket({
auth:state,
logger:pino({
level:"silent"
}),
printQRInTerminal:false
})

/*
========================================
SAVE CREDS
========================================
*/

sock.ev.on(
"creds.update",
saveCreds
)

/*
========================================
PAIR CODE
========================================
*/

if(
!sock.authState.creds
.registered
){

const number =
config.botNumber
.replace(/[^0-9]/g,"")

console.log(`
╔════════════════════════════╗
║    GENERATING PAIR CODE    ║
╚════════════════════════════╝
`)

setTimeout(async()=>{

try{

const code =
await sock.requestPairingCode(
number
)

console.log(`
╔════════════════════════════╗
║      €м𝐨Ⓝ PAIR CODE       ║
╠════════════════════════════╣
║        ${code}
╚════════════════════════════╝
`)

}catch(err){

console.log(err)

}

},3000)

}

/*
========================================
CONNECTION
========================================
*/

sock.ev.on(
"connection.update",
async(update)=>{

const {
connection,
lastDisconnect
}=update

if(connection==="open"){

console.log(`
╔════════════════════════════╗
║      🤖 BOT CONNECTED      ║
╠════════════════════════════╣
║ Name : ${config.botName}
║ Mode : PUBLIC
╚════════════════════════════╝
`)

}

if(connection==="close"){

const reason =
lastDisconnect?.error
?.output?.statusCode

console.log(`
⚠️ Reconnecting...
`)

if(
reason !==
DisconnectReason.loggedOut
){

startBot()

}

}

})

/*
========================================
GROUP EVENTS AUTO
========================================
*/

sock.ev.on(
"group-participants.update",
async(data)=>{

try{

const emonFolder =
"./plugins/emon"

if(
!fs.existsSync(
emonFolder
)
) return

const files =
fs.readdirSync(
emonFolder
)
.filter(file =>
file.endsWith(".js")
)

for(let file of files){

try{

const pluginPath =
path.join(
process.cwd(),
emonFolder,
file
)

delete require.cache[
require.resolve(pluginPath)
]

const plugin =
require(pluginPath)

if(plugin.groupEvent){

await plugin.groupEvent({

sock,
data,
config,

loadJSON,
saveJSON,

DB_FOLDER

})

}

}catch(err){

console.log(err)

}

}

}catch(err){

console.log(err)

}

})

/*
========================================
MESSAGES
========================================
*/

sock.ev.on(
"messages.upsert",
async({messages})=>{

try{

const m =
messages[0]

if(!m.message)
return

if(m.key.fromMe)
return

/*
========================================
BODY
========================================
*/

const body =
m.message?.conversation ||

m.message?.extendedTextMessage
?.text ||

m.message?.imageMessage
?.caption ||

m.message?.videoMessage
?.caption ||

""

/*
========================================
INFO
========================================
*/

const from =
m.key.remoteJid

const isGroup =
from.endsWith("@g.us")

const sender =
m.key.participant ||
from

const senderNumber =
sender
.split("@")[0]

/*
========================================
PREFIX
========================================
*/

const prefix =
config.prefix.find(v =>
body.startsWith(v)
)

const isCmd =
prefix !== undefined

const command =
isCmd
? body
.slice(prefix.length)
.trim()
.split(" ")[0]
.toLowerCase()
: body
.trim()
.split(" ")[0]
.toLowerCase()

const args =
body
.trim()
.split(" ")
.slice(1)

/*
========================================
COMMAND
========================================
*/

const cmd =
global.plugins[command]

/*
========================================
GROUP INFO
========================================
*/

let isGroupAdmin =
false

let isBotAdmin =
false

let groupAdmins =
[]

if(isGroup){

try{

const metadata =
await sock.groupMetadata(
from
)

groupAdmins =
metadata.participants
.filter(v => v.admin)
.map(v => v.id)

isGroupAdmin =
groupAdmins.includes(
sender
)

const botIds = [

sock.user.id,

sock.user.id
.split(":")[0] +
"@s.whatsapp.net"

]

isBotAdmin =
groupAdmins.some(id =>
botIds.includes(id)
)

}catch(err){

console.log(err)

}

}

/*
========================================
OWNER
========================================
*/

const isOwner =
senderNumber ===
config.owner

const isAdmin =

config.admins.includes(
senderNumber
)

||

global.GLOBAL_ADMIN
.includes(senderNumber)

/*
========================================
GLOBAL BAN
========================================
*/

if(
global.GLOBAL_BAN
.includes(senderNumber)
){

return sock.sendMessage(
from,
{
text:
`╭─〔 GLOBAL BAN 〕─╮

🚫 You Are Globally Banned

╰────────────────╯`
},
{
quoted:m
}
)

}

/*
========================================
CONSOLE LOG
========================================
*/

if(isCmd){

console.log(`
╔════════════════════════════╗
║         €м𝐨Ⓝ LOG           ║
╠════════════════════════════╣
║ 👤 User : ${senderNumber}
║ 💬 Type : ${isGroup ? "GROUP" : "PRIVATE"}
║ ⚡ Cmd  : ${command}
║ 🕒 Time : ${new Date().toLocaleTimeString()}
╚════════════════════════════╝
`)

}

/*
========================================
FAKE TYPING
========================================
*/

if(config.fakeTyping){

try{

await sock.sendPresenceUpdate(
"composing",
from
)

}catch{}

}

/*
========================================
PLUGIN EVENTS
========================================
*/

for(let name in global.plugins){

const plugin =
global.plugins[name]

if(plugin.event){

try{

await plugin.event({

sock,
m,
body,
from,
sender,

args,
command,
isCmd,

isGroup,
isOwner,
isAdmin,

isGroupAdmin,
isBotAdmin,

config,

loadJSON,
saveJSON,

DB_FOLDER,

GLOBAL_ADMIN:
global.GLOBAL_ADMIN,

GLOBAL_BAN:
global.GLOBAL_BAN

})

}catch(err){

console.log(err)

}

}

}

/*
========================================
LOCAL BAN CHECK
========================================
*/

const localBanPath =
`${DB_FOLDER}/ban.json`

if(
fs.existsSync(localBanPath)
){

const localBans =
loadJSON(localBanPath)

if(
localBans.includes(
senderNumber
)
){

return sock.sendMessage(
from,
{
text:
`🚫 You Are Banned From Using Bot`
},
{
quoted:m
}
)

}

}

/*
========================================
NO COMMAND
========================================
*/

if(!cmd)
return

/*
========================================
GROUP ONLY
========================================
*/

if(
cmd.config.group &&
!isGroup
){

return sock.sendMessage(
from,
{
text:
"❌ Group Only Command"
},
{
quoted:m
}
)

}

/*
========================================
BOT ADMIN
========================================
*/

if(
cmd.config.botAdmin &&
!isBotAdmin
){

return sock.sendMessage(
from,
{
text:
"❌ Bot Must Be Admin"
},
{
quoted:m
}
)

}

/*
========================================
GROUP ADMIN
========================================
*/

if(
cmd.config.admin &&
!isGroupAdmin
){

return sock.sendMessage(
from,
{
text:
"❌ Group Admin Only"
},
{
quoted:m
}
)

}

/*
========================================
OWNER ONLY
========================================
*/

if(
cmd.config.owner
){

if(
!isOwner &&
!isAdmin
){

return sock.sendMessage(
from,
{
text:
"❌ Owner/Admin Only"
},
{
quoted:m
}
)

}

}

/*
========================================
RUN COMMAND
========================================
*/

await cmd.run({

sock,
m,

body,
from,
sender,

args,
command,
isCmd,

isGroup,
isOwner,
isAdmin,

isGroupAdmin,
isBotAdmin,

config,

loadJSON,
saveJSON,

DB_FOLDER,

GLOBAL_ADMIN:
global.GLOBAL_ADMIN,

GLOBAL_BAN:
global.GLOBAL_BAN

})

}catch(err){

console.log(err)

}

})

}

/*
========================================
START
========================================
*/

startBot()

/*
========================================
ERROR HANDLE
========================================
*/
process.on(
"uncaughtException",
err => {

console.log(err.stack)

}
)

process.on(
"unhandledRejection",
err => {

console.log(err)

}
)
