const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { botRoom } = require('./config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('needhelp')
		.setDescription('Upozorní na tvůj problém v kanálu hepl')
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Můžeš připsat s čím potřebuješ pomoct.')
				.setRequired(false)
		)
		.addSubcommand(subcommand =>
            subcommand
                .setName('modhelp')
                .setDescription('Pošle upozornění moderátorům.')
				.addStringOption(option =>
					option.setName('reason')
						.setDescription('Můžeš připsat s čím potřebuješ pomoct.')
						.setRequired(false)
				)),
	async execute(interaction) {
		const { commandName, channel } = interaction;
		const userId = interaction.member.user.id; 
		const username = interaction.member.user.username; 
        //const messageId = interaction.messageId;
		const channelName = channel.name;
		const reason = "";
		if (subcommand === 'modhelp'){
			const botChannel = client.channels.cache.get(botRoom); //fetchne objekt kanálu podle ID

			if (interaction.options.getString("reason")) {
				reason = interaction.options.getString("reason");
				heplChannel.send("Uživatel ${username} potřebuje pomoct v kanálu ${channelName} s '${reason}'.")
			}
			else {
				heplChannel.send("Uživatel ${username} potřebuje pomoct v kanálu ${channelName}")
			}
		}
		else {
			const heplChannel = client.channels.cache.get("1344726883610263715");
			if (interaction.options.getString("reason")) {
				reason = interaction.options.getString("reason");
				heplChannel.send("Uživatel ${username} potřebuje pomoct v kanálu ${channelName} s '${reason}'.")
			}
			else {
				heplChannel.send("Uživatel ${username} potřebuje pomoct v kanálu ${channelName}")
			}
		};
		await interaction.reply({ content: "Upozornění odesláno.", ephemeral: true });	
	},
};