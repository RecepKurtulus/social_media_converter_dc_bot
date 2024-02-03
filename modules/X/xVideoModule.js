
require('dotenv').config()
const slugify = require('slugify')
const fs = require('fs')
const path = require('path')
const { fetchDataFromX } = require("./xDataScraper");
// Discord.js versions ^13.0 require us to explicitly define client intents
const {
  
  EmbedBuilder,
  AttachmentBuilder,
  

} = require('discord.js')

module.exports.xVideoModule = async (message,client) => {

  try{
        const user = message.user;
        const taggedUser = `${user.username}`;
        //Downloading video to our storage
        const videoUrl = message.options.getString('link');
        const firstReply=message.reply('Video Converting...');
        
        const filePath = await fetchDataFromX(videoUrl);
        console.log(`Modüldeki filePath: ${filePath}`)
        const videoAttachment = new AttachmentBuilder(filePath)
        const embedReply=new EmbedBuilder()
        .setColor('#621A55') 
        .setTitle(`${taggedUser} ur video ready to use ✅ `)
        .setURL(videoUrl)
        .setDescription(
          'test :p',
        )
        .setTimestamp()
	      .setFooter({ text: taggedUser, iconURL:user.displayAvatarURL() });
        console.log(videoAttachment)
        await message.editReply({
            content: 'Video Converted!',
            embeds:[embedReply],
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
      catch(error){
        console.log(error);
    }
    }
    
