// filepath: ./commands/needhelp.js
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { botRoom } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('needhelp')
        .setDescription('Upozorní na tvůj problém v kanálu hepl')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Můžeš připsat s čím potřebuješ pomoct.')
                .setRequired(false))
        // Nová struktura pro subcommand - musí být ve skupině kvůli Discord API
        .addSubcommandGroup(group =>
            group.setName('special')
                .setDescription('Speciální typy pomoci')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('modhelp')
                        .setDescription('Pošle upozornění moderátorům.'))),

    async execute(interaction) {
        const { channel } = interaction;
        const userId = interaction.member.user.id;
        const username = interaction.member.user.username;
        const channelName = channel.name;
        // Změněno z const na let, protože hodnotu měníme
        let reason = "";

        // Nový způsob kontroly subcommandu
        if (interaction.options.getSubcommand() === 'modhelp') {
            // Přístup k client přes interaction.client místo globální proměnné
            const botChannel = interaction.client.channels.cache.get(botRoom);

            if (interaction.options.getString("reason")) {
                reason = interaction.options.getString("reason");
                // Použití backticks místo uvozovek pro string interpolaci
                botChannel.send(`Uživatel ${username} potřebuje pomoct v kanálu ${channelName} s '${reason}'.`);
            } else {
                botChannel.send(`Uživatel ${username} potřebuje pomoct v kanálu ${channelName}`);
            }
        } else {
            const heplChannel = interaction.client.channels.cache.get("1344726883610263715");
            if (interaction.options.getString("reason")) {
                reason = interaction.options.getString("reason");
                // Použití backticks místo uvozovek pro string interpolaci
                heplChannel.send(`Uživatel ${username} potřebuje pomoct v kanálu ${channelName} s ${reason}.`);
            } else {
                heplChannel.send(`Uživatel ${username} potřebuje pomoct v kanálu ${channelName}`);
            }
        }
        
        await interaction.reply({ content: "Upozornění odesláno.", ephemeral: true });
    },
};