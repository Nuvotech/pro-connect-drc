<?php

namespace App\Models;

use Database\Factories\ContactMessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A message someone sent ProConnect through the contact form, read by the
 * team in the admin inbox.
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $name
 * @property string|null $email
 * @property string|null $phone
 * @property string $topic
 * @property string $message
 * @property string $locale
 * @property Carbon|null $read_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'phone', 'topic', 'message', 'locale'])]
class ContactMessage extends Model
{
    /** @use HasFactory<ContactMessageFactory> */
    use HasFactory;

    /**
     * What people can write to us about.
     *
     * @var array<string, string>
     */
    public const TOPICS = [
        'general' => 'General question',
        'support' => 'Help with a request or booking',
        'pro' => 'Joining or using ProConnect as a pro',
        'partnership' => 'Partnership or advertising',
        'complaint' => 'Complaint or report a problem',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    /**
     * The signed-in account that sent the message, if any.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
