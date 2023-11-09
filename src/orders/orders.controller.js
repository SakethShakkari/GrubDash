const orders = require("../data/orders-data");
const nextId = require("../utils/nextId");

function list(req, res, next) {
  res.json({ data: orders });
}

function bodyHasProperty(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (!data[propertyName]) {
      next({
        status: 400,
        message: `${propertyName} is missing in the body`,
      });
    } else return next();
  };
}

function foundOrder(req, res, next) {
  const { id } = req.params;
  const foundOrder = orders.find((order) => order.id === id);
  if (foundOrder) {
    return next();
  } else {
    return next({
      status: 404,
      message: `order is not found with given id = ${id}`,
    });
  }
}

function create(req, res, next) {
  const id = nextId();
  const { data = {} } = req.body;
  const newOrder = { ...data, id };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res, next) {
  const { id } = req.params;
  const foundOrder = orders.find((order) => order.id === id);
  res.json({ data: foundOrder });
}

function bodyHasDishesArray(req, res, next) {
  const { data = {} } = req.body;
  if (Array.isArray(data.dishes)) return next();
  else {
    next({
      status: 400,
      message: "dish is not an array",
    });
  }
}

function dishArrayValidations(req, res, next) {
  const { dishes } = req.body.data;
  if (dishes.length === 0) {
    next({
      status: 400,
      message: `dish array length is zero`,
    });
  }
  for (let i = 0; i < dishes.length; i++) {
    const dish = dishes[i];
    if (!dish.hasOwnProperty("quantity")) {
      next({
        status: 400,
        message: `quantity is missing for the dish at index - ${i}`,
      });
    } else if (Number(dish.quantity) === 0) {
      next({
        status: 400,
        message: `quantity is 0 for the dish at index - ${i}`,
      });
    }
    else if ( (typeof dish.quantity !== "number")) {
      next({
        status: 400,
        message: `quantity at index - ${i} is not an integer -- ${i}`,
      });
    }
  }

  next();
}

function update(req,res,next)
{
  const {id} = req.params;
  const foundOrder = orders.find((order) => order.id === id);
  const {data={}} = req.body;

  for(const key in data){
    if(key!=="id" && data.hasOwnProperty(key))
    {
      foundOrder[key] = data[key];
    }
  }
  res.json({data: foundOrder});
}
function statusValidations(req, res, next) {
  const {data = {} } = req.body;

  if (!data.status || data.status === "invalid") {
    next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, or delivered.",
    });
  }

  if (data.status === "delivered") {
    next({
      status: 400,
      message: "A delivered order cannot be changed.",
    });
  }

  return next();
}

function updateValidation(req, res, next)
{
  const {id} = req.params;
  const {data = {} } = req.body;
  if(((data.hasOwnProperty("id")) && data["id"] && (id !== data["id"])))
  {
  next(
      {
        status: 400,
        message: `data.id - ${data["id"]} does not match the id given in params ${id}`
      })
  }
  else
  {
    return next();
  }
}

function orderStatusIsPending(req, res, next) {
  const { id } = req.params;
  const foundOrder = orders.find((order) => order.id === id);

  if (foundOrder.status !== "pending") {
    next({
      status: 400,
      message: `An order cannot be deleted unless it is pending.${foundOrder.status}`,
    });
  }

  return next();
}

function destroy(req,res,next)
{
  const {id} = req.params;
  const orderIndex = orders.findIndex((order) => order.id === id);
  orders.splice(orderIndex,1);
  res.status(204).json(orders);
}



module.exports = {
  list,
  create: [
    bodyHasProperty("deliverTo"),
    bodyHasProperty("mobileNumber"),
    bodyHasProperty("dishes"),
    dishArrayValidations,
    bodyHasDishesArray,
    create,
  ],
  read: [foundOrder, read],
  update: [foundOrder, bodyHasProperty("deliverTo"),
    bodyHasProperty("mobileNumber"),
    bodyHasProperty("dishes"),
    dishArrayValidations,
    bodyHasDishesArray,statusValidations, updateValidation, update],
  delete: [foundOrder,orderStatusIsPending,destroy]
};
