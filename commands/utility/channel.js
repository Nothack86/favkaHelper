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
                        .setDescription('Jméno kanálu nebo jména kanálů oddělená mezerami')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('hide')
                .setDescription('Skryje kanál uživateli')
                .addStringOption(option =>
                    option.setName('channelname')
                        .setDescription('Jméno kanálu nebo jména kanálů oddělená mezerami')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const userId = interaction.member.user.id;
        const subcommand = interaction.options.getSubcommand();
        const channelNameInput = interaction.options.getString('channelname');
        const channelNames = channelNameInput.split(' ').filter(name => name.trim() !== '');
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
            
            // Check bot permissions
            const botMember = interaction.guild.members.me;
            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return await interaction.editReply({ 
                    content: 'Bot nemá potřebná oprávnění ke změně oprávnění kanálu. Potřebuje oprávnění "Spravovat kanály".'
                });
            }
            
            // Process each channel
            const results = [];
            
            for (const channelName of channelNames) {
                // Find the channel by name in the channels.json file
                const channelInfo = channelsData.find(ch => ch.channelname === channelName);
                
                if (!channelInfo) {
                    results.push(`❌ Kanál "${channelName}" nebyl nalezen v seznamu kanálů.`);
                    continue;
                }
                
                // Get the channel using the ID from channels.json
                let channel;
                try {
                    channel = await guild.channels.fetch(channelInfo.channelid);
                } catch (fetchError) {
                    results.push(`❌ Kanál "${channelName}" existuje v seznamu, ale není dostupný na serveru.`);
                    continue;
                }
                
                if (!channel) {
                    results.push(`❌ Kanál "${channelName}" existuje v seznamu, ale není dostupný na serveru.`);
                    continue;
                }
                
                try {
                    if (subcommand === 'show') {
                        await channel.permissionOverwrites.create(userId, {
                            ViewChannel: true
                        });
                        results.push(`✅ Kanál "${channelName}" byl pro vás zpřístupněn.`);
                    } else if (subcommand === 'hide') {
                        await channel.permissionOverwrites.create(userId, {
                            ViewChannel: false
                        });
                        results.push(`✅ Kanál "${channelName}" byl pro vás skryt.`);
                    }
                } catch (permError) {
                    results.push(`❌ Nepodařilo se upravit oprávnění pro kanál "${channelName}".`);
                }
            }
            
            // Send summary of all operations
            await interaction.editReply({ 
                content: results.join('\n')
            });
            
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
