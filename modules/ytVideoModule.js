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
        // Özel bir komut kullanarak embed mesajını oluşturabilirsiniz
        const videoUrl = message.content.slice(8) // Başlangıçtan sonra gelen URL'yi alın
        console.log(`Video Url:${videoUrl}`)
        message.reply('Video downloading ✅')
        console.log('Video is downloading rn ✅', message.id)
        const info = await ytdl.getInfo(videoUrl)
        const videoTitle = slugify(info.videoDetails.title, '_')


        // Embed mesajını oluştur
        const videoStream = ytdl(videoUrl, {
          quality: 'highestvideo',
          filter: 'audioandvideo',
        })
        console.log('Video is downloading rn ✅')

        const downloadFolder = path.join(require('os').homedir(), 'Downloads')
        const filePath = `${downloadFolder}/${videoTitle}.mp4`
        const writeStream = fs.createWriteStream(filePath)

        videoStream.pipe(writeStream)


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
              console.log(`Downloaded: ${downloadedBytes} bytes (${percentage}%)`);
              console.log(`Total Byte: ${totalBytes} `);
              console.log(`Remaining: ${totalBytes - downloadedBytes} bytes`);
              message.reply(`Converting... %${percentage} `)
            }, 3000); // Her 1 saniyede bir yazdırmak için 1000ms (1 saniye) kullanılır
          }

          if (downloadedBytes >= totalBytes) {
            clearInterval(interval);
            interval = null;
          }
        });
        

        writeStream.on('finish', async () => {
          const embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 16777215).toString(16)) // Embed mesajının rengi
            .setTitle(`${videoTitle} downloaded successfully ✅ `)
            .setURL(videoUrl)
            .setDescription(
              'If you like the bot, you can move us up by commenting on our top.gg page 😏',
            )

          const videoAttachment = new AttachmentBuilder(filePath)
          console.log(videoAttachment)

          await message.reply({
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
