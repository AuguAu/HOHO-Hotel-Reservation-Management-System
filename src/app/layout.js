import "./globals.css";

export const metadata = {
  //title: "hoho | Hotel Reservation",
  //description: "Room reservation management system",
  icons: {
    icon: [
      {
        url: "/icon.png",
        href: "/icon.png",
      },
      {
        url: "/icon.png",
        href: "/icon.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/icon.png",
        href: "/icon.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icon.png",
        href: "/icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
