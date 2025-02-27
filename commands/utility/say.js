const { SlashCommandBuilder } = require('discord.js');
const { ownerId } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Nepovolený příkaz')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Zpráva k zobrazení')
                .setRequired(true)
        ),
    async execute(interaction) {
        const userId = interaction.user.id;
        const { channel } = interaction;
        
        if (userId === ownerId) {
            const message = interaction.options.getString('message');
            await channel.send(message); // Přidáno await pro asynchronní volání
            await interaction.reply({ content: 'Odesláno', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Promiň ale tuhle funkci nemůžeš použít.', ephemeral: true });
            console.log(`${interaction.user.username} tried to use the "say" command`);
        }
    },
};