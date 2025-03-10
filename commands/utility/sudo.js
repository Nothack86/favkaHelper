const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { owner } = require('../../config.json');

function getNickname(troublemaker) {
    guild.members.fetch(troublemaker).then(member => {
        if (member.nickname) {
            return member.nickname;
        } else {
            return member.user.username;
        }
    }).catch(console.error);
    return null;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sudo')
        .setDescription('Nástroje pro moderátory')
        .addStringOption(option =>
            option.setName('parameters')
                .setDescription('Ti co vědí ;)')
                .setRequired(true)
        ),
    async execute(interaction) {
        const username = interaction.member.user.username;
        if (interaction.member.roles.cache.has("1284041546458464328")) { // má roli moderátor
            const input = interaction.options.getString(parameters);
            const params = input.split(" ");
            if (params[0] == "") {
                //funkce
            }
        } else {
            await interaction.reply('${username} is not in the sudoers file, this incident will be reported');
            console.log("${username} tried to use forbiden command");
        }
    },
};

// funkce troblemaker, nechci ji smazat ale zatim na ni kaslu
/* if (guild.members.cache.find(member => member.user.username === username)) {
    const troublemakerUsername = interaction.options.getString(troublemakerUsername);
    const troublemaker = guild.members.cache.find(member => member.user.username === troublemakerUsername);
    const displayTroublemaker = getNickname(troublemaker);
    troublemaker.roles.add('1296157529335922688'); // nastaví roli potížista
    await interaction.reply({ content: "Člen ${displayTroublemaker} dostal roli: Potížista", ephemeral: true });
} else {
    await interaction.reply({ content: "Člen nenalezen", ephemeral: true });
}*/