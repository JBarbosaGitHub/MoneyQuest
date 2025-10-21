# Email Setup Guide for Contact Form

## Option 1: EmailJS (Recommended - FREE & Easy)

EmailJS allows you to send emails directly from your React app without a backend server.

### Steps to Set Up EmailJS:

1. **Create an EmailJS Account**
   - Go to https://www.emailjs.com/
   - Sign up for a free account (allows 200 emails/month)

2. **Add Email Service**
   - After logging in, go to "Email Services"
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the instructions to connect your email
   - Note down your **Service ID**

3. **Create Email Template**
   - Go to "Email Templates"
   - Click "Create New Template"
   - Use these template variables in your email template:
   
   ```
   Subject: New Contact Form Submission from {{from_name}}

   Name: {{from_name}}
   Email: {{from_email}}
   Phone: {{phone}}
   Company: {{company_name}}
   
   Message:
   {{message}}
   ```
   
   - Note down your **Template ID**

4. **Get Public Key**
   - Go to "Account" → "General"
   - Find your **Public Key** (also called API Key)

5. **Update ContactPopup.jsx**
   - Open `src/components/ContactPopup.jsx`
   - Replace the placeholders on lines ~28-30:
   
   ```javascript
   const serviceID = 'YOUR_SERVICE_ID'      // Replace with your Service ID
   const templateID = 'YOUR_TEMPLATE_ID'    // Replace with your Template ID
   const publicKey = 'YOUR_PUBLIC_KEY'      // Replace with your Public Key
   ```

6. **Set Your Email**
   - On line ~37, replace `'your-email@example.com'` with your actual email address

### That's it! Your contact form will now send emails.

---

## Option 2: Backend with Nodemailer (More Control)

If you need more control or higher email volume, you can create a Node.js backend.

### Steps:

1. **Create a backend folder**
   ```bash
   mkdir server
   cd server
   npm init -y
   npm install express nodemailer cors dotenv
   ```

2. **Create server.js**
   ```javascript
   const express = require('express');
   const nodemailer = require('nodemailer');
   const cors = require('cors');
   require('dotenv').config();

   const app = express();
   app.use(cors());
   app.use(express.json());

   app.post('/api/contact', async (req, res) => {
     const { name, email, phone, company_name, message_project } = req.body;

     const transporter = nodemailer.createTransport({
       service: 'gmail', // or 'outlook', 'yahoo', etc.
       auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS
       }
     });

     const mailOptions = {
       from: process.env.EMAIL_USER,
       to: process.env.EMAIL_USER,
       subject: `New Contact Form Submission from ${name}`,
       html: `
         <h3>New Contact Form Submission</h3>
         <p><strong>Name:</strong> ${name}</p>
         <p><strong>Email:</strong> ${email}</p>
         <p><strong>Phone:</strong> ${phone}</p>
         <p><strong>Company:</strong> ${company_name}</p>
         <p><strong>Message:</strong></p>
         <p>${message_project}</p>
       `
     };

     try {
       await transporter.sendMail(mailOptions);
       res.json({ success: true });
     } catch (error) {
       console.error(error);
       res.status(500).json({ success: false, error: error.message });
     }
   });

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   ```

3. **Create .env file**
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   PORT=5000
   ```

4. **Update ContactPopup.jsx to use backend**
   ```javascript
   const handleSubmit = async (e) => {
     e.preventDefault()
     if (!formState.name || !formState.email) return
     
     setSending(true)
     setError(null)

     try {
       const response = await fetch('http://localhost:5000/api/contact', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formState)
       })

       if (response.ok) {
         setSubmitted(true)
         // ... rest of success logic
       } else {
         setError('Failed to send message')
       }
     } catch (err) {
       setError('Failed to send message. Please try again.')
     } finally {
       setSending(false)
     }
   }
   ```

---

## Option 3: Formspree (Easiest, but Limited Free Tier)

1. Go to https://formspree.io/
2. Sign up and create a new form
3. Get your form endpoint URL
4. Update the form action in ContactPopup.jsx:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formState)
  })
  
  if (response.ok) {
    setSubmitted(true)
  }
}
```

---

## Recommended: EmailJS

For most use cases, **EmailJS is the best option** because:
- ✅ No backend server needed
- ✅ Free tier (200 emails/month)
- ✅ Easy to set up (5 minutes)
- ✅ Works with any email provider
- ✅ No hosting required

## Gmail App Password Setup (for Nodemailer)

If using Gmail with nodemailer:
1. Enable 2-factor authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Create an app password for "Mail"
4. Use this password in your .env file (not your regular password)
