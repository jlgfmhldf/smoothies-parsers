import Nightmare from 'nightmare'
import JSONFormatter from 'json-stringify-pretty-compact'
import fs from 'fs'

const nightmare = Nightmare({
  show: true,
  executionTimeout: 100000,
  openDevTools: {
    mode: 'detach'
  },
  webPreferences: {
    images: false,
  }
})

const selectors = {
  loadBtn: '.js-load-more-btn',
  loader: '.js-load-more-on-click',
  link: '.horizontal-tile__item-title > a:first-child',
}

const getLinks = (selectors) => {
  const elems = document.querySelectorAll(selectors.link)

  elems.map = [].map

  const links = elems.map(el => el.href)

  return links
}

const writeInFile = res => {
  console.log(res)
  fs.writeFileSync('result.json', JSONFormatter(res))
}

nightmare
  .goto('https://eda.ru/recepty/smuzi')
  .evaluate(({ selectors }) => {
    const loadNewItems = selectors => resolve => {
      const btn = document.querySelector(selectors.loadBtn)
      const loader = document.querySelector(selectors.loader)
      const click = () => btn.click()

      setInterval(() => {
        const loaderNone = loader.style.display === 'none'
        const btnNone = btn.classList.contains('_clicked')

        if (!btnNone) {
          click()
        }

        if (loaderNone && btnNone) {
          return resolve()
        }
      }, 1000)
    }

    return new Promise(loadNewItems(selectors))
  }, { selectors })
  .evaluate(getLinks, selectors)
  .end()
  .then(writeInFile)
  .catch(error => {
    return console.error('Search failed:', error)
  })
