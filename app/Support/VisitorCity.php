<?php

namespace App\Support;

use App\Models\City;
use Illuminate\Http\Request;

/**
 * The town a visitor is browsing: detected from their location or picked in
 * the header, and kept in the `visitor_city` cookie. Public listings show
 * that town first; "all" (or no cookie) means the whole DRC.
 */
class VisitorCity
{
    public const COOKIE = 'visitor_city';

    /**
     * The value a filter uses to mean "every town", overriding the
     * visitor's own town.
     */
    public const ALL = 'all';

    /**
     * The visitor's town, if it is one we serve.
     */
    public static function from(Request $request): ?string
    {
        $name = $request->cookie(self::COOKIE);

        if (! is_string($name) || $name === '' || $name === self::ALL) {
            return null;
        }

        return City::where('name', $name)->value('name');
    }

    /**
     * The town a list should be filtered by: the one in the URL when given
     * ("all" clears it), otherwise the visitor's town.
     *
     * @return array{city: string|null, isVisitorDefault: bool}
     */
    public static function filter(Request $request, string $parameter): array
    {
        if ($request->has($parameter)) {
            $value = $request->string($parameter)->toString();

            return ['city' => $value === '' || $value === self::ALL ? null : $value, 'isVisitorDefault' => false];
        }

        $visitorCity = self::from($request);

        return ['city' => $visitorCity, 'isVisitorDefault' => $visitorCity !== null];
    }
}
