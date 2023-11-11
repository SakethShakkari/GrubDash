const dishes = require("../data/dishes-data");
const nextId = require("../utils/nextId");

//Middileware function to read and set the request body once per each request
function getBodyContent(req, res, next) {
  const { data = {} } = req.body;
  res.locals.body = data;
  next();
}

//Middileware function to read and set the request body parameters per each request
function getIDParam(req, res, next) {
  const{id={}} = req.params;
  res.locals.id = id;
  next();
}

//middileware function for checking given propertyName existence in the request
function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const data = res.locals.body;
    if (data[propertyName]) {
      return next();
    } else {
      next({
        status: 400,
        message: `Request body does not have the property - ${propertyName}`,
      });
    }
  };
}

//middile function to check existense of a dish by id

function dishExists(req, res, next) {
  const id = res.locals.id;
  const foundDish = dishes.find((dish) => dish.id === id);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  } else {
    next({
      status: 404,
      message: `Dish with id = ${id} is not found`,
    });
  }
}

function priceValidations(req, res, next) {
  const data = res.locals.body;
  const price = Number(data["price"]);
  if (price < 0) {
    next({
      status: 400,
      message: `The request has invalid price - ${price}`,
    });
  } else {
    return next();
  }
}

function priceIsNumber(req, res, next) {
  const data = res.locals.body;
  const price = data["price"];
  if (typeof price !== "number") {
    next({
      status: 400,
      message: `The request has invalid price - ${price}`,
    });
  } else {
    return next();
  }
}

function list(req, res, next) {
  res.json({ data: dishes });
}

function read(req, res, next) {
  const id = res.locals.id;
  const foundDish = dishes.find((dish) => dish.id === id);
  res.json({ data: foundDish });
}

function create(req, res, next) {
  const id = nextId();
  const data = res.locals.body;
  const newdish = { ...data, id };
  dishes.push(newdish);
  res.status(201).json({ data: newdish });
}

function updateValidation(req, res, next) {
  const id = res.locals.id;
  const data = res.locals.body;
  if (data.hasOwnProperty("id") && data["id"] && id !== data["id"]) {
    next({
      status: 400,
      message: `data.id - ${data["id"]} does not match the id given in params ${id}`,
    });
  } else {
    return next();
  }
}
function update(req, res, next) {
  const data = res.locals.body;
  const foundDish = res.locals.dish;
  for (const key in data) {
    if (key !== "id" && data.hasOwnProperty(key)) {
      foundDish[key] = data[key];
    }
  }
  res.json({ data: foundDish });
}

module.exports = {
  list,
  read: [getIDParam, dishExists, read],
  create: [
    getBodyContent,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("image_url"),
    bodyDataHas("price"),
    priceValidations,
    create,
  ],
  update: [
    getIDParam,
    getBodyContent,
    dishExists,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    priceValidations,
    priceIsNumber,
    bodyDataHas("image_url"),
    updateValidation,
    update,
  ],
};
