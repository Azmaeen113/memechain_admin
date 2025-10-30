# MemeChain Admin Dashboard

A modern, responsive admin dashboard for managing the MemeChain presale with a beautiful UI inspired by the main frontend.

## Features

- 🎨 **Modern Design**: Beautiful gradient backgrounds and glassmorphism effects
- 🔐 **Secure Authentication**: Token-based authentication with backend integration
- 📊 **Dashboard Analytics**: Real-time statistics and metrics
- 🚀 **Responsive Layout**: Works perfectly on all devices
- 🎯 **User Management**: View and manage presale participants
- 💰 **Transaction Tracking**: Monitor payments and transactions
- ⚡ **Fast Performance**: Built with Vite and React

## Design Inspiration

The admin dashboard follows the same design language as the main MemeChain frontend:
- Purple and blue gradient backgrounds
- Glassmorphism effects with backdrop blur
- White/transparent cards with subtle borders
- Modern typography and spacing
- Smooth animations and transitions

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Backend server running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3002`

### Default Credentials

- **Email**: admin@memechain.com
- **Password**: Admin@123456

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── api.ts        # API integration
├── pages/
│   ├── Login.tsx     # Login page
│   └── Dashboard.tsx # Main dashboard
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## API Integration

The dashboard integrates with the Flask backend API:
- Authentication endpoints
- Dashboard statistics
- User management
- Transaction tracking
- Presale settings

## Technologies Used

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI components
- **Lucide React** - Icons
- **React Router** - Navigation

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Customization

The design can be customized by modifying:
- `src/index.css` - Global styles and CSS variables
- `tailwind.config.ts` - Tailwind configuration
- Component files for specific styling

## Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service

## Support

For support or questions, please contact the development team.
