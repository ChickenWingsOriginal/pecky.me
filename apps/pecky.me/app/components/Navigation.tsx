'use client';

import Link from 'next/link';
import { css } from '@/styled-system/css';
import { flex } from '@/styled-system/patterns';
import Image from 'next/image';

const navItems = [
  { href: '/bot', label: 'Bot', icon: 'bot-icon.png' },
  { href: '/nft', label: 'NFT', icon: 'nft-icon.png' },
  { href: '/', label: 'Home', icon: 'home-icon.png' },
  { href: '/staking', label: 'Staking', icon: 'staking-icon.png' },
  { href: '/info', label: 'Info', icon: 'info-icon.png' },
];

export default function Navigation() {
  return (
    <>
      <header className={css({ bg: 'linear-gradient(to right, #ffaa00, #ff7700)', px: '20px', py: '12px', w: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: '0', zIndex: '100' })}>
        <div className={flex({ justify: 'space-between', align: 'center' })}>
          <div className={flex({ align: 'center', gap: '12px' })}>
            <Image
              src="/images/pecky-logo.png"
              alt="Pecky Logo"
              width={32}
              height={32}
              priority
            />
            <h1 className={css({ fontSize: '18px', fontWeight: '700', color: 'white', m: '0' })}>
              Pecky
            </h1>
          </div>
        </div>
      </header>

      {/* Footer Navigation */}
      <footer className={css({ position: 'fixed', bottom: '0', left: '0', right: '0', bg: '#fff3da', borderTop: '2px solid #ffae00', boxShadow: '0 -2px 8px rgba(0,0,0,0.08)', zIndex: '50' })}>
        <nav className={flex({ justify: "center", py: '8px', gap: '1rem' })}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={flex({ flexDir: 'column', alignItems: 'center',  py: '8px', px: '8px', color: '#a06500', textDecoration: 'none', fontSize: '11px', fontWeight: '600', transition: 'all 0.2s', _hover: { color: '#ff7700', transform: 'scale(1.05)' } })}
            >
              <div className={css({ position: 'relative', h: '28px', w: '28px', mb: '2px' })}>
                <Image
                  src={`/images/${item.icon}`}
                  alt={item.label}
                  fill
                  className={css({ objectFit: 'contain' })}
                />
              </div>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </footer>

    </>
  );
}
