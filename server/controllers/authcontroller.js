import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/usermodel.js';
import transporter from '../config/nodemailer.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Missing Details" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User Already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate OTP for email verification
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        
        const user = new User({ 
            name, 
            email, 
            password: hashedPassword,
            verifyOtp: otp,
            verifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
        });

        // Send welcome email with verification OTP
        const mailOptions = {
            from: process.env.SENDER_EMAIL || "kunalkhurana250@gmail.com",
            to: email,
            subject: "Welcome to Manobala - Verify Your Email",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #7c3aed; text-align: center;">Welcome to Manobala Mental Health Platform!</h2>
                    <p>Hello ${name},</p>
                    <p>Thank you for joining our mental health support community. To complete your registration, please verify your email address.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
                        <h3 style="color: #374151; margin-bottom: 10px;">Your Verification Code</h3>
                        <div style="font-size: 32px; font-weight: bold; color: #7c3aed; letter-spacing: 3px;">${otp}</div>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">This code will expire in 24 hours</p>
                    </div>
                    
                    <p>Please enter this code on the verification page to activate your account and access all features including:</p>
                    <ul style="color: #374151;">
                        <li>AI-powered mental health chatbot</li>
                        <li>Mental health blog community</li>
                        <li>Expert chat support</li>
                        <li>Resource library</li>
                        <li>Community forums</li>
                    </ul>
                    
                    <p style="color: #6b7280; font-size: 14px;">If you didn't create this account, please ignore this email.</p>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px;">© 2024 Manobala Mental Health Platform. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({ 
            success: true, 
            message: 'User registered successfully. Please check your email for verification code.',
            requiresVerification: true,
            userId: user._id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and Password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid Password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ success: true, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendOtp = async (req, res) => {
    // Get userId from middleware if available, otherwise from body
    const userId = req.userId || req.body.userId;
    if (!userId) {
        return res.json({ success: false, message: "Details missing" });
    }
    try {
        const user = await User.findById(userId)
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account Already Verified" });
        }
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
        
        const mailOption = {
            from: process.env.SENDER_EMAIL || "kunalkhurana250@gmail.com",
            to: user.email,
            subject: "Email Verification - Manobala",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #7c3aed; text-align: center;">Email Verification Required</h2>
                    <p>Hello ${user.name},</p>
                    <p>Please verify your email address to access all features of Manobala Mental Health Platform.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
                        <h3 style="color: #374151; margin-bottom: 10px;">Your Verification Code</h3>
                        <div style="font-size: 32px; font-weight: bold; color: #7c3aed; letter-spacing: 3px;">${otp}</div>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">This code will expire in 24 hours</p>
                    </div>
                    
                    <p>Enter this code on the verification page to complete your email verification.</p>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px;">© 2024 Manobala Mental Health Platform. All rights reserved.</p>
                    </div>
                </div>
            `
        }
        await transporter.sendMail(mailOption);
        return res.json({ success: true, message: "Account Verification Otp sent" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
export const verifyEmail = async(req,res) => {
    // Get userId from middleware if available, otherwise from body  
    const userId = req.userId || req.body.userId;
    const {otp}=req.body;
    if (!userId||!otp) {
        return res.json({success:false,message:"Details missing"});

    }
    try{
        const user=await User.findById(userId)
        
        if(!user){
            return res.json({success:false,message:"User not found"});
            
        }
        if(user.verifyOtp==''||user.verifyOtp!=otp){
            return res.json({success:false,message:"Invalid Otp"});

        }
        if(user.verifyOtpExpireAt<Date.now()){
            return res.json({success:false,message:"Invalid Otp"});

        }
        user.isAccountVerified=true;
        user.verifyOtp='';
        user.verifyOtpExpireAt=0;
        await user.save();
        return res.json({success:true,message:"Email Verified successfully"});


    }
    catch(error){

    }
}
export const isAuthenticated = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }
        
        res.json({
            success: true,
            userData: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
                isExpert: user.isExpert,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const sendresetotp=async(req,res)=>{
    const{email}=req.body;
    if(!email){
        return res.json({success:false,message:"Email Missing"});
    }
    try{
        const user=await User.findOne({email});
        if(!user){
            return res.json({success:false,message:"User Not found"});
        }
        const otp=String(Math.floor(100000+Math.random()*900000));
        user.resetOtp=otp;
        user.resetOtpExpireAt=Date.now()+15*60*1000;
        await user.save();
        const mailOption={
            from: "kunalkhurana250@gmail.com",
            to: user.email,
            subject: "Password Reset Otp",
            text: `Your otp for reseting the password is ${otp}.
            Use this otp for reseting the password.`

        }
        await transporter.sendMail(mailOption);
        return res.json({success:true,message:"Password reset Otp sent"});

    }
    catch(error){

    }
}

export const resetPassword=async(req,res)=>{
    const {email,otp,newPassword}=req.body;
    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: "Missing details" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.resetOtp==''|| user.resetOtp !== otp || user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "Invalid or expired OTP" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();

        return res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
