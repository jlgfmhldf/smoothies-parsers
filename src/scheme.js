import { STRING, ARRAY, IMAGE, OBJECT, LINK } from './types'

export default {
  title: {
    type: STRING,
    selector: 'h1.recipe__name'
  },
  nutrition: {
    type: OBJECT,
    selector: {
      calories: {
        type: STRING,
        selector: '.nutrition__list li:first-child .nutrition__weight',
      },
      protein: {
        type: STRING,
        selector: '.nutrition__list li:nth-of-type(2) .nutrition__weight',
      },
      fat: {
        type: STRING,
        selector: '.nutrition__list li:nth-of-type(3) .nutrition__weight',
      },
      carbohydrate: {
        type: STRING,
        selector: '.nutrition__list li:nth-of-type(4) .nutrition__weight',
      }
    }
  },
  ingredients: {
    type: ARRAY,
    selector: '.ingredients-list__content-item .content-item__name'
  },
  image: {
    type: IMAGE,
    selector: '.g-print-visible .recipe__print-cover img'
  },
  link: {
    type: LINK,
  }
}
