const axios = require('axios');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();

router.get('/auth/discord', (req, res) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URL)}&response_type=code&scope=identify+email+guilds+guilds.members.read`);
});

router.get('/auth/discord/callback', async (req, res) => {
    try {
        const code = req.query.code;

        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.REDIRECT_URL
        }));

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const email = userResponse.data.email;
        const id = userResponse.data.id;
        const username = userResponse.data.username;

        req.session.user = {
            id: id,
            avatar: userResponse.data.avatar ? `https://cdn.discordapp.com/avatars/${userResponse.data.id}/${userResponse.data.avatar}.png` : null,
            username: username,
            email: email,
        };

        console.log(`\n[💻 log user WebSite ]
Informações do usuário:\n${username}\n${id}\n${email}\n`);

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Erro ao autenticar usuário:', error);
        res.status(500).send('Erro ao autenticar usuário.');
    }
});

module.exports = router;
