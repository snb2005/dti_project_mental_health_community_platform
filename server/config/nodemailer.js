import nodemailer from 'nodemailer'
const transporter=nodemailer.createTransport({
    host:'smtp-relay.brevo.com',
    port:587,
    secure:false,
    auth:{
        user:'8351e4001@smtp-brevo.com',
        pass:'AsMJdyxk4T6UrbX2'
    },

    
});
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Configuration Error:', error);
    } else {
        console.log('SMTP Server Ready to Send Emails:', success);
    }
});

export default transporter