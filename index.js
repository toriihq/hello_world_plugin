const express = require('express')
const axios = require('axios')

const app = express()

const EVENTS = {
  install: 'plugin_install',
  uninstall: 'plugin_uninstall'
}

app.use(express.json())

app.post('/plugin', async (req, res) => {
  try {
    const { event, configuration } = req.body
    if (event === EVENTS.install) {
      const { idOrg, version, torii, vendor } = configuration
      // store credentials in a DB
      // db.store(idOrg, configuration)

      // fetch data from Torii
      const { data } = await axios({
        method: 'GET',
        url: 'http://localhost:8001/v1.0/apps/1/users',
        params: {
          status: vendor.status.value
        },
        headers: {
          Authorization: `Bearer ${torii.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const randomUser = data.users[Math.floor(Math.random() * data.users.length)]

      // update app details
      await axios({
        method: 'PUT',
        url: 'http://localhost:8001/v1.0/apps/1',
        data: {
          username: randomUser.fullName
        },
        headers: {
          Authorization: `Bearer ${torii.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
    }

    if (event === EVENTS.uninstall) {
      const { idOrg } = configuration
      // db.remove(idOrg)
    }
    res.status(200).send({ success: true })
  } catch (e) {
    console.error(e)
    res.status(500)
  }
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`)
})
