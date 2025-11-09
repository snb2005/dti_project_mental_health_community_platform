import ExpertApplication from '../models/expertApplicationModel.js';
import User from '../models/usermodel.js';
import transporter from '../config/nodemailer.js';

// Submit expert application
export const submitExpertApplication = async (req, res) => {
    try {
        const { userId } = req.body;
        const {
            fullName,
            phoneNumber,
            qualifications,
            experience,
            specialization,
            licenseNumber,
            yearsOfExperience,
            motivation,
            availability
        } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Check if user already applied
        const existingApplication = await ExpertApplication.findOne({ userId });
        if (existingApplication) {
            return res.json({ 
                success: false, 
                message: 'You have already submitted an expert application' 
            });
        }

        // Check if user is already an expert
        if (user.isExpert) {
            return res.json({ 
                success: false, 
                message: 'You are already an expert' 
            });
        }

        // Create new application
        const application = new ExpertApplication({
            userId,
            fullName,
            email: user.email,
            phoneNumber,
            qualifications,
            experience,
            specialization,
            licenseNumber,
            yearsOfExperience,
            motivation,
            availability
        });

        await application.save();

        // Send confirmation email to applicant
        const mailOptions = {
            from: process.env.SENDER_EMAIL || "kunalkhurana250@gmail.com",
            to: user.email,
            subject: "Expert Application Submitted - Manobala",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #7c3aed; text-align: center;">Expert Application Received!</h2>
                    <p>Dear ${fullName},</p>
                    <p>Thank you for applying to become an expert on the Manobala Mental Health Platform.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <h3 style="color: #374151; margin-bottom: 10px;">Application Details:</h3>
                        <p><strong>Specialization:</strong> ${specialization}</p>
                        <p><strong>Experience:</strong> ${yearsOfExperience} years</p>
                        <p><strong>Status:</strong> Under Review</p>
                    </div>
                    
                    <p>Your application is now under review by our administrative team. We will contact you within 3-5 business days with an update.</p>
                    
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px;">© 2024 Manobala Mental Health Platform. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Expert application submitted successfully. You will receive an email confirmation shortly.'
        });

    } catch (error) {
        console.error('Expert application error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user's expert application status
export const getMyApplication = async (req, res) => {
    try {
        const { userId } = req.body;

        const application = await ExpertApplication.findOne({ userId })
            .populate('reviewedBy', 'name email');

        if (!application) {
            return res.json({ 
                success: false, 
                message: 'No application found' 
            });
        }

        res.json({
            success: true,
            application: {
                id: application._id,
                status: application.status,
                specialization: application.specialization,
                appliedAt: application.appliedAt,
                reviewedAt: application.reviewedAt,
                adminNotes: application.adminNotes,
                reviewedBy: application.reviewedBy
            }
        });

    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all expert applications (admin only)
export const getAllApplications = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const applications = await ExpertApplication.find(query)
            .populate('userId', 'name email')
            .populate('reviewedBy', 'name email')
            .sort({ appliedAt: -1 });

        res.json({
            success: true,
            applications: applications.map(app => ({
                id: app._id,
                applicant: {
                    name: app.fullName,
                    email: app.email,
                    userId: app.userId._id
                },
                specialization: app.specialization,
                yearsOfExperience: app.yearsOfExperience,
                status: app.status,
                appliedAt: app.appliedAt,
                reviewedAt: app.reviewedAt,
                reviewedBy: app.reviewedBy,
                adminNotes: app.adminNotes
            }))
        });

    } catch (error) {
        console.error('Get all applications error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Review expert application (admin only)
export const reviewApplication = async (req, res) => {
    try {
        const { applicationId, action, adminNotes } = req.body; // action: 'approve' or 'reject'
        const adminUserId = req.user._id;

        if (!['approve', 'reject'].includes(action)) {
            return res.json({ 
                success: false, 
                message: 'Invalid action. Use approve or reject.' 
            });
        }

        const application = await ExpertApplication.findById(applicationId)
            .populate('userId', 'name email');

        if (!application) {
            return res.json({ success: false, message: 'Application not found' });
        }

        if (application.status !== 'pending') {
            return res.json({ 
                success: false, 
                message: 'Application has already been reviewed' 
            });
        }

        // Update application status
        application.status = action === 'approve' ? 'approved' : 'rejected';
        application.adminNotes = adminNotes || '';
        application.reviewedAt = new Date();
        application.reviewedBy = adminUserId;

        await application.save();

        // If approved, update user to expert
        if (action === 'approve') {
            await User.findByIdAndUpdate(application.userId._id, { 
                isExpert: true 
            });
        }

        // Send notification email
        const statusText = action === 'approve' ? 'Approved' : 'Rejected';
        const mailOptions = {
            from: process.env.SENDER_EMAIL || "kunalkhurana250@gmail.com",
            to: application.email,
            subject: `Expert Application ${statusText} - Manobala`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: ${action === 'approve' ? '#10b981' : '#ef4444'}; text-align: center;">
                        Expert Application ${statusText}
                    </h2>
                    <p>Dear ${application.fullName},</p>
                    
                    ${action === 'approve' ? `
                        <p>Congratulations! Your expert application has been approved. You are now an expert on the Manobala Mental Health Platform.</p>
                        <p>You now have access to:</p>
                        <ul>
                            <li>Expert chat sessions with users</li>
                            <li>Advanced moderation capabilities</li>
                            <li>Expert dashboard and tools</li>
                        </ul>
                    ` : `
                        <p>We regret to inform you that your expert application has not been approved at this time.</p>
                        <p>You may reapply in the future after addressing any concerns.</p>
                    `}
                    
                    ${adminNotes ? `
                        <div style="background-color: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 8px;">
                            <h4 style="color: #374151; margin-bottom: 10px;">Additional Notes:</h4>
                            <p>${adminNotes}</p>
                        </div>
                    ` : ''}
                    
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px;">© 2024 Manobala Mental Health Platform. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: `Application ${action}d successfully. Notification email sent.`
        });

    } catch (error) {
        console.error('Review application error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};