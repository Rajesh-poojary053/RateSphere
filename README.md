<<<<<<< HEAD
# RateSphere
Store Rating and Review Platform built using React, Node.js, Express and PostgreSQL.
=======
# RateSphere – Store Rating and Review Platform

RateSphere is a full-stack web application that helps customers discover stores, view ratings, and make better shopping decisions. Store owners can manage their business information and monitor customer feedback, while administrators manage the platform.

## Project Screenshots

### User Dashboard

![RateSphere User Dashboard](<documentation/screenshots/user Dashboard.png>)

### User Dashboard – Store Discovery

![RateSphere User Dashboard 2](<documentation/screenshots/user dashboard2.png>)

### Store Owner Dashboard

![RateSphere Store Owner Dashboard](<documentation/screenshots/store owner dashboard.png>)

### Admin Dashboard

![RateSphere Admin Dashboard](<documentation/screenshots/Admin Dashboard.png>)

## Features

### Customer
- Register and log in securely
- Discover available stores
- Search stores by name and location
- View store ratings and reviews
- Add stores to favorites
- Submit and manage ratings
- Change account password

### Store Owner
- Secure store owner login
- View business dashboard
- Monitor store ratings and customer feedback
- Update store name, email, and address
- Upload and update store images
- Change account password

### Administrator
- Admin dashboard
- Manage users and store owners
- Manage registered stores
- Monitor platform activity

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
│
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
│
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
│   ├── package.json
│   └── prisma.schema
│
├── documentation/
│   └── screenshots/
│       ├── user Dashboard.png
│       ├── user dashboard2.png
│       ├── Admin Dashboard.png
│       └── store owner dashboard.png
│
└── README.md
```

## Installation and Local Setup

### Prerequisites

Install the following:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/RateSphere.git
cd RateSphere
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder.

Configure the environment variables required by your backend, including:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
PORT=5000
```

Add your Cloudinary credentials and any other variables required by your backend configuration.

Generate the Prisma client:

```bash
npx prisma generate
```

If your project contains Prisma migrations, apply them to your database:

```bash
npx prisma migrate deploy
```

Start the backend:

```bash
npm run dev
```

The backend will run locally at:

```text
http://localhost:5000
```

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

Open the application in your browser:

```text
http://localhost:5173
```

## GitHub Repository

The source code and project documentation are available in the GitHub repository.

Repository:

https://github.com/YOUR_USERNAME/RateSphere

## Deployment

RateSphere can be deployed using Render for the backend and Vercel for the frontend.

### Backend Deployment – Render

1. Push the project to GitHub.
2. Open [Render](https://render.com).
3. Create a new **Web Service**.
4. Connect your RateSphere GitHub repository.
5. Configure the backend service.

If your backend is inside the `backend` folder, set:

**Root Directory**

```text
backend
```

**Build Command**

```bash
npm install
```

**Start Command**

```bash
npm start
```

If your backend does not have a production start script, configure the start command according to your backend's `package.json`.

Add the required backend environment variables in the Render dashboard.

Important environment variables include:

```env
DATABASE_URL
JWT_SECRET
```

Also configure your Cloudinary credentials and other variables required by the application.

Use a production PostgreSQL database and update the database connection string accordingly.

After deployment, Render will provide a backend URL similar to:

```text
https://ratesphere-api.onrender.com
```

Use your actual Render URL in the frontend configuration.

### Frontend Deployment – Vercel

1. Open [Vercel](https://vercel.com).
2. Import the RateSphere GitHub repository.
3. Configure the frontend project.

If the frontend is inside the `frontend` folder, set:

**Root Directory**

```text
frontend
```

**Build Command**

```bash
npm run build
```

**Output Directory**

```text
dist
```

Add the frontend environment variable:

```env
VITE_API_URL=https://YOUR_RENDER_BACKEND_URL/api
```

Replace the value with your actual Render backend URL.

Deploy the application.

Vercel will provide a frontend URL similar to:

```text
https://ratesphere.vercel.app
```

### Production Configuration

Before using the deployed application:

- Configure the production PostgreSQL database.
- Add all required backend environment variables.
- Configure Cloudinary for image uploads.
- Update the frontend API URL to the Render backend.
- Configure backend CORS to allow your Vercel frontend domain.
- Never upload `.env` files or secret credentials to GitHub.

## Future Improvements

- Email verification
- Password reset functionality
- Advanced store recommendations
- Improved analytics
- Enhanced store search and filtering

## Author

**Rajesh Poojary**

B.Tech (Hons.) – Computer Science and Data Science

Vidyashilp University

## License

This project was developed for academic and learning purposes.
>>>>>>> 2493e5e (Complete RateSphere project)
