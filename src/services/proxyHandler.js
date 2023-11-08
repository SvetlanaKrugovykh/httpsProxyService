
async function handleRequest(req, res, netData) {
  try {
    if (req.rawHeaders[1] === netData.target_name) {
      res.writeHead(200)
      res.end()
      return
    }

    const currentTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    const Location = netData.target + 'redirect.html'

    console.log(`Request start at ${currentTime}:`, req.rawHeaders[1])

    res.writeHead(302, {
      'Location': Location,
    })
    res.end()
  } catch (error) {
    console.error('Error while handling request:', error)
  }
}

async function handleProxyHttpsRequest(req, res, netData) {
  try {
    console.log(req.rawHeaders[1])
    console.log(netData.target_name)
    console.log(req.rawHeaders[1] === netData.target_name)
    if (req.rawHeaders[1] === netData.target_name) {
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
    console.error('Error while handling request:', error)
  }
}


module.exports = { handleRequest, handleProxyHttpsRequest }