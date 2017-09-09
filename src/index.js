import Nightmare from 'nightmare'
import JSONFormatter from 'json-stringify-pretty-compact'
import fs from 'fs'
import vo from 'vo'

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
  const arrayOfElems = Array.from(elems)
  const links = arrayOfElems.map(el => el.href)

  return links
}

const writeInFile = res => {
  console.log(`Finded ${res.length} links`)
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
      }, 200)
    }

    return new Promise(loadNewItems(selectors))
  }, { selectors })
  .evaluate(getLinks, selectors)
  .end()
  .then(links => {
    console.log('All links were parsed')

    return new Promise((resolve) => {
      console.log('in promise')

      const getTitle = url =>
        nightmare
        .goto(url)
        .wait('body')
        .title()


      return vo([ 'https://eda.ru/recepty/napitki/ananasovij-smuzi-s-jogurtom-28553' ], getTitle)
        .then(titles => {
          console.log('titles', titles)
          resolve(titles)
        })
        .catch(console.error)

      // return resolve(vo(links, getTitle))



      // const title = nightmare
      //   .goto('https://eda.ru/recepty/holodnij-sup-pjure')
      //   .wait('body')
      //   .title()
      //   .then((title) => {
      //     console.log('title', title)
      //
      //     resolve(title)
      //   })

      // setTimeout(() => {
      //   console.log('test', title)
      //   resolve(links)
      // }, 60000)
    })


    // return links
  })

  .then(writeInFile)
  .catch(error => {
    return console.error('Search failed:', error)
  })


