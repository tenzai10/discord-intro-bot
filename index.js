const { Client, GatewayIntentBits } = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    entersState,
    VoiceConnectionStatus
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

// Make sure filename matches exactly: lowercase .mp3
const INTRO_FILE = path.join(__dirname, 'intro.mp3');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

// 👇 Replace this with your actual Discord user ID
const YOUR_USER_ID = 'YOUR_DISCORD_USER_ID';

client.once('ready', () => {
    console.log(`🤖 Bot is online as ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (
        newState.member?.id === YOUR_USER_ID &&
        !oldState.channelId &&
        newState.channelId
    ) {
        const channel = newState.channel;

        // Check if the intro.mp3 file exists
        if (!fs.existsSync(INTRO_FILE)) {
            console.error('❌ intro.mp3 not found!');
            return;
        }

        try {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(INTRO_FILE);

            player.play(resource);
            connection.subscribe(player);

            await entersState(player, AudioPlayerStatus.Playing, 5_000);
            console.log('🎵 Playing intro.mp3');

            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
            });

            player.on('error', error => {
                console.error('❌ Audio player error:', error);
                connection.destroy();
            });

        } catch (error) {
            console.error('❌ Failed to play intro:', error);
        }
    }
});

client.login(process.env.TOKEN);
