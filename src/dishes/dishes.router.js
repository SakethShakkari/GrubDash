const router = require("express").Router();

const controller = require("./dishes.controller");
const MethodNotAllowed = require("../errors/methodNotAllowed");

router.route("/").get(controller.list).post(controller.create).all(MethodNotAllowed);
router.route("/:id").get(controller.read).put(controller.update).all(MethodNotAllowed);


module.exports = router;