const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/product/TagController");
const { requireAuth, requireRole } = require("../../middleware/authMiddleware");

router.use(requireAuth);

router.get("/", ctrl.getTags);
router.get("/:id", ctrl.getTagById);

router.post("/", requireRole("ADMIN","BOUTIQUE"), ctrl.createTag);
router.put("/:id", requireRole("ADMIN","BOUTIQUE"), ctrl.updateTag);
router.delete("/:id", requireRole("ADMIN","BOUTIQUE"), ctrl.deleteTag);

module.exports = router;
