express = require 'express'
projectCarteroMiddleware = require 'project-cartero/lib/express-hook'
path = require 'path'

app = express()
app.use '/', express.static(path.resolve(__dirname, '../public'))

app.set 'view engine', 'jade'
app.set('views', __dirname+'/views')

carteroJSONPath = path.resolve __dirname, "../..", "cartero.json"
app.use projectCarteroMiddleware(carteroJSONPath)

app.get "/", (req, res, next)->
  res.render "clock/clock"

app.listen 3000, ()-> console.log "Started app!!"
