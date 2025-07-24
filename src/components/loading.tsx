
"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Loading() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const handleStart = (url: string) => {
            if (url !== window.location.pathname) {
                setLoading(true);
            }
        };

        const handleComplete = () => {
            // Add a small delay to prevent flickering on fast page loads
            timer = setTimeout(() => {
                setLoading(false);
            }, 300);
        };

        // This is a workaround to listen to Next.js navigation events
        // as we can't directly use the router events here.
        // We trigger the loading state on pathname change.
        setLoading(true);
        handleComplete();

        return () => {
            clearTimeout(timer);
        };
    }, [pathname]);

    useEffect(() => {
        // This effect runs only once on initial mount to hide the loader.
        setLoading(false);
    }, []);

    if (!loading) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <style jsx>{`
                .book {
                    --color: hsl(var(--primary));
                    --duration: 2.5s;
                    width: 40px;
                    height: 55px;
                    position: relative;
                    perspective: 150px;
                }
                .book__page {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    left: 0;
                    top: 0;
                    background-color: var(--color);
                    transform-style: preserve-3d;
                    transform-origin: left;
                    animation: page-flip var(--duration) infinite;
                }
                .book__page--1 {
                    animation-delay: 0.2s;
                }
                .book__page--2 {
                    animation-delay: 0.4s;
                }
                .book__page--3 {
                    animation-delay: 0.6s;
                }
                .book__page-front,
                .book__page-back {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    left: 0;
                    top: 0;
                    background-color: var(--color);
                    backface-visibility: hidden;
                }
                .book__page-back {
                    transform: rotateY(180deg);
                }
                @keyframes page-flip {
                    0%, 10% { transform: rotateY(0deg); }
                    30%, 60% { transform: rotateY(-180deg); }
                    80%, 100% { transform: rotateY(0deg); }
                }
            `}</style>
            <div className="book">
                <div className="book__page book__page--1">
                    <div className="book__page-front"></div>
                    <div className="book__page-back"></div>
                </div>
                <div className="book__page book__page--2">
                    <div className="book__page-front"></div>
                    <div className="book__page-back"></div>
                </div>
                <div className="book__page book__page--3">
                    <div className="book__page-front"></div>
                    <div className="book__page-back"></div>
                </div>
                <div className="book__page">
                     <div className="book__page-front"></div>
                    <div className="book__page-back"></div>
                </div>
            </div>
        </div>
    );
}
