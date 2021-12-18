/* eslint-env jest */

const Hijacker = require('../..')

describe('Event Tests', () => {
  let config

  beforeAll(() => {
    config = {
      base_url: 'http://hijacker.testing.com',
      logger: { silent: true },
      port: 5001,
      rules: [
        {
          path: '/cars',
          skipApi: true,
          method: 'GET',
          interceptRequest: true,
          body: {
            test: 'testing'
          }
        },
        {
          path: '/posts',
          skipApi: true,
          method: 'GET',
          interceptResponse: true,
          body: {
            posts: 'get'
          }
        }
      ]
    }
  })

  it('should emit an event on server start up', (done) => {
    const hijackerServer = new Hijacker(config)

    hijackerServer.on('started', (port) => {
      expect(port).toBe(config.port)
      hijackerServer.close()
      done()
    })
  })
})
