
require('dotenv').config()
const ytdl = require('ytdl-core')
const slugify = require('slugify')
const fs = require('fs')
const path = require('path')
const { downloadTikTokVideo } = require("./tiktokDataScraper");
// Discord.js versions ^13.0 require us to explicitly define client intents
const {
  Client,
  GatewayIntentBits,
  AttachmentBuilder,
  EmbedBuilder,
} = require('discord.js')

module.exports.tiktokVideoModule = async () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  })

  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setStatus('Burdayım be burdayım !')
  })

  client.on('messageCreate', async (message) => {
    try {
      if (message.content.startsWith('!tiktok')) {
        //Downloading video to our storage
        const videoUrl = message.content.slice(7) 
        message.reply('Video Converting...');
        
        const filePath = await downloadTikTokVideo(videoUrl);
        console.log(`Modüldeki filePath: ${filePath}`)
        const videoAttachment =  new AttachmentBuilder(filePath)
          console.log(videoAttachment)
            message.reply({
            content: 'Video Converted!',
            files: [videoAttachment],

          })
          
            fs.rm(filePath, (error) => {
                if (error) {
                  console.log('❌ Dosya silinirken bir hata oluştu:', error);
                } else {
                  console.log('Video başarıyla diskten silindi✅');
                }
              }); 

            
          
      }
    }
    catch(error){
        console.log(error);
    }
  })

  client.login(process.env.CLIENT_TOKEN)
}
