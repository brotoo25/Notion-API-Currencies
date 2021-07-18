const axios = require('axios');
const dotenv = require('dotenv').config()
const { Client } = require('@notionhq/client')

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const databaseId = process.env.NOTION_DATABASE_ID
const defaultCurrency = process.env.DEFAULT_CURRENCY

const refreshDatabase = async () => {
  const payload = {
    path: `databases/${databaseId}/query`,
    method: 'POST'
  }

  const { results } = await notion.request(payload)
  updateCryptoConversions(results)
  updateCurrencyConversions(results)
}

async function updateCryptoConversions(notionPages) {
  notionPages.map(async (page) => {
    const coinType = page.properties.Crypto_ID.rich_text[0]?.text.content || "EMPTY"
    if (coinType != "EMPTY") {
      const cryptoValue = await fetchPriceOnCoinGecko(coinType, defaultCurrency)
      _updateNotionTable(page.id, cryptoValue)
    }
  })
}

async function updateCurrencyConversions(notionPages) {
  notionPages.map(async (page) => {
    const coinType = page.properties.Currency_ID.rich_text[0]?.text.content || "EMPTY"
    if (coinType != "EMPTY") {
      const currencyValue = await fetchCurrencyPrice(coinType, defaultCurrency)
      _updateNotionTable(page.id, parseFloat(currencyValue))
    }
  })
}

async function _updateNotionTable(pageId, monetaryValue) {
  notion.pages.update({
    page_id: pageId,
    properties: {
      USD: {
        number: monetaryValue
      }
    }
  })
}

/**
 * Get most recent price of any crypto listed at CoinGecko.
 * Params: (coin) - Crypto ID from CoinGecko, all crypto IDs can be found at:
 *                  https://api.coingecko.com/api/v3/coins/list?include_platform=false
 *         (defaultCurrency) - Base Currency Code to calculate price. Ex: USD, BRL, NZD
 **/
 async function fetchPriceOnCoinGecko(coin, defaultCurrency) {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=${defaultCurrency}`);
    return response.data[`${coin}`][defaultCurrency.toLowerCase()]
  } catch (error) {
    console.error(error);
  }
}

/**
 * Get most recent price of any currency listed at 'API de Moedas'.
 * https://docs.awesomeapi.com.br/api-de-moedas
 * 
 * Params: (from) - Currency Code. Ex: USD, BRL, NZD
 *         (to)   - Currency Code. Ex: USD, BRL, NZD
 **/
async function fetchCurrencyPrice(from, to) {
  try {
    if (from.toUpperCase() == to.toUpperCase()) {
      return 1
    }

    const response = await axios.get(`https://economia.awesomeapi.com.br/json/last/${from.toUpperCase()}-${to}`);
    return response.data[`${from}${to}`]['high']
  } catch (error) {
    console.error(error);
  }
}

refreshDatabase()