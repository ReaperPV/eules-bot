import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch'; // Make sure to install node-fetch

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.login(process.env.DISCORD_TOKEN);

const CHANNEL_ID = '1236050716733341818';
const ROLE_NON = 'non';
const ROLE_EVERYONE = 'Everyone';
const ROLE_CATA_50 = 'cata 50';
const ROLE_3K_INFERNAL_COMPS = '3k Infernal comps';
const ROLE_5K_INFERNAL_COMPS = '5k infernal comps';
const ROLE_10K_INFERNAL_COMPS = '10k Infernal comps';
const ROLE_CATA_60 = 'cata 60';
const HYPIXEL_API_KEY = '75fb1b6c-b8ba-4ba6-8fe2-2db0083c002f';

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== CHANNEL_ID) return;
    if (!message.member.roles.cache.some(role => role.name === ROLE_NON)) return;

    try {
        const playerUUID = await getPlayerUUID(message.content.trim());
        if (playerUUID) {
            const playerData = await getPlayerData(playerUUID);
            const discordUsername = playerData?.player?.socialMedia?.links?.DISCORD ?? 'Discord is not linked';
            await returnPlayerData(discordUsername, playerData, playerUUID, message);
        } else {
            await returnPlayerData('Not a real ign', null, null, message);
        }
    } catch (error) {
        console.error('Error processing message:', error);
        message.channel.send(`That username doesn't exist`);
    }
});

async function getPlayerUUID(username) {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    if (!response.ok) throw new Error('Failed to fetch UUID');
    const data = await response.json();
    return data.id;
}

async function getPlayerData(uuid) {
    const response = await fetch(`https://api.hypixel.net/player?key=${HYPIXEL_API_KEY}&uuid=${uuid}`);
    if (!response.ok) throw new Error('Failed to fetch player data');
    return await response.json();
}

async function returnPlayerData(discordUsername, playerData, uuid, message) {
    if (message.author.username === discordUsername) {
        const selectedProfile = await getSelectedProfile(uuid);
        if (selectedProfile) {
            const { cataLevel, kuudraComps } = getProfileStats(selectedProfile, uuid);
            if (cataLevel >= 85559640 || kuudraComps >= 500) {
                await confirmReqs(message);
                if (cataLevel >= 569800000) {
                    await Cata50Role(message);
                }
                if (cataLevel >= 2569800000) {
                    await Cata60Role(message);
                }
                if (kuudraComps >= 3000) {
                    await ThreeThousandCompsRole(message);
                }
                if (kuudraComps >= 5000) {
                    await FiveThousandCompsRole(message);
                }
                if (kuudraComps >= 10000) {
                await TenThousandCompsRole(message);
                }
            } else {
                message.channel.send(`You don't meet the requirements :(`);
            }
        } else {
            message.channel.send('No selected profile found');
        }
    } else {
        handleNonMatchingData(discordUsername, message);
    }
}

async function getSelectedProfile(uuid) {
    const response = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?key=${HYPIXEL_API_KEY}&uuid=${uuid}`);
    if (!response.ok) throw new Error('Failed to fetch Skyblock profiles');
    const data = await response.json();
    return data.profiles.find(profile => profile.selected);
}

function getProfileStats(profile, uuid) {
    const cataLevel = profile.members[uuid].dungeons.dungeon_types.catacombs.experience;
    const kuudraComps = profile.members[uuid].nether_island_player_data.kuudra_completed_tiers.infernal;
    return { cataLevel, kuudraComps };
}

async function confirmReqs(message) {
    message.channel.send('You meet the reqs!');
    const everyoneRole = message.guild.roles.cache.find(role => role.name === ROLE_EVERYONE);
    const nonRole = message.guild.roles.cache.find(role => role.name === ROLE_NON);
    if (everyoneRole) await message.member.roles.add(everyoneRole);
    if (nonRole) await message.member.roles.remove(nonRole);
}

function handleNonMatchingData(discordUsername, message) {
    if (discordUsername === 'Discord is not linked') {
        message.channel.send('Your Discord account is not linked');
    } else if (discordUsername === 'Not a real ign') {
        message.channel.send(`That username doesn't exist`);
    } else {
        message.channel.send(`That's not you...`);
    }
}
async function Cata50Role(message) {
    message.channel.send('Added Cata 50 Role')
    const Cata50 = message.guild.roles.cache.find(role => role.name === ROLE_CATA_50)
    if (Cata50) await message.member.roles.add(Cata50)
}

async function ThreeThousandCompsRole(message) {
    message.channel.send('Added 3k comps Role')
    const ThreeThousandComps = message.guild.roles.cache.find(role => role.name === ROLE_3K_INFERNAL_COMPS)
    if (ThreeThousandComps) await message.member.roles.add(ThreeThousandComps)
}

async function FiveThousandCompsRole(message) {
    message.channel.send('Added 5k comps Role')
    const FiveThousandComps = message.guild.roles.cache.find(role => role.name === ROLE_5K_INFERNAL_COMPS)
    if (FiveThousandComps) await message.member.roles.add(FiveThousandComps)
}

async function TenThousandCompsRole(message) {
    message.channel.send('Added 10k comps Role')
    const TenThousandComps = message.guild.roles.cache.find(role => role.name === ROLE_10K_INFERNAL_COMPS)
    if (TenThousandComps) await message.member.roles.add(TenThousandComps)
}

async function Cata60Role(message){
    message.channel.send('Added Cata 60 Role')
    const Cata60 = message.guild.roles.cache.find(role => role.name === ROLE_CATA_60)
    if (Cata60) await message.member.roles.add(Cata60)
}
