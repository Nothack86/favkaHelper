const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('circle')
		.setDescription('Makes a personal Discord channel for you and people you invite.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Vytvoří nový textový kanál')
				.addOption(option =>
					option.setName('Name')
						.setDescription('Jméno kanálu(kroužku)')
						.setRequired(true)
					)
				
        ),

	async execute(interaction) {
		const userId = interaction.member.user.id;
		const subcommand = interaction.options.getSubcommand();
		const name = interaction.options.getString('Name')
		if (subcommand === 'create') {
			const channel = await guild.channels.create('name', {
				type: 'GUILD_TEXT',
				topic: 'Toto je nový textový kanál',
				nsfw: false,
				parent: '1340995891754176563',
				permissionOverwrites: [
					{
						id: userId,
						allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
						deny: []
					}
				]
			});	
			interaction.reply('Kanál '+name+' byl vytvořen.')
		}
		else {
			interaction. reply('Neplatný příkaz.')
		}
	},
};