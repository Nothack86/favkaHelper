const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('marco')
		.setDescription('Replies with Polo!'),
	async execute(interaction) {
		const userId = interaction.member.user.id; 
		const username = interaction.member.user.username; 
		console.log(`User ID: ${userId}`); 
		console.log(`Username: ${username}`);
		await interaction.reply('Polo!');
	},
};