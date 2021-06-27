const got = require('got')
exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }
  let data
  try {
    data = JSON.parse(event.body)
  } catch (_) {
    return { statusCode: 400, body: 'Badly Formatted Body' }
  }

  if (!data || !data.user) {
    return { statusCode: 400, body: 'No content to send' }
  }

  try {
    if (!process.env.WEBHOOK_URL)
      return { statusCode: 500, body: 'Missing env variable' }
    const { displayName, provider, providerId } = data.user
    await got.post(process.env.WEBHOOK_URL, {
      body: {
        content: `[Nightbot Playlist] - ${displayName} from ${provider} ${providerId}`,
        username: 'Nightbot Playlist',
        avatar_url: 'https://nightbot.tv/assets/images/login-logo.png'
      },
      json: true
    })

    return { statusCode: 204, body: '' }
  } catch (error) {
    return { statusCode: 500, body: 'Error sending message' }
  }
}
