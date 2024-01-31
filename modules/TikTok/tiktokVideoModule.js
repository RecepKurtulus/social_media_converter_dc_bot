require('dotenv').config()
const slugify = require('slugify')
const fs = require('fs')
const path = require('path')
const { downloadTikTokVideo } = require('./tiktokDataScraper')
const { AttachmentBuilder, EmbedBuilder } = require('discord.js')
// Discord.js versions ^13.0 require us to explicitly define client intents

module.exports.tiktokVideoModule = async (message, client) => {
  try {
    //Downloading video to our storage
    const videoUrl = message.options.getString('link')

    const firstReply = message.reply('✅ Video Converting...', {
      ephemeral: true,
    })
    const filePath = await downloadTikTokVideo(videoUrl)
    console.log(`Modüldeki filePath: ${filePath}`)
    const embed = new EmbedBuilder()
      .setColor('#621A55')
      .setTitle(` downloaded successfully ✅ `)
      .setURL(videoUrl)
      .setDescription('test :p')
      .setAuthor({ name: message.user.username })
    const videoAttachment = new AttachmentBuilder(filePath)
    console.log(videoAttachment)
    await message.editReply({
      embeds: [embed],
      content: `<@${message.user.id}>`,
      files: [videoAttachment],
      ephemeral: true,
    })

    fs.rm(filePath, (error) => {
      if (error) {
        console.log('❌ Dosya silinirken bir hata oluştu:', error)
      } else {
        console.log('Video başarıyla diskten silindi✅')
      }
    })
  } catch (error) {
    console.log(error)
  }
}
