import mongoose from 'mongoose';

const expertApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    qualifications: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true,
        enum: ['Clinical Psychology', 'Counseling Psychology', 'Psychiatry', 'Social Work', 'Marriage & Family Therapy', 'Addiction Counseling', 'Other']
    },
    licenseNumber: {
        type: String,
        required: true
    },
    yearsOfExperience: {
        type: Number,
        required: true,
        min: 1
    },
    motivation: {
        type: String,
        required: true,
        maxLength: 1000
    },
    availability: {
        type: String,
        required: true,
        enum: ['Full-time', 'Part-time', 'Weekend only', 'Flexible']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        default: ''
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const ExpertApplication = mongoose.model('ExpertApplication', expertApplicationSchema);

export default ExpertApplication;