import React from 'react';

/**
 * Reusable collapsible panel with a smooth slide-down / fade animation.
 * The children stay mounted while closed so form state is preserved;
 * they are visually collapsed (max-height 0 + opacity 0) and inert.
 */
export default function Collapse({ open, children, duration = 320 }) {
    return (
        <div
            className={`collapsible${open ? ' is-open' : ''}`}
            style={{ '--collapsible-duration': `${duration}ms` }}
        >
            {children}
        </div>
    );
}