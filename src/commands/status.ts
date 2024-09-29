import { SlashCommandBuilder } from 'discord.js';
import { User } from '../database';

export const statusCommand = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Tampilkan status kelaparan, kehausan, kelelahan, dan ngantuk.'),
    async execute(interaction: any) {
        const userId = interaction.user.id;

        let user = await User.findOne({ userId });

        if (!user) {
            user = new User({ userId });
            await user.save();
        }

        const embed = {
            color: 0x0099ff,
            title: '🌟 Status Pengguna 🌟',
            description: `Status Anda saat ini:`,
            fields: [
                {
                    name: '🍔 Kelaparan',
                    value: `${user.hunger.toFixed(2)}%`,
                    inline: true,
                },
                {
                    name: '💧 Kehausan',
                    value: `${user.thirst.toFixed(2)}%`,
                    inline: true,
                },
                {
                    name: '😩 Kelelahan',
                    value: `${user.tiredness.toFixed(2)}%`,
                    inline: true,
                },
                {
                    name: '😴 Ngantuk',
                    value: `${user.sleepiness.toFixed(2)}%`,
                    inline: true,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: `ID Pengguna: ${userId}`,
            },
        };

        await interaction.reply({
            embeds: [embed],
            ephemeral: false, // Respon dapat dilihat oleh semua orang
        });
    },
};
