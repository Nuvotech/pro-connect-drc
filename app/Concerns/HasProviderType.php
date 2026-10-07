<?php

namespace App\Concerns;

/**
 * Whether a pro works for themselves or represents a registered company.
 *
 * @property string $provider_type
 */
trait HasProviderType
{
    public const PROVIDER_INDIVIDUAL = 'individual';

    public const PROVIDER_COMPANY = 'company';

    /** @var list<string> */
    public const PROVIDER_TYPES = [self::PROVIDER_INDIVIDUAL, self::PROVIDER_COMPANY];

    /**
     * Determine whether the pro is a registered company.
     */
    public function isCompany(): bool
    {
        return $this->provider_type === self::PROVIDER_COMPANY;
    }
}
