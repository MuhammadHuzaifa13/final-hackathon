const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getChats } = require('../controllers/messageController');
const protect = require('../middleware/auth');

// All message routes are protected
router.use(protect);

router.post('/', sendMessage);
router.get('/chats', getChats);
router.get('/:id', getConversation);

module.exports = router;
