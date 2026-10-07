<?php

namespace App\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * The registration details and private documents a listing needs before
 * it can be verified. Individuals prove who they are with an ID document;
 * companies prove they are registered.
 *
 * @property string|null $registry_number
 * @property string|null $tax_id
 * @property string|null $identity_document_path
 * @property string|null $business_registration_path
 */
trait HasVerificationDocuments
{
    use HasProviderType;

    /**
     * The folder on the private disk where this listing's documents live.
     */
    abstract protected function documentDirectory(): string;

    /**
     * The verification items for this kind of provider, keyed so the
     * dashboard can link to the field that fixes each one.
     *
     * @return list<array{key: string, label: string, isDone: bool}>
     */
    public function verificationChecklist(): array
    {
        if (! $this->isCompany()) {
            return [
                ['key' => 'identity_document', 'label' => 'ID document uploaded', 'isDone' => $this->identity_document_path !== null],
            ];
        }

        return [
            ['key' => 'registry_number', 'label' => 'RCCM number added', 'isDone' => filled($this->registry_number)],
            ['key' => 'tax_id', 'label' => 'Tax ID (ID NAT) added', 'isDone' => filled($this->tax_id)],
            ['key' => 'business_registration', 'label' => 'Business registration uploaded', 'isDone' => $this->business_registration_path !== null],
        ];
    }

    /**
     * Company registration details still missing. A company can't be
     * verified until this is empty.
     *
     * @return list<string>
     */
    public function missingCompanyDetails(): array
    {
        if (! $this->isCompany()) {
            return [];
        }

        return collect($this->verificationChecklist())
            ->where('isDone', false)
            ->pluck('label')
            ->values()
            ->all();
    }

    /**
     * Store newly uploaded verification documents, replacing any previous
     * file. Call before saving.
     */
    public function storeVerificationDocuments(Request $request): void
    {
        $documents = [
            'identity_document' => 'identity_document_path',
            'business_registration' => 'business_registration_path',
        ];

        foreach ($documents as $input => $attribute) {
            if (! $request->hasFile($input)) {
                continue;
            }

            if ($this->{$attribute}) {
                Storage::disk('local')->delete($this->{$attribute});
            }

            $this->{$attribute} = $request->file($input)->store($this->documentDirectory(), 'local');
        }
    }
}
