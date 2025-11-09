# 🛡️ Manobala

**Manobala** is a support platform created for victims of **domestic violence**, **workplace abuse**, and **child abuse** (via parents). It offers a safe space to seek guidance, access resources, and connect with professionals — all while ensuring privacy and trust.

---

## 📌 Features

- 🔐 **User Registration & Admin Approval**
  - Role-based login: Admin, Experts, Victims/Parents
  - Admin approves or rejects users and experts

- 📚 **Blog Section**
  - Real-life survival stories
  - Platform reviews from recovered users

- 🤖 **AI Chatbot (Gemini-based)**
  - Answers general doubts
  - Learns and stores chat history

- 💬 **Community Forum**
  - Peer-to-peer support and expert insights
  - Admin removes suspicious messages/content

- 🧠 **Expert Consultation**
  - Private legal/psychological guidance through chat

- 🫠 **Support Resources**
  - Personal Safety Plan  
  - Emergency Contact Sheet  
  - Parent-Child Safety Talk Guide  
  - Workplace Discussion Points  
  - Boundaries Worksheet  
  - Trusted Adults Chart  

---

## 👥 User Roles

| Role        | Description |
|-------------|-------------|
| **Admin**   | Manages account approvals, flags, and content moderation |
| **Experts** | Legal advisors and psychologists offering support |
| **Users**   | Victims (or parents in case of child abuse) seeking help |

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite  
- **Backend**: Node.js + Express  
- **Database**: MongoDB  
- **Authentication**: JSON-based login  
- **AI**: Gemini API integration for chatbot  
- **Hosting**: Render & Netlify  

---

## 🤬 Platform Workflow

1. **User/Expert registers**  
2. **Admin reviews and approves account**  
3. **User can:**  
   - Read blogs  
   - Use AI chatbot for doubts  
   - Participate in the community forum  
   - Chat privately with an expert  
4. **Recovered users can post platform reviews**  

---

## 🚀 Getting Started (Local Setup)

### 1️⃣ Clone & Install Dependencies

```bash
git clone https://github.com/your-username/manobala.git
cd manobala
cd client
npm install
cd ../server
npm install
```

---

### 2️⃣ Setup Environment Variables

Before running the app locally, update the `.env` file inside the `client` folder:

```env
# client/.env

VITE_BACKEND_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your-gemini-api-key
```

> ⚠️ **Important:** Change `VITE_BACKEND_URL` to `http://localhost:8000` for local development.  
> The default value (`https://manobala.onrender.com`) is only for production.

---

### 3️⃣ Run the App

Open **two separate terminals** and run:

#### **Start the Server**  
```bash
cd server
npm run dev
```

#### **Start the Client**  
```bash
cd client
npm run dev
```

Now, visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🤝 Contributing

Contributions are welcome! If you’d like to enhance Manobala:

1. **Fork the repo**  
2. **Create a new feature branch**  
3. **Submit a pull request with a clear description**  

---
