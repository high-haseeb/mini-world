import "./globals.css";

export const metadata = {
    title: "Mini Worlds",
    description: "sandbox world game with fire and water",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
