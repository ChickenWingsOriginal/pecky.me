// Import global styles and fonts
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "404 - Page Not Found | PECKY",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/pecky-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          minHeight: "100vh",
          backgroundColor: "#fff3da",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: "100px",
          margin: 0,
        }}
      >
        <main
          style={{
            maxWidth: "520px",
            width: "90%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* Pecky looking confused */}
          <div style={{ marginBottom: "20px" }}>
            <Image
              src="/images/pecky-logo.png"
              alt="Pecky"
              width={120}
              height={120}
              style={{
                opacity: 0.8,
                filter: "grayscale(0.3)",
              }}
            />
          </div>

          {/* 404 Heading */}
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#ff7700",
              marginBottom: 0,
            }}
          >
            404
          </h1>

          {/* Message */}
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#a06500",
              marginBottom: "8px",
            }}
          >
            Oops! Page Not Found
          </h2>

          <p
            style={{
              fontSize: "16px",
              color: "#b48512",
              marginBottom: "24px",
              lineHeight: 1.6,
            }}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>

          {/* Back to Home Button */}
          <style>{`
            .not-found-button {
              padding: 14px 32px;
              background: linear-gradient(135deg, #ffaa00, #ff7700);
              color: white;
              border: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              cursor: pointer;
              transition: all 0.25s ease;
              box-shadow: 0 4px 12px rgba(255, 119, 0, 0.3);
            }
            .not-found-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(255, 119, 0, 0.4);
            }
            .not-found-button:active {
              transform: translateY(0);
            }
          `}</style>
          <a href="/">
            <button className="not-found-button">Back to Home</button>
          </a>
        </main>
      </body>
    </html>
  );
}
