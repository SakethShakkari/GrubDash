const router = require("express").Router();
const controller = require("./orders.controller");
const MethodNotAllowed = require("../errors/methodNotAllowed");

router.route("/").get(controller.list).post(controller.create).all(MethodNotAllowed);
router.route("/:id").get(controller.read).put(controller.update).delete(controller.delete).all(MethodNotAllowed);

module.exports = router;