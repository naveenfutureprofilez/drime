# Email Sent Behavior Documentation

## Overview
The `email_sent` field in the `guest_uploads` table now reflects whether a sender email (`sender_email`) was provided in the request.

## Simple Logic

### ✅ `email_sent = true` - When sender email is provided
- When `sender_email` field in the payload is not empty
- `email_sent_at` is set to the current timestamp
- Response includes `"email_sent": true`

### ❌ `email_sent = false` - When sender email is not provided
The system sets `email_sent = false` in the following cases:

1. **Missing Sender Email:**
   - When `sender_email` is empty or null
   - This is the primary condition that determines `email_sent` status

2. **Validation Failures:**
   - Missing required fields (`title`, `share_url`, etc.)
   - Invalid email formats
   - Missing `recipient_emails` array

3. **System Errors:**
   - Upload not found
   - Exceptions during processing

## API Response Examples

### Success Case (from_email provided)
```json
{
  "success": true,
  "message": "Emails sent successfully to all 2 recipients",
  "data": {
    "sender_email": "sender@example.com",
    "link_url": "https://example.com/share/abc123",
    "emails_sent": 2,
    "email_sent": true
  }
}
```

### Even if some emails fail, email_sent is still true (from_email provided)
```json
{
  "success": false,
  "message": "Failed to send emails to any recipients",
  "failed_emails": ["bad1@domain.xyz", "bad2@domain.xyz"],
  "email_sent": true
}
```

### Failure Cases (sender_email missing or validation fails)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "sender_email": ["The sender email field is required."]
  },
  "email_sent": false
}
```

## Database Updates

The system now updates the database record based on `sender_email` presence:

- **When `sender_email` provided:** `email_sent = true` and `email_sent_at = current timestamp`
- **When `sender_email` missing/empty:** `email_sent = false` and `email_sent_at = null`
- **On validation errors:** `email_sent = false`

## Frontend Integration

The frontend:
1. Requires both `sender_email` and `recipient_emails` to enable the send button
2. Validates that both sender and recipient emails are provided
3. The `email_sent` status will be `true` as long as `sender_email` is provided, regardless of actual email sending success

## Key Point

**The `email_sent` field now simply indicates whether a sender email (`sender_email`) was provided in the request, not whether emails were actually delivered successfully.** This is the requested behavior.
