import MaterialSymbol from '@/components/directory/material-symbol';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCities } from '@/hooks/use-categories';
import { useVisitorLocation } from '@/hooks/use-visitor-location';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const itemClassName =
    'cursor-pointer text-label-md text-on-surface focus:bg-surface-container-low focus:text-primary data-[highlighted]:bg-surface-container-low data-[highlighted]:text-primary';

/**
 * The town public listings are showing, with a menu to switch to another
 * town, the whole DRC, or back to the visitor's own location.
 */
export default function TownSwitcher() {
    const { cities } = useCities();
    const {
        browsingCity,
        browseCity,
        city: detectedCity,
        status,
        retry,
    } = useVisitorLocation();

    function showNearMe() {
        if (detectedCity) {
            browseCity(detectedCity.name);
        } else {
            retry();
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={t('Change town')}
                className="flex h-8 max-w-44 cursor-pointer items-center gap-1 rounded-full px-2 text-label-sm font-semibold text-on-surface transition-colors duration-200 hover:bg-surface-container-low hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
                <MaterialSymbol
                    name="location_on"
                    className="shrink-0 text-[18px] text-primary"
                />
                <span className="truncate">
                    {browsingCity ?? t('All of DRC')}
                </span>
                <MaterialSymbol
                    name="expand_more"
                    className="shrink-0 text-[18px] text-outline"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="proconnect w-56 border-outline-variant bg-surface-container-lowest text-on-surface shadow-lg"
            >
                <DropdownMenuLabel className="text-label-sm text-on-surface-variant">
                    {t('Show pros and vehicles in')}
                </DropdownMenuLabel>
                {status !== 'denied' && status !== 'unavailable' && (
                    <DropdownMenuItem
                        onSelect={showNearMe}
                        className={cn(itemClassName, 'gap-2')}
                    >
                        <MaterialSymbol
                            name="my_location"
                            className="text-[18px] text-primary"
                        />
                        {detectedCity
                            ? t('Near me (:city)', { city: detectedCity.name })
                            : t('Near me')}
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-outline-variant" />
                {cities.map((city) => (
                    <DropdownMenuItem
                        key={city.name}
                        onSelect={() => browseCity(city.name)}
                        className={cn(
                            itemClassName,
                            'justify-between',
                            browsingCity === city.name && 'text-primary',
                        )}
                    >
                        {city.name}
                        {browsingCity === city.name && (
                            <MaterialSymbol
                                name="check"
                                className="text-[18px]"
                            />
                        )}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-outline-variant" />
                <DropdownMenuItem
                    onSelect={() => browseCity(null)}
                    className={cn(
                        itemClassName,
                        'justify-between',
                        browsingCity === null && 'text-primary',
                    )}
                >
                    {t('All of DRC')}
                    {browsingCity === null && (
                        <MaterialSymbol name="check" className="text-[18px]" />
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
