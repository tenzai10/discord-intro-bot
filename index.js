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
const filepath = path.join(__dirname, 'intro.mp3');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

const YOUR_USER_ID = '514136490830462986';
const INTRO_FILE = path.join(__dirname, 'intro.MP3');

client.once('ready', () => {
    console.log(`🤖 Bot is online as ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (
        newState.member.id === YOUR_USER_ID &&
        !oldState.channelId &&
        newState.channelId
    ) {
        console.log("🎧 User joined voice channel.");

        if (!fs.existsSync(INTRO_FILE)) {
            console.error("❌ intro.MP3 not found!");
            return;
        }

        const channel = newState.channel;

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
        });

        const player = createAudioPlayer();

        const resource = createAudioResource(INTRO_FILE, {
            inlineVolume: true // Enable volume control
        });

        // Set volume to 2%
        resource.volume.setVolume(0.02);
        console.log("🔉 Volume set to 2%");

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
            player.play(resource);
            connection.subscribe(player);
            console.log(`🎶 Now playing: ${INTRO_FILE}`);

            player.once(AudioPlayerStatus.Idle, () => {
                console.log("🎵 Finished playing. Disconnecting.");
                connection.destroy();
            });

            player.once('error', err => {
                console.error('❌ Playback error:', err);
                connection.destroy();
            });
        } catch (err) {
            console.error('❌ Connection failed:', err);
            connection.destroy();
        }
    }
});

client.login(process.env.TOKEN); // Replace with your bot token


