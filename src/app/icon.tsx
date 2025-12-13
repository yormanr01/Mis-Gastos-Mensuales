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
            <div
                style={{
                    fontSize: id === '512' ? 256 : 96,
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed',
                    borderRadius: '50%',
                    border: '12px solid #7c3aed',
                    fontWeight: 'bold',
                }}
            >
                $
            </div>
        ),
        // ImageResponse options
        {
            width: parseInt(id),
            height: parseInt(id),
        }
    );
}
