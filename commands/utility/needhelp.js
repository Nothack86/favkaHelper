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
        
        // Vytvoříme odkaz přímo na zprávu, která spustila příkaz
        const messageLink = `https://discord.com/channels/${interaction.guild.id}/${channel.id}/${interaction.id}`;
        
        // Zjistíme, který subcommand byl použit
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'modhelp') {
            const botChannel = interaction.client.channels.cache.get(botRoom);

            if (interaction.options.getString("reason")) {
                reason = interaction.options.getString("reason");
                botChannel.send(`Uživatel <@${userId}> potřebuje pomoct v kanálu ${messageLink} s '${reason}'.`);
            } else {
                botChannel.send(`Uživatel <@${userId}> potřebuje pomoct v kanálu ${messageLink} .`);
            }
        } else {
            // 'normal' subcommand nebo jakýkoliv jiný
            const heplChannel = interaction.client.channels.cache.get("1344726883610263715");
            if (interaction.options.getString("reason")) {
                reason = interaction.options.getString("reason");
                heplChannel.send(`Uživatel <@${userId}> potřebuje pomoct v kanálu ${messageLink} s "${reason}".`);
            } else {
                heplChannel.send(`Uživatel <@${userId}> potřebuje pomoct v kanálu ${messageLink} .`);
            }
        }
        
        await interaction.reply({ content: "Upozornění odesláno.", ephemeral: false });
    },
};