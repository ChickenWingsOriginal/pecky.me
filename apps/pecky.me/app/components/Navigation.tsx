'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { css } from '@/styled-system/css';
import { flex } from '@/styled-system/patterns';
import Image from 'next/image';
import HamburgerIcon from './HamburgerIcon';
import { SupraConnectButton } from '@gerritsen/supra-connect';
import { useWallet } from '@/app/context/WalletContext';
import { useGlobalData } from '@/app/context/GlobalDataContext';
import { getRandomQuote } from '@/app/constants/quotes';
import { formatMicroUnits } from '@/app/utils/format';

const navItems = [
  { href: '/bot', label: 'Bot', icon: 'bot-icon.png' },
  { href: '/nft', label: 'NFT', icon: 'nft-icon.png' },
  { href: '/', label: 'Home', icon: 'home-icon.png' },
  { href: '/staking', label: 'Staking', icon: 'staking-icon.png' },
  { href: '/info', label: 'Info', icon: 'info-icon.png' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state } = useWallet();
  const { peckyPrice, circulatingSupply } = useGlobalData();
  const [registerLoading, setRegisterLoading] = useState(false);
  const [randomQuote, setRandomQuote] = useState('');

  const PECKY_DECIMALS = 6; // Pecky uses 6 decimal places
  const PECKY_COIN_MODULE = '0xe54b95920ef1cf9483705a32eab8526f270bc2f936dfb4112fd6ef971509d85d';

  // Get random quote on mount
  useEffect(() => {
    setRandomQuote(getRandomQuote());
  }, []);

  // Handle register button click
  const handleRegister = async () => {
    if (!state.isConnected || !state.walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    if (state.isRegistered) {
      alert('You are already registered for Pecky rewards!');
      return;
    }

    setRegisterLoading(true);
    try {
      // Get the Supra provider from the window
      const provider = (window as any).supraProvider;
      if (!provider) {
        alert('Supra wallet not available');
        setRegisterLoading(false);
        return;
      }

      const payload = [
        state.walletAddress,
        0,
        PECKY_COIN_MODULE,
        'Coin',
        'register',
        [],
        [],
        {}
      ];

      const txData = await provider.createRawTransactionData(payload);
      await provider.sendTransaction({
        data: txData,
        from: state.walletAddress,
        to: PECKY_COIN_MODULE,
        chainId: '8',
        value: ''
      });

      alert('Registration complete!');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. You may already be registered.');
    } finally {
      setRegisterLoading(false);
    }
  };

  // Format balance for display (convert from micro-units)
  const formatBalance = (balance: bigint | null): string => {
    if (!balance) return '0.00';
    const balanceNumber = Number(balance) / Math.pow(10, PECKY_DECIMALS);
    return balanceNumber.toFixed(2);
  };

  // Calculate Pecky worth in Supra
  const getPeckyWorthInSupra = (): string => {
    if (!state.peckyBalance || !peckyPrice) return '0';
    const peckyAmount = Number(state.peckyBalance) / Math.pow(10, PECKY_DECIMALS);
    const worthInSupra = peckyAmount * peckyPrice;
    return worthInSupra.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  return (
    <>
      <header className={css({ height: '3.5rem', bg: 'linear-gradient(to right, #ffaa00, #ff7700)', px: '1.25rem', py: '0.75rem', w: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'fixed', top: '0', left: '0', right: '0', zIndex: '100' })}>
        <div className={flex({ justify: 'space-between', align: 'center', h: '100%' })}>
          <div className={flex({ align: 'center', gap: '0.75rem' })}>
            <Image
              src="/images/pecky-logo.png"
              alt="Pecky Logo"
              width={32}
              height={32}
              priority
            />
            <h1 className={css({ fontSize: '1.125rem', fontWeight: '700', color: 'white', m: '0' })}>
              Pecky
            </h1>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={css({
              bg: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              p: '0.5rem',
              transition: 'transform 0.2s',
              _hover: { transform: 'scale(1.1)' },
              display: 'flex',
              flexDir: 'column',
            })}
          >
            <HamburgerIcon isOpen={sidebarOpen}  />
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className={css({
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            bg: 'rgba(0, 0, 0, 0.5)',
            zIndex: '40',
            transition: 'opacity 0.2s'
          })}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={css({
          position: 'fixed',
          top: '0',
          left: '0',
          bottom: '0',
          w: '280px',
          bg: '#fff3da',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          zIndex: '50',
          transition: 'transform 0.3s ease-in-out',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          overflow: 'auto',
          pt: '4.5rem',
          px: '1.25rem',
          pb: '1.25rem'
        })}
      >
        {/* Wallet Section */}
        <div className={css({ mb: '2rem' })}>
          <div className={css({ mb: '1rem' })}>
            <div className={css({ fontWeight: '700', mb: '0.5rem', color: '#a06500' })}>
              Wallet balance
            </div>
            {state.isConnected && state.walletAddress ? (
              <>
                <div className={css({ fontWeight: '600', mb: '0.5rem', color: '#513d0a' })}>
                  $Pecky: {state.isLoadingBalances ? 'Loading...' : formatBalance(state.peckyBalance)}
                </div>
                <div className={css({ fontSize: '0.875rem', color: '#b48512' })}>
                  Your Pecky balance is worth: {state.isLoadingBalances ? 'Loading...' : getPeckyWorthInSupra()} $SUPRA
                </div>
              </>
            ) : (
              <>
                <div className={css({ fontSize: '1.5rem', fontWeight: '700', color: '#ff7700', mb: '0.5rem' })}>
                  –
                </div>
                <div className={css({ fontSize: '0.875rem', color: '#b48512' })}>
                  Connect wallet to view balance
                </div>
              </>
            )}
          </div>
          <div className={css({ mb: '0.5rem' })}>
            <SupraConnectButton />
          </div>
          <button
            onClick={handleRegister}
            disabled={registerLoading || !state.isConnected || state.isRegistered === true}
            className={css({
              w: '100%',
              py: '0.75rem',
              px: '1rem',
              bg: state.isRegistered === true ? '#e8f5e9' : 'white',
              color: state.isRegistered === true ? '#2e7d32' : '#ff7700',
              border: state.isRegistered === true ? '1.5px solid #4caf50' : '1.5px solid #ffae00',
              borderRadius: '0.75rem',
              fontWeight: '600',
              cursor: registerLoading || !state.isConnected || state.isRegistered === true ? 'not-allowed' : 'pointer',
              transition: 'transform 0.1s',
              opacity: registerLoading || !state.isConnected ? '0.6' : '1',
              _hover: registerLoading || !state.isConnected || state.isRegistered === true ? {} : { transform: 'scale(1.02)' }
            })}>
            {registerLoading ? 'Registering...' : state.isRegistered === true ? '✓ Registered' : 'Register'}
          </button>
          {state.isRegistered !== true && (
            <div className={css({ fontSize: '0.75rem', color: '#888', mt: '0.5rem', textAlign: 'center' })}>
              (required only once)
            </div>
          )}
        </div>

        {/* Sidebar Note */}
        <div className={css({ bg: '#fffbe8', p: '1rem', borderRadius: '0.75rem', border: '1px solid #ffae00', mb: '1.5rem', fontSize: '0.875rem', color: '#513d0a', fontStyle: 'italic', lineHeight: '1.5' })}>
          "{randomQuote}"
        </div>

        {/* Circulating Supply */}
        <div className={css({ textAlign: 'center', pb: '1.5rem', borderBottom: '1px solid #ffae00' })}>
          <div className={css({ fontWeight: '700', color: '#ff7700', mb: '0.5rem' })}>
            Circulating Supply:
          </div>
          <div className={css({ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: '700', color: '#ff7700', mb: '0.5rem' })}>
            {circulatingSupply !== null ? formatMicroUnits(circulatingSupply) + ' $Pecky' : '–'}
          </div>
          <div className={css({ fontSize: '0.75rem', color: '#b48512' })}>
            1 $Pecky = {peckyPrice ? peckyPrice.toFixed(6) : '–'} $SUPRA
          </div>
        </div>
      </aside>

      {/* Spacer for header */}
      <div className={css({ h: '3.5rem' })} />

      {/* Footer Navigation */}
      <footer className={css({ position: 'fixed', bottom: '0', left: '0', right: '0', bg: '#fff3da', borderTop: '2px solid #ffae00', boxShadow: '0 -2px 8px rgba(0,0,0,0.08)', zIndex: '50' })}>
        <nav className={flex({ justify: "center", py: '0.5rem', gap: '1rem' })}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={flex({ flexDir: 'column', alignItems: 'center', py: '0.5rem', px: '0.5rem', color: isActive ? '#ff7700' : '#a06500', textDecoration: 'none', fontSize: '0.6875rem', fontWeight: '600', transition: 'all 0.2s', _hover: { color: '#ff7700', transform: 'scale(1.05)' } })}
              >
                <div className={css({ position: 'relative', h: '1.75rem', w: '1.75rem', mb: '0.125rem' })}>
                  <Image
                    src={`/images/${item.icon}`}
                    alt={item.label}
                    fill
                    className={css({ objectFit: 'contain' })}
                  />
                </div>
                <span className={css({ borderBottom: isActive ? '2px solid #ff7700' : 'none', paddingBottom: '0.125rem' })}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </footer>

    </>
  );
}
