<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

$app = require_once 'bootstrap/app.php';

class TestMail extends Mailable
{
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Direct Test Email - Transfer System Debug',
        );
    }

    public function content(): Content
    {
        return new Content(
            html: '
                <h1>🧪 Email System Debug Test</h1>
                <p>This is a direct test email to verify email delivery.</p>
                <p><strong>Timestamp:</strong> ' . date('Y-m-d H:i:s') . '</p>
                <p><strong>From:</strong> transfers@drime.cloud</p>
                <p><strong>SMTP Server:</strong> razza.o2switch.net:465 (SSL)</p>
                <hr>
                <p>If you receive this email, the SMTP configuration is working correctly.</p>
                <p>The issue may be with:</p>
                <ul>
                    <li>Email content triggering spam filters</li>
                    <li>Email headers or formatting</li>
                    <li>Domain reputation (drime.cloud)</li>
                    <li>Recipient email provider filtering</li>
                </ul>
            '
        );
    }
}

try {
    echo "🧪 Testing email delivery directly...\n";
    echo "SMTP Config:\n";
    echo "- Host: " . config('mail.mailers.smtp.host') . "\n";
    echo "- Port: " . config('mail.mailers.smtp.port') . "\n";
    echo "- Encryption: " . config('mail.mailers.smtp.encryption') . "\n";
    echo "- From: " . config('mail.from.address') . "\n";
    
    $email = 'naveen@internetbusinesssolutionsindia.com';
    echo "\n📧 Sending test email to: $email\n";
    
    Mail::to($email)->send(new TestMail());
    
    echo "✅ Email sent successfully via Laravel Mail system\n";
    echo "🔍 Check your inbox and spam folder\n";
    echo "⏰ Emails may take a few minutes to arrive\n";
    
} catch (Exception $e) {
    echo "❌ Error sending email: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}