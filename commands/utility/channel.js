const { SlashCommandBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const { roleOvereny } = require('../../config.json');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Spravuje viditelnost kanálů')
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Zpřístupní kanál uživateli')
                .addStringOption(option =>
                    option.setName('channelname')
                        .setDescription('Jméno kanálu, který chcete zobrazit')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('hide')
                .setDescription('Skryje kanál uživateli')
                .addStringOption(option =>
                    option.setName('channelname')
                        .setDescription('Jméno kanálu, který chcete skrýt')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const userId = interaction.member.user.id;
        const subcommand = interaction.options.getSubcommand();
        const channelName = interaction.options.getString('channelname');
        const guild = interaction.guild;

        try {
            // Defer the reply immediately
            await interaction.deferReply({ ephemeral: true });
            
            // Check if the user has the verified role
            const hasVerifiedRole = interaction.member.roles.cache.has(roleOvereny);
            if (!hasVerifiedRole) {
                return await interaction.editReply({ 
                    content: 'Pro použití tohoto příkazu musíte mít roli "ověřený".' 
                });
            }
            
            // Load channels from channels.json
            const channelsFilePath = path.join(__dirname, '../../channels.json');
            // Add try-catch specifically for file operations
            let channelsData;
            try {
                channelsData = JSON.parse(fs.readFileSync(channelsFilePath, 'utf8'));
            } catch (fileError) {
                console.error('Error loading channels.json:', fileError);
                return await interaction.editReply({ 
                    content: 'Nepodařilo se načíst seznam kanálů. Kontaktujte administrátora.' 
                });
            }
            
            // Find the channel by name in the channels.json file
            const channelInfo = channelsData.find(ch => ch.channelname === channelName);
            
            if (!channelInfo) {
                return await interaction.editReply({ 
                    content: `Kanál s názvem "${channelName}" nebyl nalezen v seznamu kanálů.` 
                });
            }
            
            // Get the channel using the ID from channels.json - improve error handling
            let channel;
            try {
                channel = await guild.channels.fetch(channelInfo.channelid);
            } catch (fetchError) {
                return await interaction.editReply({ 
                    content: `Kanál s názvem "${channelName}" existuje v seznamu, ale není dostupný na serveru.` 
                });
            }
            
            if (!channel) {
                return await interaction.editReply({ 
                    content: `Kanál s názvem "${channelName}" existuje v seznamu, ale není dostupný na serveru.` 
                });
            }
            
            // Check bot permissions
            const botMember = interaction.guild.members.me;
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return await interaction.editReply({ 
                    content: 'Bot nemá potřebná oprávnění ke změně oprávnění kanálu. Potřebuje oprávnění "Spravovat kanály".'
                });
            }
            
            if (subcommand === 'show') {
                await channel.permissionOverwrites.create(userId, {
                    ViewChannel: true
                });
                await interaction.editReply({ 
                    content: `Kanál "${channelName}" byl pro vás zpřístupněn.` 
                });
            } else if (subcommand === 'hide') {
                await channel.permissionOverwrites.create(userId, {
                    ViewChannel: false
                });
                await interaction.editReply({ 
                    content: `Kanál "${channelName}" byl pro vás skryt.` 
                });
            }
            
        } catch (error) {
            console.error('Channel command error:', error);
            if (interaction.deferred) {
                await interaction.editReply({ 
                    content: error.code === 50013 
                        ? 'Bot nemá potřebná oprávnění ke změně oprávnění kanálu. Kontaktujte administrátora serveru.'
                        : 'Něco se nepodařilo při úpravě oprávnění kanálu.'
                });
            } else {
                await interaction.reply({ 
                    content: 'Něco se nepodařilo při úpravě oprávnění kanálu.', 
                    ephemeral: true 
                });
            }
        }
    },
};
