# RateSphere – Store Rating and Review Platform

RateSphere is a full-stack web application that helps customers discover stores, view ratings, and make better shopping decisions. Store owners can manage their business information and monitor customer feedback, while administrators manage users, stores, and platform activity.

## Live Application

- **Website:** https://rate-sphere.vercel.app
- **Login:** https://rate-sphere.vercel.app/login
- **Backend API:** https://ratesphere-backend.onrender.com/api
- **API Health Check:** https://ratesphere-backend.onrender.com/api/health

## GitHub Repository

https://github.com/Rajesh-poojary053/RateSphere

## Project Screenshots

### User Dashboard
![RateSphere User Dashboard](documentation/screenshots/user%20Dashboard.png)

### User Dashboard – Store Discovery
![RateSphere Store Discovery](documentation/screenshots/user%20dashboard2.png)

### Store Owner Dashboard
![RateSphere Store Owner Dashboard](documentation/screenshots/store%20owner%20dashboard.png)

### Admin Dashboard
![RateSphere Admin Dashboard](documentation/screenshots/Admin%20Dashboard.png)

## Features

### Customer
- Register and log in securely.
- Discover available stores.
- Search stores by name and location.
- View store ratings and reviews.
- Add stores to favorites.
- Submit and manage ratings.
- Change account password.

### Store Owner
- Secure store owner login.
- View business dashboard.
- Monitor store ratings and customer feedback.
- Update store name, email, and address.
- Upload and update store images.
- Change account password.

### Administrator
- Admin dashboard.
- Manage users and store owners.
- Manage registered stores.
- Monitor platform activity.

## Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- Axios
- React Router
- Framer Motion
- Lucide React
- CSS

### Backend
- Node.js
- Express.js
- REST API
- JSON Web Tokens (JWT)
- bcryptjs

### Database
- PostgreSQL
- Prisma ORM

### Image Storage
- Cloudinary

### Deployment
- GitHub
- Render
- Vercel

## Project Structure

```text
RateSphere/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── scripts/
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── documentation/
│   └── screenshots/
└── README.md
```

## Installation and Local Setup

### Prerequisites

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Rajesh-poojary053/RateSphere.git
cd RateSphere
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder.

Configure the required environment variables:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d
PORT=5000
CLIENT_URL=http://localhost:5173
```

Also configure the Cloudinary credentials required by the application.

Generate Prisma Client:

```bash
npx prisma generate
```

Initialize the database schema against your development database:

```bash
npx prisma db push
```

Start the backend:

```bash
npm run dev
```

Backend URL:

http://localhost:5000

### 3. Setup the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the application:

http://localhost:5173

## Deployment

RateSphere is deployed using Render and Vercel.

### Backend Deployment – Render

- **Platform:** Render
- **Service:** Node.js Web Service
- **Root Directory:** `backend`
- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `npm start`

**Production Backend:**

https://ratesphere-backend.onrender.com/api

**Backend Health Check:**

https://ratesphere-backend.onrender.com/api/health

Configure the required environment variables in Render, including:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- Cloudinary credentials

The production database schema must be initialized against the Render PostgreSQL database.

### Frontend Deployment – Vercel

- **Platform:** Vercel
- **Root Directory:** `frontend`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Frontend environment variable:

```env
VITE_API_URL=https://ratesphere-backend.onrender.com/api
```

**Live Website:**

https://rate-sphere.vercel.app

## Production Configuration

Before using the deployed application:

- Configure the production PostgreSQL database.
- Add all required backend environment variables.
- Configure Cloudinary for image uploads.
- Set the frontend API URL to the deployed Render backend.
- Configure CORS to allow the Vercel frontend domain.
- Never upload `.env` files or secret credentials to GitHub.

## Future Improvements

- Email verification.
- Password reset functionality.
- Advanced store recommendations.
- Improved analytics.
- Enhanced store search and filtering.

## Author

**Rajesh Poojary**

B.Tech (Hons.) – Computer Science and Data Science  
Vidyashilp University

## License

This project was developed for academic and learning purposes.