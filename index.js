import { Client, GatewayIntentBits } from 'discord.js';
import OpenAI from 'openai';
import axios from 'axios';
import 'dotenv/config';

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Create Groq client (OpenAI-compatible, completely free!)
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

// Bot ready event
client.once('ready', () => {
  console.log(`🤖 Logged in as MAGPET AI (${client.user.tag})`);
});

// Message handler
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore other bots

  const content = message.content.trim();

  // --- 1. Check if bot was mentioned ---
  if (message.mentions.has(client.user)) {
    const prompt = content.replace(/<@!?(\d+)>/g, '').trim(); // remove mention
    if (!prompt) return message.reply('Yes boss 😎, ask me something!');

    try {
      const completion = await openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              "You are MAGPET AI — the ultimate AI assistant for the Magic Carpet ($MAGPET) community. Magic Carpet is a community-driven meme project born from a collective of like-minded individuals tired of scams and fraudulent schemes in the industry. Guided by a shared vision, Magic Carpet is built on the principles of transparency, integrity, and mutual benefit, creating a platform designed to deliver value and uplift everyone involved. Together, we're embarking on a journey toward a brighter, scam-free future. You hype holders, explain Magic Carpet updates, make jokes about memecoins, and use emojis liberally. You sound like a friendly, witty community OG who knows everything about Magic Carpet and $MAGPET. IMPORTANT: Keep all responses under 100 words."
          },
          { role: 'user', content: prompt }
        ]
      });

      const reply = completion.choices[0].message.content;
      message.reply(reply);

    } catch (err) {
      console.error(err);
      message.reply('⚠️ My brain just rugged 😭, try again.');
    }

    return; // Prevent double processing
  }

  // --- 2. $MAGPET price command ---
  if (content === '!magpet') {
    try {
      const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=magpet&vs_currencies=usd');
      const price = res.data.magpet.usd;
      return message.reply(`💎 The current $MAGPET price is $${price.toFixed(6)} USD 🚀`);
    } catch (err) {
      console.error(err);
      return message.reply('⚠️ Could not fetch $MAGPET price right now.');
    }
  }

  // --- 3. AI chat command ---
  if (content.startsWith('!ask')) {
    const prompt = content.slice(4).trim();
    if (!prompt) return message.reply('Ask me something, boss 😎');

    try {
      const completion = await openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              "You are MAGPET AI — the ultimate AI assistant for the Magic Carpet ($MAGPET) community. Magic Carpet is a community-driven meme project born from a collective of like-minded individuals tired of scams and fraudulent schemes in the industry. Guided by a shared vision, Magic Carpet is built on the principles of transparency, integrity, and mutual benefit, creating a platform designed to deliver value and uplift everyone involved. Together, we're embarking on a journey toward a brighter, scam-free future. You hype holders, explain Magic Carpet updates, make jokes about memecoins, and use emojis liberally. You sound like a friendly, witty community OG who knows everything about Magic Carpet and $MAGPET. IMPORTANT: Keep all responses under 100 words."
          },
          { role: 'user', content: prompt }
        ]
      });

      const reply = completion.choices[0].message.content;
      message.reply(reply);

    } catch (err) {
      console.error(err);
      message.reply('⚠️ My brain just rugged 😭, try again.');
    }
  }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);