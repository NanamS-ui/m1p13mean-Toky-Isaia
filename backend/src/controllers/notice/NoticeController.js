const NoticeService = require("../../services/notice/NoticeService");

exports.createNotice = async (req, res) => {
  try {
    const userId = req.user.id;
    const notice = await NoticeService.createNotice({ userId, payload: req.body });
    res.status(201).json(notice);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || "Erreur" });
  }
};

exports.getMyNotices = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;
    const notices = await NoticeService.getMyNotices({ userId, type });
    res.json(notices);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || "Erreur" });
  }
};

exports.getNoticesByShop = async (req, res) => {
  try {
    const { shopId } = req.query;
    const notices = await NoticeService.getNoticesByShop({ shopId });
    res.json(notices);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || "Erreur" });
  }
};

exports.getNoticesByProduct = async (req, res) => {
  try {
    const { productId } = req.query;
    const notices = await NoticeService.getNoticesByProduct({ productId });
    res.json(notices);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || "Erreur" });
  }
};

exports.getShopNoticeSummaries = async (req, res) => {
  try {
    const raw = req.query.shopIds;

    const shopIds = Array.isArray(raw)
      ? raw
      : String(raw || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    const summaries = await NoticeService.getShopNoticeSummaries({ shopIds });
    res.json(summaries);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || "Erreur" });
  }
};

exports.updateMyNotice = async (req, res) => {
  try {
    const userId = req.user.id;
    const noticeId = req.params.id;
    const notice = await NoticeService.updateMyNotice({
      userId,
      noticeId,
      payload: req.body
    });
    res.json(notice);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || "Erreur" });
  }
};

exports.deleteMyNotice = async (req, res) => {
  try {
    const userId = req.user.id;
    const noticeId = req.params.id;
    await NoticeService.deleteMyNotice({ userId, noticeId });
    res.json({ message: "Avis supprimé" });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || "Erreur" });
  }
};
