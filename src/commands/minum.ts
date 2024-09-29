import { SlashCommandBuilder } from 'discord.js';
import { User } from '../database';

export const minumCommand = {
    data: new SlashCommandBuilder()
        .setName('minum')
        .setDescription('Minum untuk mengurangi haus dari anggota yang dipilih.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Anggota yang akan diberi minum')
                .setRequired(true)),  // Anggota yang akan dipilih harus diisi
    async execute(interaction: any) {
        const userId = interaction.user.id;
        const targetUser = interaction.options.getUser('target');  // Ambil anggota yang dipilih
        const targetId = targetUser.id;

        // Cek apakah pengguna yang dipilih sudah terdaftar di database
        let targetUserData = await User.findOne({ userId: targetId });

        if (!targetUserData) {
            targetUserData = new User({ userId: targetId });  // Buat pengguna baru jika tidak ada
            await targetUserData.save();
        }

        // Cek apakah pengguna memiliki role yang diizinkan
        const allowedRoleId = '1275890158947926036'; // Ganti dengan ID role yang sesuai
        const member = interaction.member;

        // Pastikan member bukan null dan memeriksa role
        if (!member || !member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({
                content: 'Anda tidak memiliki akses untuk menggunakan perintah ini.',
                ephemeral: true,
            });
        }

        // Update status haus
        const thirstBefore = targetUserData.thirst;
        targetUserData.thirst = Math.max(0, targetUserData.thirst - 20);  // Kurangi haus sebesar 20%
        const thirstAfter = targetUserData.thirst;

        await targetUserData.save();

        // Kirim respon yang bisa dilihat semua orang dengan menampilkan perubahan persentase haus
        await interaction.reply({
            content: `✅ ${targetUser.username} telah diberi minum!\nHaus berkurang dari ${thirstBefore.toFixed(2)}% menjadi ${thirstAfter.toFixed(2)}%.`,
            ephemeral: false,  // Mengubah ke false agar semua orang bisa melihat
        });
    },
};
