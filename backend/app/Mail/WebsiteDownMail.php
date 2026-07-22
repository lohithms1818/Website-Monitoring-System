<?php

namespace App\Mail;

use App\Models\Website;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WebsiteDownMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Website $website)
    {
    }

    public function build(): self
    {
        return $this->from('do-not-reply@example.com')
            ->subject(sprintf('%s is down!', $this->website->url))
            ->view('emails.website-down', ['url' => $this->website->url]);
    }
}
