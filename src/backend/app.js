const request = require('request')
const uuid = require('uuid/v4')

const config = require('./util/config')

// Base url for api to proxy to.
const BASE_URL = config.base_url

const app = (server) => {
  const io = require('socket.io')(server)

  // Default set of rules (to fall back on if non specified)
  const DEFAULT_RULES = {
    interceptRequest  :  false, // Allow "breakpoint" on original request before sent to api
    interceptResponse :  false, // Allow "breakpoint" on response from api before sent to client
    skipApi           :  false  // Allow skipping going to the api all together
  }

  // Request count to use as IDs for request
  let request_count = 0

  // List of rules to activate on routes
  let rules = config.rules

  const handleRoute = (req, res) => {
    // API url to make the request to
    const REQUEST_URL = BASE_URL + req.originalUrl
    const HEADERS_TO_KEEP = []

    console.log(`[${++request_count}][PROXY][${req.method}] ${REQUEST_URL}`)

    // Grab rule for given route make match regex in future
    let route_rule = rules.filter((el) => el.path === req.originalUrl)[0] || DEFAULT_RULES

    // Generate unique IDs for request and responsef
    let request_id = uuid()
    let response_id = uuid()

    // Websocket here for request to proxy (before sent to api server)
    io.emit('proxy_request', {
      request_id: request_count,
      headers: req.headers,
      method: req.method,
      body: req.body,
      host: req.hostname,
      path: req.originalUrl,
      rule: route_rule,
      intercepted_id: route_rule.interceptRequest ? request_id : false
    })

    // Generate headers to keep
    let headers = {}
    for (let i = 0; i < HEADERS_TO_KEEP.length; i++) {
      if (req.headers.hasOwnProperty(HEADERS_TO_KEEP[i])) {
        headers[HEADERS_TO_KEEP[i]] = req.headers[HEADERS_TO_KEEP[i]]
      }
    }

    // Set options to relay to api server
    let options = {
      url: REQUEST_URL,
      method: req.method,
      headers: headers,
      body: req.body,
      json: true,
      strictSSL: false
    }

    // interceptRequest if the route rule says to
    if (route_rule.interceptRequest && io.sockets.sockets.length !== 0) {
      console.log("Waiting for response from admin")
      let resolved = false

      for (let id in io.sockets.sockets) {
        let socket = io.sockets.sockets[id]

        socket.once(request_id, (data) => {
          if (!resolved) {
            resolved = true
            options.body = data.body || options.body
            options.method = data.method || options.method
          }
        })
      }
    }

    let responseObj = {
      request_id: request_count,
      headers: res.headers,
      method: res.method,
      body: route_rule.body || {},
      url: options.url,
      statusCode: route_rule.statusCode || 200,
      apiSkipped: !route_rule.interceptResponse,
      intercepted_id: route_rule.interceptResponse ? response_id : false,
      contentType: 'application/json'
    }

    if (!route_rule.skipApi) {
      request(options, (error, response, body) => {
        console.log(`[${request_count}][${options.method}][${response.statusCode}] ${REQUEST_URL}`)
        responseObj.headers = response.headers
        responseObj.body = route_rule.body || body
        responseObj.method = options.method
        responseObj.statusCode = route_rule.statusCode || response.statusCode
        responseObj.contentType = response.headers['content-type']

        // Websocket here for response from api
        io.emit('api_response', responseObj)

        // Send response as close to api response as possible
        res.header('Content-Type', responseObj.contentType)
        res.status(responseObj.statusCode)

        // Listen for response from admin if breakpoint on
        if (route_rule.interceptResponse && io.sockets.sockets.length !== 0) {
          console.log("Waiting for response from admin")
          let resolved = false

          for (let id in io.sockets.sockets) {
            let socket = io.sockets.sockets[id]

            socket.once(response_id, (data) => {
              if (!resolved) {
                resolved = true
                res.status(data.statusCode || 200)
                res.json(data.body || {})
              }
            })
          }
        } else {
          // Just send back responses
          res.json(responseObj.body)
        }
      })
    } else {
      // Websocket here for response from api
      io.emit('api_response', responseObj)

      // Send response as close to api response as possible
      res.header('Content-Type', responseObj.contentType)
      res.status(responseObj.statusCode)

      // Listen for response from admin if breakpoint on
      if (route_rule.interceptResponse && io.sockets.sockets.length !== 0) {
        console.log("Waiting for response from admin")
        let resolved = false

        for (let id in io.sockets.sockets) {
          let socket = io.sockets.sockets[id]

          socket.once(response_id, (data) => {
            if (!resolved) {
              resolved = true
              res.status(data.statusCode || 200)
              res.json(data.body || {})
            }
          })
        }
      } else {
        // Just send back responses
        res.json(responseObj.body)
      }
    }

  }

  const initSockets = () => {
    // Send data needed for admin setup on setup
    io.on('connection', (socket) => {
      socket.emit('settings', {
        rules: rules
      })
    })
  }

  return {
    handleRoute: handleRoute,
    initSockets: initSockets
  }
}


module.exports = app
