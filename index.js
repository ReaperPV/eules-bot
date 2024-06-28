import dotenv from 'dotenv'
dotenv.config()

import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.login(process.env.DISCORD_TOKEN);

client.on("messageCreate", async (message) => {

    if(message.author.bot) return;
    if(message.channel.id !== '1236050716733341818') return;
    if(!message.member.roles.cache.some(role => role.name === 'non')) return;

    let playerUUID = ''

    fetch(`https://api.mojang.com/users/profiles/minecraft/${message.content}`)
        .then(response => response.json())
        .then(data => {
            if(data) {
                playerUUID = data.id;
    
                if(playerUUID) {
                    getProfileData(playerUUID);
                } else {
                    returnPlayerData('Not a real ign', false)
                }
            }
        })
        
    function getProfileData(id) {
    
        
            fetch(`https://api.hypixel.net/player?key=75fb1b6c-b8ba-4ba6-8fe2-2db0083c002f&uuid=${id}`)
                .then(response => response.json())
                .then(data => {
                    let profileData = data
                    let playerData = profileData;

                    if (playerData && playerData.player && playerData.player.socialMedia && playerData.player.socialMedia.links && playerData.player.socialMedia.links.DISCORD) {
                        playerData = playerData.player.socialMedia.links.DISCORD
                    } else {
                        playerData = 'Discord is not linked';
                    }

                    returnPlayerData(playerData, profileData, id);
                })    
    }

    function returnPlayerData(data, profileData, uuid) {
        // message.channel.send(data);

        if(message.author.username == data) {
            message.channel.send(data);

            fetch(`https://api.hypixel.net/v2/skyblock/profiles?key=75fb1b6c-b8ba-4ba6-8fe2-2db0083c002f&uuid=${uuid}`)
                .then(response => response.json())
                .then(data => {
                    const selectedProfile = data.profiles.find(profile => profile.selected);

                    if (!selectedProfile) {
                        message.channel.send('No selected profile found');
                        return;
                    }

                    const cataLevel = selectedProfile.members[uuid].dungeons.dungeon_types.catacombs.experience
                    const kuudraComps = selectedProfile.members[uuid].nether_island_player_data.kuudra_completed_tiers.infernal
 
                    if (cataLevel >= 85559640 || kuudraComps >= 500) {
                        confirmReqs();
                    } else {
                        message.channel.send(`You don't meet the requirements :(`)
                    }
                })

            function confirmReqs() {
                message.channel.send('You meet the reqs!')

                message.member.roles.add(message.guild.roles.cache.find(role => role.name === 'Everyone'))
                message.member.roles.remove(message.guild.roles.cache.find(role => role.name === 'non'))
            }


        } else if(data == 'Discord is not linked') {
            message.channel.send(message.content);
            message.channel.send('Your discord account is not linked')
        } else if(data == 'Not a real ign') {
            message.channel.send(message.content);
            message.channel.send(`That username doesn't exist`)
        } else {
            message.channel.send(message.content);
            message.channel.send(`That's not you...`)
        }
    }


})