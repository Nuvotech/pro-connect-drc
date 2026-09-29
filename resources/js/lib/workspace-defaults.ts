import type { ProfessionalFieldDefaults } from '@/components/workspace/professional-fields';
import type { VehicleFieldDefaults } from '@/components/workspace/vehicle-form-card';
import type { VehicleProviderFieldDefaults } from '@/components/workspace/vehicle-provider-fields';
import type {
    FleetVehicle,
    ProfessionalListing,
    VehicleProviderDetail,
} from '@/types';

/**
 * Pre-fill values for editing a saved listing or vehicle. The shared form
 * fields use the server's field names, while page props are camelCase.
 */
export function professionalDefaults(
    listing: ProfessionalListing,
): ProfessionalFieldDefaults {
    return {
        categories: listing.categories,
        experience_years: listing.experienceYears,
        business_name: listing.businessName,
        bio: listing.bio,
        full_name: listing.fullName,
        phone: listing.phone,
        email: listing.email,
        is_on_whatsapp: listing.isOnWhatsApp,
        preferred_language: listing.preferredLanguage,
        city: listing.city,
        commune: listing.commune,
        address: listing.address,
        registry_number: listing.registryNumber,
        tax_id: listing.taxId,
        has_photo: listing.photoUrl !== null,
        has_identity_document: listing.hasIdentityDocument,
    };
}

export function vehicleProviderDefaults(
    provider: VehicleProviderDetail,
): VehicleProviderFieldDefaults {
    return {
        contact_name: provider.contactName,
        business_name: provider.businessName,
        phone: provider.phone,
        email: provider.email,
        is_on_whatsapp: provider.isOnWhatsApp,
        preferred_language: provider.preferredLanguage,
        city: provider.city,
        commune: provider.commune,
        address: provider.address,
        registry_number: provider.registryNumber,
        tax_id: provider.taxId,
        has_identity_document: provider.hasIdentityDocument,
    };
}

export function vehicleDefaults(vehicle: FleetVehicle): VehicleFieldDefaults {
    return {
        category: vehicle.category,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        registration_number: vehicle.registrationNumber ?? '',
        transmission: vehicle.transmission,
        fuel_type: vehicle.fuelType,
        seats: vehicle.seats,
        payload_tonnes: vehicle.payloadTonnes,
        driver_option: vehicle.driverOption,
        daily_rate: vehicle.dailyRate,
        currency: vehicle.currency,
        deposit: vehicle.deposit,
        minimum_rental_days: vehicle.minimumRentalDays,
        quantity: vehicle.quantity,
        insurance_expires_on: vehicle.insuranceExpiresOn,
        notes: vehicle.notes,
        photos: vehicle.photos,
    };
}
