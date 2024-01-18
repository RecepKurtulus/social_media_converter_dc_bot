require('dotenv').config()
const ytdl = require('ytdl-core')
const slugify = require('slugify')
const fs = require('fs')
const path = require('path')
// Discord.js versions ^13.0 require us to explicitly define client intents
const {
  Client,
  GatewayIntentBits,
  AttachmentBuilder,
  EmbedBuilder,
} = require('discord.js')

module.exports.ytVideoModule = async () => {
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
      if (message.content.startsWith('!youtube')) {
        //Getting message's user data
        const user = message.author;
        const taggedUser = `<@${user.id}>`;
        //Downloading video to our storage
        const videoUrl = message.content.slice(8) 
        console.log(`Video Url:${videoUrl}`)
        const firstReply=await message.reply('Video downloading ✅')
        console.log('Video is downloading rn ✅', message.id)
        const info = await ytdl.getInfo(videoUrl)
        const videoTitle = slugify(info.videoDetails.title, '_')
        const videoStream = ytdl(videoUrl, {
          quality: 'highestvideo',
          filter: 'audioandvideo',
        })
        console.log('Video is downloading rn ✅')

        //Writing video to our storage
        const downloadFolder = path.join(require('os').homedir(), 'Downloads')
        const filePath = `${downloadFolder}/${videoTitle}.mp4`
        const writeStream = fs.createWriteStream(filePath)
        videoStream.pipe(writeStream)

        //Sending about converting progress
        let downloadedBytes = 0;
        let totalBytes = 0;
        let interval;
        videoStream.on('response', (response) => {
          totalBytes = parseInt(response.headers['content-length'], 10);
        });
        videoStream.on('progress', (chunkLength, downloaded, total) => {
          downloadedBytes += chunkLength;

          if (!interval) {
            interval = setInterval(() => {
              const percentage = (`%${((downloadedBytes / totalBytes) * 100).toFixed(2)}`);
              firstReply.edit(`Converting... ${percentage} `)
              console.log(`Downloaded: ${downloadedBytes} bytes (${percentage}%)`);
              console.log(`Total Byte: ${totalBytes} `);
              console.log(`Remaining: ${totalBytes - downloadedBytes} bytes`);
              
            }, 1000); 
          }

          if (downloadedBytes >= totalBytes) {
            clearInterval(interval);
            interval = null;
          }
        });
        

        writeStream.on('finish', async () => {
          const embed = new EmbedBuilder()
            .setColor('#621A55') 
            .setTitle(`${videoTitle} downloaded successfully ✅ `)
            .setURL(videoUrl)
            .setDescription(
              'im the biggest dolphin slayer',
            )
          //Uploading video file as a embed message
          const videoAttachment = new AttachmentBuilder(filePath)
          console.log(videoAttachment)
          await firstReply.edit({
            content:taggedUser,
            embeds: [embed],
            files: [videoAttachment],
          })
          try {
            fs.rm(filePath, { recursive: true, force: true }, (error) => {
              //you can handle the error here
              console.log(error)
            })
            console.log('Video deleted from our disk successfully✅')
          } catch (error) {
            console.log('❌There is a problem about deleting file:', error)
          }
        })
      }
    } catch (error) {
      console.log(error.stack)
    }
  })

  client.login(process.env.CLIENT_TOKEN)
}