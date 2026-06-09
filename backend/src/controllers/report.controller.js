/**
 * src/controllers/report.controller.js
 */
const Report = require('../models/Report.model');
const { sendSuccess } = require('../utils/apiResponse');
const { AppError } = require('../middleware/error.middleware');

// POST /api/reports
async function createReport(req, res, next) {
  try {
    const { reported_user_id, conversation_id, message_id, reason, details } = req.body;
    const reporter_id = req.user._id;

    if (!reported_user_id || !conversation_id || !reason) {
      throw new AppError('يجب إدخال المستخدم المبلغ عنه والمحادثة وسبب البلاغ.', 400);
    }

    if (reporter_id.toString() === reported_user_id.toString()) {
      throw new AppError('لا يمكنك الإبلاغ عن نفسك.', 400);
    }

    const report = await Report.create({
      reporter_id,
      reported_user_id,
      conversation_id,
      message_id: message_id || null,
      reason,
      details: details || '',
    });

    return sendSuccess(res, report, 'تم إرسال البلاغ بنجاح. سيقوم الإدارة بمراجعته.', 201);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReport,
};
