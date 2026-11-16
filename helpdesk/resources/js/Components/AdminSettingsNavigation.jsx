import React from 'react';
import { Link } from '@inertiajs/react';
import { appUrl } from '../url';

const settingsPages = [
    { key: 'accounts', label: 'Admin accounts', href: '/admin/users' },
    { key: 'database', label: 'Database', href: '/admin/database' },
];

export default function AdminSettingsNavigation({ activePage }) {
    return (
        <nav className="admin-settings-navigation" aria-label="Settings pages">
            {settingsPages.map((page) => (
                <Link
                    key={page.key}
                    className={`admin-settings-tab${activePage === page.key ? ' active' : ''}`}
                    href={appUrl(page.href)}
                    aria-current={activePage === page.key ? 'page' : undefined}
                >
                    {page.label}
                </Link>
            ))}
        </nav>
    );
}
