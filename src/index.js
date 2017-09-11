import Nightmare from 'nightmare'
import JSONFormatter from 'json-stringify-pretty-compact'
import fs from 'fs'
import vo from 'vo'
import clic from 'cllc'
import grabber from './grabber'
import scheme from './scheme'
import normalize from './normalize'

const log = clic()

const nighmareOptions = {
  // show: true,
  openDevTools: {
    mode: 'detach'
  },
  webPreferences: {
    images: false,
  }
}

const nightmare = Nightmare(nighmareOptions)

const selectors = {
  loadBtn: '.js-load-more-btn',
  loader: '.js-load-more-on-click',
  link: '.horizontal-tile__item-title > a:first-child',
}

const getLinks = (selectors) => {
  const elems = document.querySelectorAll(selectors.link)
  const arrayOfElems = Array.from(elems)
  const links = arrayOfElems.map(el => el.href)

  console.log(links)

  return links
}

const writeInFile = res => {
  const formatedData = JSONFormatter(res)
  return new Promise((resolve, reject) => {
    return fs.writeFile('result.json', formatedData, err => {
      if (err) return reject(err)

      resolve(formatedData)
    })
  })
}

const clickOnBtn = ({ selectors }) => {
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
    }, 200)
  }

  return new Promise(loadNewItems(selectors))
}

function * run () {
  yield nightmare.goto('https://eda.ru/recepty/smuzi')

  log.info('Browser opened start page')

  yield nightmare.evaluate(clickOnBtn, { selectors })

  log.info('All recipes were loaded')

  const links = yield nightmare.evaluate(getLinks, selectors)

  log.info('All links were received')

  log.start('Links parsed %s', 0)

  const result = []

  for (let link of links) {
    const resultItem = yield nightmare.goto(link)
      .evaluate(grabber, {
        scheme,
        url: link,
      })

    log.info('Parsing url ' + link)
    log.step()

    result.push(resultItem)
  }

  log.stop()

  yield nightmare.end()

  const normalizedResult = normalize(result)

  yield writeInFile(normalizedResult)
}

vo(run)((err, result) => {
  if (err) throw err
})
