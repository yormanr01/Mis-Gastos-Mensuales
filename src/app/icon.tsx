import { ImageResponse } from 'next/og';

// Route segment config


// Image metadata
export function generateImageMetadata() {
    return [
        {
            contentType: 'image/png',
            size: { width: 192, height: 192 },
            id: '192',
        },
        {
            contentType: 'image/png',
            size: { width: 512, height: 512 },
            id: '512',
        },
    ];
}

// Image generation
export default function Icon({ id }: { id: string }) {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 18V6" />
            </svg>
        ),
        // ImageResponse options
        {
            width: parseInt(id),
            height: parseInt(id),
        }
    );
}
