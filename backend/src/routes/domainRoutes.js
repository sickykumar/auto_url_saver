const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');

// Check duplicate domain
router.post('/check', domainController.checkDomain);

// Save domain
router.post('/', domainController.saveDomain);

// Generate AI Notes for domains missing notes
router.post('/generate-ai-notes', domainController.generateAiNotesForEmptyDomains);

// List domains with filters
router.get('/', domainController.getDomains);

// Update notes / tags / favorite
router.patch('/:id', domainController.updateDomain);

// Delete a specific visited URL link
router.delete('/:id/visited-url', domainController.deleteVisitedUrl);

// Delete domain
router.delete('/:id', domainController.deleteDomain);

module.exports = router;
