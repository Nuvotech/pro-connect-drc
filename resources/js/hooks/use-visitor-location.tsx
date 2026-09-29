import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useCities } from '@/hooks/use-categories';
import type { City } from '@/types';

export type VisitorLocationStatus =
    'locating' | 'found' | 'outside' | 'denied' | 'unavailable';

type VisitorLocation = {
    status: VisitorLocationStatus;
    city: City | null;
    retry: () => void;
    chooseCity: (cityName: string) => void;
    /** The town public listings are showing; null means the whole DRC. */
    browsingCity: string | null;
    /** Show listings for another town, or the whole DRC with null. */
    browseCity: (cityName: string | null) => void;
};

type StoredLocation = {
    cityName: string;
    expiresAt: number;
};

const storageKey = 'proconnect.visitor-city';

/**
 * How long a detected city is trusted before asking the browser again.
 */
const detectedLifetime = 30 * 60 * 1000;

/**
 * How long a city the visitor picked by hand is remembered.
 */
const chosenLifetime = 30 * 24 * 60 * 60 * 1000;

/**
 * Farther than this from every served city counts as outside our area.
 */
const maxDistanceKm = 150;

const VisitorLocationContext = createContext<VisitorLocation>({
    status: 'unavailable',
    city: null,
    retry: () => {},
    chooseCity: () => {},
    browsingCity: null,
    browseCity: () => {},
});

const browsingCookie = 'visitor_city';

/**
 * The town in the `visitor_city` cookie the server reads: a town name,
 * `all` for the whole DRC, or null when the visitor never chose.
 */
function readBrowsingCookie(): string | null {
    try {
        const match = document.cookie.match(/(?:^|; )visitor_city=([^;]*)/);

        return match ? decodeURIComponent(match[1]) : null;
    } catch {
        return null;
    }
}

