const express = require("express");
const router = express.Router();

const ctrl = require("../../controllers/notice/NoticeController");
const { requireAuth } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/mine", ctrl.getMyNotices);
router.get("/by-shop", ctrl.getNoticesByShop);
router.get("/by-product", ctrl.getNoticesByProduct);
router.get("/summary/by-shops", ctrl.getShopNoticeSummaries);
router.post("/", ctrl.createNotice);
router.put("/:id", ctrl.updateMyNotice);
router.delete("/:id", ctrl.deleteMyNotice);

module.exports = router;
