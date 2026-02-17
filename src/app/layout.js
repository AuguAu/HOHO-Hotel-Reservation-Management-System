import "./globals.css";

export const metadata = {
  title: "hoho | Hotel Reservation",
  description: "Modern room reservation management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}