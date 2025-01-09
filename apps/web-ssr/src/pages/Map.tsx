import { lazy, Suspense } from 'react';
import './Map.css';

// We lazy load the Map component to ensure it only loads on the client not the server.
// This is because it is a client-side heavy component
const MapComponent = lazy(() => import('../components/MapComponent'));

export default function Map() {
    return (
        <div className="map-page-container">
            <h1>Interactive Map Example</h1>
            <p>
                This page demonstrates the use of client-side heavy components in an SSR environment.
                The map below is loaded using React.lazy() and Suspense, ensuring it only loads on
                the client side while still allowing the page to render quickly on the server.
            </p>

            <div className="map-container">
                {/* Here we use a Suspense boundary to show a fallback until the MapComponent has loaded.
                    This allows the initial server-side render to render the page with the fallback, and
                    for the client to then load the component in the browser as the app is hydrated.*/}
                <Suspense fallback={<div className="map-loading">Loading map...</div>}>
                    <MapComponent />
                </Suspense>
            </div>
        </div>
    );
}