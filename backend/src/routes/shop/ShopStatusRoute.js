const express = require("express");
const router = express.Router();
const shopStatusCtrl = require("../../controllers/shop/ShopStatusController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");


router.get("/", shopStatusCtrl.getShopStatuses);
router.get("/:id", shopStatusCtrl.getShopStatusById);


router.post("/", requireAuth, requireRole("ADMIN"), shopStatusCtrl.createShopStatus);
router.put("/:id", requireAuth, requireRole("ADMIN"), shopStatusCtrl.updateShopStatus);
router.delete("/:id", requireAuth, requireRole("ADMIN"), shopStatusCtrl.deleteShopStatus);

module.exports = router;
