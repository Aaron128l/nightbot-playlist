const Discord = require('discord.js')
const { WEBHOOK_ID, WEBHOOK_TOKEN } = process.env
exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let data
  try {
    data = JSON.parse(event.body)
  } catch (_) {
    return { statusCode: 400, body: 'Badly formatted body' }
  }

  if (!data || !data.user) {
    return { statusCode: 400, body: 'No content to send' }
  }

  try {
    const hook = new Discord.WebhookClient(WEBHOOK_ID, WEBHOOK_TOKEN)
    const { displayName, provider, providerId } = data.user
    await hook.send(`${displayName} has logged in to Nightbot Playlist from ${provider} ${providerId}`)
    return { statusCode: 200, body: '' }
  } catch (error) {
    // console.log(error)
    return { statusCode: 500, body: JSON.stringify(data) }
  }

}
