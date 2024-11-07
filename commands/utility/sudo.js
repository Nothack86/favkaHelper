const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sudo')
		.setDescription('Nástroje pro moderátory')
        .addSubcommand(subcommand =>
            subcommand
                .setName('troublemaker')
                .setDescription('Označí potížistu')
                .addStringOption(option =>
                    option.setName('usernames')
                        .setDescription('Jména nových potížistů oddělená čárkami')
                        .setRequired(true)
                )),
	async execute(interaction) { 
		const username = interaction.member.user.username; 
        if (interaction.member.roles.cache.has("1284041546458464328")) {
            await interaction.reply('Tato funkcionalita ještě nebyla implementována');
        } else {
            await interaction.reply('${username} is not in the sudoers file, this incident will be reported');
            console.log("${username} tried to use forbiden command");
        }
	},
};