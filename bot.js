const qrcode = require('qrcode-terminal')
const { Client, RemoteAuth, MessageMedia } = require('whatsapp-web.js')
const { MongoStore } = require('wwebjs-mongo')
const mongoose = require('mongoose')

require('dotenv').config()

const nerdSticker = MessageMedia.fromFilePath('assets/nerd.png');

const isNerdList = process.env.ISNERDLIST.toLowerCase().split(", ");
const isForbidden = process.env.FORBIDDENCHATS.split(", ");

mongoose.connect(process.env.DATABASE_URI).then(() => {
  const store = new MongoStore({ mongoose: mongoose })
  const client = new Client({
    puppeteer: {
      args: ['--no-sandbox']
    },
    authStrategy: new RemoteAuth({
      store: store,
      backupSyncIntervalMs: 300000
    })
  })

  client.initialize()


  client.on('qr', qr => {
    qrcode.generate(qr, { small: true })
  })
  
  client.on('ready', async () => {
    console.log('bot is running!')
  })
  
  let rejectCalls = true;
  client.on('incoming_call', async call => {
    await client.sendMessage(call.from, `[${call.fromMe ? 'Outgoing' : 'Incoming'}] Phone call from ${call.from}, type ${call.isGroup ? 'group' : ''} ${call.isVideo ? 'video' : 'audio'} call. ${rejectCalls ? 'This call was automatically rejected by the script.' : ''}`);
    await client.sendMessage(call.from, 'Este usuário não consegue receber ligações! Deixe seu recado.')
   });

  client.on('message', async msg => {
    let forBidden = isForbidden.some(element =>{
        if (msg.from === element){
            return true
        }
    })
    
    if (!forBidden){
        isNerdList.some(element => {
            if (msg.body.toLowerCase().includes(element)) {
                  msg.reply(nerdSticker)
            }
          });
         
    }
    })
   
})