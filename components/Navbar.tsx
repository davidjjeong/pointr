"use client";
import React from 'react'
import Logo from './Logo'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChartLine, DollarSign, Home, ThumbsUp } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { ThemeSwitcherBtn } from './ThemeSwitcherBtn';

function Navbar() {
  return (
    <>
        <DesktopNavbar />
    </>
  )
}

const items = [
    { label: "Home", link: "/", icon: Home},
    { label: "Expenditure", link: "/expenditure", icon: DollarSign },
    { label: "Track", link: "/track", icon: ChartLine },
    { label: "Recommendations", link: "/recommendations", icon: ThumbsUp },
]

function DesktopNavbar() {
    return(
        <aside className="hidden md:flex flex-col items-center w-20 md:w-64 h-screen left-0 top-0 bg-background border-r border-border p-4">
            <nav className="h-full flex flex-col items-center justify-between py-2">
                <div className="flex flex-col gap-y-6">
                    <Logo />
                    <div className="flex flex-col gap-y-1 w-full">
                        {items.map((item) => (
                            <NavbarItem
                                key={item.label}
                                link={item.link}
                                label={item.label}
                                icon={item.icon}
                            />
                        ))}
                    </div>
                </div>
            </nav>
        </aside>
    )
}

function NavbarItem({ label, link, icon: Icon, }: { label: string, link: string, icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }) {
    const pathname = usePathname();
    const isActive = pathname === link;

    return(
        <Link
            href={link}
            className={
                `flex items-center gap-3 px-3 py-2 rounded-md w-full
                ${isActive ? "bg-input text-primary" : "text-foreground hover:bg-input"}`
            }
        >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="hidden md:inline">{label}</span>
        </Link>
    )
}

export default Navbar
