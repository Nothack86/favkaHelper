const { SlashCommandBuilder } = require('discord.js');
const { ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('circle')
        .setDescription('Makes a personal Discord channel for you and people you invite.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Vytvoří nový textový kanál')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Jméno kanálu(kroužku)')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const userId = interaction.member.user.id;
        const subcommand = interaction.options.getSubcommand();
        const name = interaction.options.getString('name');
        const guild = interaction.guild;

        if (subcommand === 'create') {
            try {
                // Defer the reply immediately
                await interaction.deferReply({ ephemeral: true });

                // Check bot permissions
                const botMember = interaction.guild.members.me;
                if (!botMember.permissions.has(['ManageChannels', 'ViewChannel'])) {
                    return await interaction.editReply({ 
                        content: 'Bot nemá potřebná oprávnění k vytvoření kanálu. Potřebuje oprávnění "Spravovat kanály".'
                    });
                }

                const channel = await guild.channels.create({
                    name: name,
                    type: 0, // GUILD_TEXT
                    nsfw: false,
                    parent: '1340995891754176563',
                    permissionOverwrites: [
                        {
                            id: userId,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.ManageChannels,
                            ],
                            deny: ['UseApplicationCommands']
                        },
                        {
                            id: guild.id,
                            deny: ['ViewChannel']
                        },
                        {
                            id: botMember.id,
                            allow: ['ViewChannel', 'SendMessages', 'ManageChannels']
                        }
                    ],
                    reason: 'New circle channel created'
                });

                await interaction.editReply({ content: `Kanál ${name} byl vytvořen.` });
            } catch (error) {
                console.error(error);
                if (interaction.deferred) {
                    await interaction.editReply({ 
                        content: error.code === 50013 
                            ? 'Bot nemá potřebná oprávnění k vytvoření kanálu. Kontaktujte administrátora serveru.'
                            : 'Něco se nepodařilo při vytváření kanálu.'
                    });
                } else {
                    await interaction.reply({ content: 'Něco se nepodařilo při vytváření kanálu.', ephemeral: true });
                }
            }
        } else {
            await interaction.reply({ content: "Neplatný příkaz", ephemeral: true });
        }
    },
};
