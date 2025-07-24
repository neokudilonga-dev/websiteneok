
"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Loading() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [previousPath, setPreviousPath] = useState(pathname);

    useEffect(() => {
        if (previousPath !== pathname) {
            setLoading(true);
        }
        setPreviousPath(pathname);
    }, [pathname, previousPath]);

    useEffect(() => {
        // This effect runs when the component using the new pathname has mounted
        // effectively meaning the "loading" is done.
        setLoading(false);
    }, [pathname]);


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
