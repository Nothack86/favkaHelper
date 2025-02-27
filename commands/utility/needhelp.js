const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { botRoom } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('needhelp')
        .setDescription('Upozorní na tvůj problém v kanálu hepl')
        // Přidáváme základní subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('normal')
                .setDescription('Standardní žádost o pomoc')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Můžeš připsat s čím potřebuješ pomoct.')
                        .setRequired(false)))
        // Přidáváme modhelp subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('modhelp')
                .setDescription('Pošle upozornění moderátorům.')
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Můžeš připsat s čím potřebuješ pomoct.')
                        .setRequired(false))),

    async execute(interaction) {
        const { channel } = interaction;
        const userId = interaction.member.user.id;
        const username = interaction.member.user.username;
        const channelName = channel.name;
        let reason = "";
        
        // Zjistíme, který subcommand byl použit
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'modhelp') {
            const botChannel = interaction.client.channels.cache.get(botRoom);

            if (interaction.options.getString("reason")) {
                reason = interaction.options.getString("reason");
                botChannel.send(`Uživatel ${username} potřebuje pomoct v kanálu ${channelName} s '${reason}'.`);
            } else {
                botChannel.send(`Uživatel ${username} potřebuje pomoct v kanálu ${channelName}`);
            }
        } else {
            // 'normal' subcommand nebo jakýkoliv jiný
            const heplChannel = interaction.client.channels.cache.get("1344726883610263715");
            if (interaction.options.getString("reason")) {
                reason = interaction.options.getString("reason");
                heplChannel.send(`Uživatel ${username} potřebuje pomoct v kanálu ${channelName} s '${reason}'.`);
            } else {
                heplChannel.send(`Uživatel ${username} potřebuje pomoct v kanálu ${channelName}`);
            }
        }
        
        await interaction.reply({ content: "Upozornění odesláno.", ephemeral: true });
    },
};