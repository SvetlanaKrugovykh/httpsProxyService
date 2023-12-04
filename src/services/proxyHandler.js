
async function handleRequest(req, res, netData) {
  const currentTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  try {
    if (req.rawHeaders[1] === netData.target_name && req.url === '/redirect.html') {
      res.writeHead(200)
      res.end()
      return
    }

    const currentTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    const Location = netData.target + 'redirect.html'
    let headerValue = req.rawHeaders[1] || ''
    headerValue = headerValue.slice(-35)

    console.log(`Request start at ${currentTime}:`, headerValue)

    res.writeHead(302, {
      'Location': Location,
    })
    res.end()
  } catch (error) {
    let reqContentSnippet = ''
    if (req.body && req.body.length > 15) {
      reqContentSnippet = req.body.substring(0, 15)
    } else if (req.body) reqContentSnippet = req.body
    console.error(`Error while handling request:: at ${currentTime}, Request Content: ${reqContentSnippet}...`)
  }
}

async function handleProxyHttpsRequest(req, res, netData) {
  try {
    if (req.rawHeaders[1] === netData.target_name && req.url === '/redirect.html') {
      res.writeHead(200)
      res.end()
      return
    }
    const currentTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    console.log(`Proxy request start at ${currentTime}:`, req.rawHeaders[1])

    const redirectUrl = netData.target + 'redirect.html'

    res.writeHead(302, {
      'Location': redirectUrl,
    })
    res.end()
  } catch (error) {
    let reqContentSnippet = ''
    if (req.body && req.body.length > 15) {
      reqContentSnippet = req.body.substring(0, 15)
    } else if (req.body) reqContentSnippet = req.body
    console.error(`Error while handling request:: at ${currentTime}, Request Content: ${reqContentSnippet}...`)
  }
}


module.exports = { handleRequest, handleProxyHttpsRequest }