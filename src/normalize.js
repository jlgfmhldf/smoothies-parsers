import capitalize from 'js-capitalize'

const capitalizeIngredient = item => capitalize(item)

const toNumber = word => {
  if (word) {
    if (word.indexOf(',')) {
      return +word.replace(',', '.')
    }

    return +word
  }

  return word
}

const nutritionValueToNumber = obj => key => {
  obj[key] = toNumber(obj[key])
}

const nutritionToNumber = obj => {
  Object.keys(obj).forEach(nutritionValueToNumber(obj))

  return obj
}

const update = obj => {
  const { ingredients, nutrition } = obj

  return {
    ...obj,
    ingredients: ingredients.map(capitalizeIngredient),
    nutrition: nutrition ? nutritionToNumber(nutrition) : null,
  }
}

export default arr => arr.map(update)
