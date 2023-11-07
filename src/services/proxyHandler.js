
async function handleProxyRequest(req, res, netData) {
  try {
    const currentTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    const Location = netData.target + 'redirect.html'

    console.log(`Proxy request start at ${currentTime}:`, req.rawHeaders[1])

    res.writeHead(302, {
      'Location': Location,
    })
    res.end()
  } catch (error) {
    console.error('Error while handling request:', error)
  }
}

module.exports = handleProxyRequest 