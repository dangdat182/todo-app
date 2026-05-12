const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

// Public routes (no auth needed, handled at gateway level)
router.get('/shared/:token', todoController.getSharedTodo);

// Protected routes (auth verified at API Gateway, userId injected in header)
router.get('/', todoController.getTodos);
router.post('/', todoController.createTodo);
router.put('/:id', todoController.updateTodo);
router.delete('/bulk', todoController.bulkDelete);
router.delete('/:id', todoController.deleteTodo);
router.post('/:id/share', todoController.toggleShare);
router.get('/meta/categories', todoController.getCategories);
router.get('/meta/stats', todoController.getStats);

module.exports = router;
