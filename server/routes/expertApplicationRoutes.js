import express from 'express';
import { 
    submitExpertApplication, 
    getMyApplication, 
    getAllApplications, 
    reviewApplication 
} from '../controllers/expertApplicationController.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';

const expertApplicationRouter = express.Router();

// User routes
expertApplicationRouter.post('/apply', userAuth, submitExpertApplication);
expertApplicationRouter.get('/my-application', userAuth, getMyApplication);

// Admin routes
expertApplicationRouter.get('/all', adminAuth, getAllApplications);
expertApplicationRouter.post('/review', adminAuth, reviewApplication);

export default expertApplicationRouter;