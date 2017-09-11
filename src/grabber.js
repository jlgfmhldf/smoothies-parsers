export default function grabber ({
  scheme: { selector, type, regexp: regexpString },
  key,
  url,
}) {
  const matchContent = (content, regexp) => {
    const result = content.match(regexp)

    return result && result[0]
  }

  const typeLink = type === 'LINK'

  if (!selector && !typeLink) {
    if (key) {
      console.error(`Selector not found in scheme for field ${key}`) // TODO: add name of scheme in errors
    } else {
      console.error(`Selector not found in scheme for current page`)
    }
    return ''
  }

  const regexp = regexpString && new RegExp(regexpString, 'i')



  switch (type) {
    case 'OBJECT': {
      let objResult = {}
      for (let key in selector) {
        objResult[key] = grabber({ scheme: selector[key], key, url })
      }

      return objResult
    }

    case 'ARRAY': {
      let listResult = []
      const elems = document.querySelectorAll(selector)

      for (let i in elems) {
        const { innerText: content } = elems[i]

        if (content) {
          listResult[i] = regexp ? matchContent(content, regexp) : content
        }
      }

      return listResult
    }

    case 'IMAGE': {
      const image = document.querySelector(selector)

      return image.src
    }

    case 'LINK': {
      return url
    }

    default: {
      const content = document.querySelector(selector).innerText

      return regexp ? matchContent(content, regexp) : content
    }
  }
}
