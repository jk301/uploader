// lib/utils.js

const bcrypt = require('bcrypt')

require('dotenv').config()

async function passValid (password, hashed) {
  const result = await bcrypt.compare(password, hashed)
  return result
}

async function passGen (password) {
  const hashed = await bcrypt.hash(password, 11)
  return hashed
}

module.exports.passValid = passValid;
module.exports.passGen = passGen;