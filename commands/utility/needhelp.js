const { SlashCommandBuilder, MessageFlags } = require('discord.js');
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
                .setDescription('Odešle žádost o pomoc do kanálu pls-help.')
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
        if (interaction.member.roles.cache.has("1296157529335922688")) { // pro potížisty se nespustí
            await interaction.reply({ content: "https://tenor.com/view/chill-guy-chill-guy-just-a-chill-guy-relax-gif-1579445140409713118", ephemeral: false });
        }
        else {
            
        if (subcommand === 'modhelp') {
            const botChannel = interaction.client.channels.cache.get(botRoom);

            if (interaction.options.getString("reason")) {
                reason = interaction.options.getString("reason");
                botChannel.send({
                    content: `Uživatel <@${userId}> potřebuje pomoct v kanálu ${messageLink} s '${reason}'.`,
                    flags: [MessageFlags.SuppressEmbeds]
                });
            } else {
                botChannel.send({
                    content: `Uživatel <@${userId}> potřebuje pomoct v kanálu ${messageLink} .`,
                    flags: [MessageFlags.SuppressEmbeds]
                });
            }
        } else {
            // 'normal' subcommand nebo jakýkoliv jiný
            const heplChannel = interaction.client.channels.cache.get("1344726883610263715");
            if (interaction.options.getString("reason")) {
                reason = interaction.options.getString("reason");
                heplChannel.send({
                    content: `Uživatel <@${userId}> potřebuje pomoct v kanálu ${messageLink} s "${reason}".`,
                    flags: [MessageFlags.SuppressEmbeds]
                });
            } else {
                heplChannel.send({
                    content: `Uživatel <@${userId}> potřebuje pomoct v kanálu ${messageLink} .`,
                    flags: [MessageFlags.SuppressEmbeds]
                });
            }
        }
        
        await interaction.reply({ content: "Upozornění odesláno.", ephemeral: false });
        }
    },
};