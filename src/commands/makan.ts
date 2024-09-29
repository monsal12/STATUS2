import { SlashCommandBuilder } from 'discord.js';
import { User } from '../database';

export const makanCommand = {
    data: new SlashCommandBuilder()
        .setName('makan')
        .setDescription('Makan untuk mengurangi kelaparan dari anggota yang dipilih.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Anggota yang akan diberi makan')
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

        // Update status kelaparan
        const hungerBefore = targetUserData.hunger;
        targetUserData.hunger = Math.max(0, targetUserData.hunger - 20);  // Kurangi kelaparan sebesar 20%
        const hungerAfter = targetUserData.hunger;

        await targetUserData.save();

        // Kirim respon yang bisa dilihat semua orang dengan menampilkan perubahan persentase kelaparan
        await interaction.reply({
            content: `✅ ${targetUser.username} telah diberi makan!\nKelaparan berkurang dari ${hungerBefore.toFixed(2)}% menjadi ${hungerAfter.toFixed(2)}%.`,
            ephemeral: false,  // Mengubah ke false agar semua orang bisa melihat
        });
    },
};
