const config = {
  appName: import.meta.env.VITE_APP_NAME || "Yummy Yards",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  socketUrl: import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
  defaults: {
    foodImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop",
    avatarImage: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop",
    inventoryImage: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop",
  },
};

export default config;
