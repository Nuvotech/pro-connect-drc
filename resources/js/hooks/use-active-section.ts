import { useEffect, useState } from 'react';

/**
 * Track which of the given page sections sits under the sticky header,
 * returning its id (or null when none of them is in view).
 */
export function useActiveSection(
    sectionIds: string[],
    isEnabled: boolean = true,
    headerOffset: number = 120,
): string | null {
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const sectionIdsKey = sectionIds.join(',');

    useEffect(() => {
        if (!isEnabled) {
            return;
        }

        const ids = sectionIdsKey.split(',');

        function updateActiveSection() {
            const currentSection = ids.find((id) => {
                const bounds = document
                    .getElementById(id)
                    ?.getBoundingClientRect();

                return (
                    bounds !== undefined &&
                    bounds.top <= headerOffset &&
                    bounds.bottom > headerOffset
                );
            });

            setActiveSectionId(currentSection ?? null);
        }

        const frame = requestAnimationFrame(updateActiveSection);
        window.addEventListener('scroll', updateActiveSection, {
            passive: true,
        });
        window.addEventListener('hashchange', updateActiveSection);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', updateActiveSection);
            window.removeEventListener('hashchange', updateActiveSection);
        };
    }, [sectionIdsKey, isEnabled, headerOffset]);

    return isEnabled ? activeSectionId : null;
}
