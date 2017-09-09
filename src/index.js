import Nightmare from 'nightmare'
import JSONFormatter from 'json-stringify-pretty-compact'
import fs from 'fs'
import vo from 'vo'
import clic from 'cllc'

const log = clic()

const nighmareOptions = {
  // show: true,
  executionTimeout: 100000,
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
} // мб сделать глобальной переменной, если возможно?

const getLinks = (selectors) => {
  const elems = document.querySelectorAll(selectors.link)
  const arrayOfElems = Array.from(elems)
  const links = arrayOfElems.map(el => el.href)

  console.log(links)

  return links
}

const writeInFile = res => {
  console.log(`Finded ${res.length} links`)
  fs.writeFileSync('result.json', JSONFormatter(res))
}

const clickOnBtn = ({ selectors }) => {
  const loadNewItems = selectors => resolve => { // надо бы передавать эту функцию в аргументы
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
  // yield nightmare.goto('https://eda.ru/recepty/smuzi')
  yield nightmare.goto('https://eda.ru/recepty/chesnochnij-sous')

  log.info('Browser opened start page')

  yield nightmare.evaluate(clickOnBtn, { selectors })

  log.info('All recipes were loaded')

  const links = yield nightmare.evaluate(getLinks, selectors)

  log.info('All links were received')

  log.start('Links parsed %s', 0)

  const titles = []

  for (let link of links) {
    const title = yield nightmare.goto(link).wait('body').title() // заменить на настоящий парсинг

    log.info('Parsing url' + link)
    log.step()

    titles.push(title)
  }

  log.stop()

  yield nightmare.end()

  // запись в файл
}

vo(run)(function(err, result) {
  if (err) throw err
})
