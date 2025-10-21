# Contact Form Setup Guide

The contact form is now ready to send messages! You have 3 options to choose from:

## 🚀 Option 1: EmailJS (Recommended - Easiest)

**Best for:** Small to medium projects, no backend needed

### Steps:
1. **Sign up** at [https://www.emailjs.com/](https://www.emailjs.com/)
2. **Create an Email Service:**
   - Go to Email Services → Add New Service
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the connection steps
3. **Create an Email Template:**
   - Go to Email Templates → Create New Template
   - Use these variables in your template:
     ```
     From: {{from_name}} <{{from_email}}>
     Phone: {{phone}}
     Company: {{company_name}}
     Message: {{message}}
     ```
4. **Get your credentials:**
   - Public Key: Account → API Keys
   - Service ID: From your service
   - Template ID: From your template

5. **Install EmailJS:**
   ```bash
   npm install @emailjs/browser
   ```

6. **Update ContactPopup.jsx:**
   - Open `src/components/ContactPopup.jsx`
   - Find the "Option 1: EmailJS" section in `handleSubmit`
   - Uncomment the code and replace:
     - `YOUR_SERVICE_ID` with your Service ID
     - `YOUR_TEMPLATE_ID` with your Template ID
     - `YOUR_PUBLIC_KEY` with your Public Key

**Free Tier:** 200 emails/month

---

## 📧 Option 2: FormSpree (Simplest - No Code)

**Best for:** Quick setup, minimal configuration

### Steps:
1. **Sign up** at [https://formspree.io/](https://formspree.io/)
2. **Create a New Form**
3. **Get your Form ID** (looks like: `abcd1234`)
4. **Update ContactPopup.jsx:**
   - Find the "Option 3: FormSpree" section
   - Uncomment the code
   - Replace `YOUR_FORM_ID` with your actual Form ID

**Free Tier:** 50 submissions/month

---

## 🔧 Option 3: Custom Backend (Advanced)

**Best for:** Full control, enterprise applications

### Example with Node.js/Express:

1. **Create a backend endpoint** (`server.js`):
```javascript
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configure your email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password' // Use App Password for Gmail
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, company_name, message_project } = req.body;

  const mailOptions = {
    from: email,
    to: 'your-business-email@example.com',
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <h2>New Contact Form Message</h2>
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
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
```

2. **Install dependencies:**
```bash
npm install express nodemailer cors
```

3. **Update ContactPopup.jsx:**
   - Find "Option 2: Send to your own backend API"
   - Uncomment the code
   - Update the endpoint URL if needed

---

## 🌐 Option 4: Serverless Functions (Vercel/Netlify)

**Best for:** Modern deployments, no server management

### Vercel Example (`api/contact.js`):
```javascript
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, company_name, message_project } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: email,
      to: process.env.CONTACT_EMAIL,
      subject: `New Contact: ${name}`,
      html: `
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company_name}</p>
        <p><strong>Message:</strong> ${message_project}</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
}
```

Then update the fetch URL in ContactPopup.jsx to `/api/contact`.

---

## 📝 Current Status

The form is currently set to:
- ✅ Validate required fields
- ✅ Show loading state while sending
- ✅ Display error messages
- ✅ Show success confirmation
- ✅ Log form data to console (for testing)

**To activate email sending:**
1. Choose one of the options above
2. Follow the setup steps
3. Uncomment the relevant code in `ContactPopup.jsx`
4. Test your form!

---

## 🔍 Where Messages Are Sent

Currently, messages are:
- **Logged to the browser console** (open DevTools to see)
- Shown in a "thank you" message
- Not actually emailed (until you set up one of the options above)

Once configured, messages will be sent to:
- **EmailJS/FormSpree:** The email you configure in their dashboard
- **Custom Backend:** The email specified in your server code
- **Serverless:** The email set in your environment variables

---

## 💡 Recommendation

For MoneyQuest (financial app), I recommend:
1. **Start with EmailJS** for quick setup
2. **Upgrade to custom backend** as you scale
3. **Use environment variables** to protect credentials

---

## ⚙️ Environment Variables (if using backend)

Create a `.env` file:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CONTACT_EMAIL=where-to-receive@example.com
```

Never commit `.env` to version control!

---

Need help? Check the commented code in `ContactPopup.jsx` for detailed instructions.