function writeBrowsingCookie(value: string): void {
    try {
        document.cookie = `${browsingCookie}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    } catch {
        // Cookies can be blocked; listings then show every town.
    }
}

/**
 * Reload the current page for the new town, dropping any town already in
 * the URL so the choice applies.
 */
function reloadForTown(): void {
    const url = new URL(window.location.href);
    ['location', 'city', 'page'].forEach((parameter) =>
        url.searchParams.delete(parameter),
    );
    router.visit(url.pathname + url.search, {
        preserveScroll: true,
        preserveState: false,
    });
}

function readStoredCity(): string | null {
    try {
        const stored = JSON.parse(
            localStorage.getItem(storageKey) ?? 'null',
        ) as StoredLocation | null;

        return stored && stored.expiresAt > Date.now() ? stored.cityName : null;
    } catch {
        return null;
    }
}

function storeCity(cityName: string, lifetime: number): void {
    try {
        localStorage.setItem(
            storageKey,
            JSON.stringify({ cityName, expiresAt: Date.now() + lifetime }),
        );
    } catch {
        // Storage can be blocked; the city then lasts for this page only.
    }
}

/**
 * Great-circle distance between two points, in kilometres.
 */
function distanceKm(
    fromLatitude: number,
    fromLongitude: number,
    toLatitude: number,
    toLongitude: number,
): number {
    const radians = (degrees: number) => (degrees * Math.PI) / 180;
    const latitudeDelta = radians(toLatitude - fromLatitude);
    const longitudeDelta = radians(toLongitude - fromLongitude);
    const a =
        Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(radians(fromLatitude)) *
            Math.cos(radians(toLatitude)) *
            Math.sin(longitudeDelta / 2) ** 2;

    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * The served city closest to a position, if one is close enough.
 */
function nearestCity(
    cities: City[],
    latitude: number,
    longitude: number,
): City | null {
    let nearest: City | null = null;
    let nearestDistance = maxDistanceKm;

    for (const city of cities) {
        if (city.latitude === null || city.longitude === null) {
            continue;
        }

        const distance = distanceKm(
            latitude,
            longitude,
            city.latitude,
            city.longitude,
        );

        if (distance <= nearestDistance) {
            nearest = city;
            nearestDistance = distance;
        }
    }

    return nearest;
}

function canUseGeolocation(): boolean {
    return (
        typeof window !== 'undefined' &&
        window.isSecureContext &&
        'geolocation' in navigator
    );
}

/**
 * Asks the browser for the visitor's position as soon as a public page
 * loads, and matches it to the nearest city we serve. When location is
 * blocked, the status is `denied` so the page can ask to turn it on; if
 * the visitor then allows it in the browser, detection runs again.
 */
export function VisitorLocationProvider({ children }: { children: ReactNode }) {
    const { cities, findCity } = useCities();
    const [cityName, setCityName] = useState<string | null>(() =>
        readStoredCity(),
    );
    const [status, setStatus] = useState<VisitorLocationStatus>(() =>
        cityName ? 'found' : canUseGeolocation() ? 'locating' : 'unavailable',
    );
    const [browsingCookieValue, setBrowsingCookieValue] = useState<
        string | null
    >(() => readBrowsingCookie());
    const citiesRef = useRef(cities);

    useEffect(() => {
        citiesRef.current = cities;
    }, [cities]);

    const detect = useCallback(() => {
        if (!canUseGeolocation()) {
            setStatus('unavailable');

            return;
        }

        setStatus((current) => (current === 'found' ? current : 'locating'));

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const city = nearestCity(
                    citiesRef.current,
                    coords.latitude,
                    coords.longitude,
                );

                if (!city) {
                    setStatus('outside');

                    return;
                }

                storeCity(city.name, detectedLifetime);
                setCityName(city.name);
                setStatus('found');

                if (readBrowsingCookie() === null) {
                    writeBrowsingCookie(city.name);
                    setBrowsingCookieValue(city.name);
                    reloadForTown();
                }
            },
            (error) =>
                setStatus(
                    error.code === error.PERMISSION_DENIED
                        ? 'denied'
                        : 'unavailable',
                ),
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: detectedLifetime,
            },
        );
    }, []);

    useEffect(() => {
        if (!canUseGeolocation()) {
            return;
        }

        const hasStoredCity = readStoredCity() !== null;
        let permission: PermissionStatus | null = null;
        let isCancelled = false;

        function handlePermissionChange() {
            if (permission?.state === 'denied') {
                setStatus((current) =>
                    current === 'found' ? current : 'denied',
                );
            } else {
                detect();
            }
        }

        if (!navigator.permissions?.query) {
            if (!hasStoredCity) {
                detect();
            }

            return;
        }

        navigator.permissions
            .query({ name: 'geolocation' })
            .then((result) => {
                if (isCancelled) {
                    return;
                }

                permission = result;
                permission.addEventListener('change', handlePermissionChange);

                if (result.state === 'denied') {
                    setStatus((current) =>
                        current === 'found' ? current : 'denied',
                    );
                } else if (!hasStoredCity) {
                    detect();
                }
            })
            .catch(() => {
                if (!isCancelled && !hasStoredCity) {
                    detect();
                }
            });

        return () => {
            isCancelled = true;
            permission?.removeEventListener('change', handlePermissionChange);
        };
    }, [detect]);

    const browseCity = useCallback((name: string | null) => {
        const value = name ?? 'all';

        writeBrowsingCookie(value);
        setBrowsingCookieValue(value);

        if (name) {
            storeCity(name, chosenLifetime);
            setCityName(name);
            setStatus('found');
        }

        reloadForTown();
    }, []);

    const chooseCity = useCallback(
        (name: string) => browseCity(name),
        [browseCity],
    );

    const value = useMemo<VisitorLocation>(
        () => ({
            status,
            city: status === 'found' ? (findCity(cityName) ?? null) : null,
            retry: detect,
            chooseCity,
            browsingCity:
                browsingCookieValue && browsingCookieValue !== 'all'
                    ? browsingCookieValue
                    : null,
            browseCity,
        }),
        [
            status,
            cityName,
            findCity,
            detect,
            chooseCity,
            browsingCookieValue,
            browseCity,
        ],
    );

    return (
        <VisitorLocationContext.Provider value={value}>
            {children}
        </VisitorLocationContext.Provider>
    );
}

/**
 * The visitor's detected (or chosen) city and the detection status.
 */
export function useVisitorLocation(): VisitorLocation {
    return useContext(VisitorLocationContext);
}
