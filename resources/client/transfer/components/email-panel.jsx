import React, { useState } from 'react';
import { Dialog } from '@ui/overlays/dialog/dialog';
import { DialogHeader } from '@ui/overlays/dialog/dialog-header';
import { DialogBody } from '@ui/overlays/dialog/dialog-body';
import { DialogFooter } from '@ui/overlays/dialog/dialog-footer';
import { Button } from '@ui/buttons/button';
import { FormTextField } from '@ui/forms/input-field/text-field/text-field';
import { EmailIcon } from '@ui/icons/material/Email';
import { Trans } from '@ui/i18n/trans';
import { toast } from '@ui/toast/toast';
import { apiClient } from '@common/http/query-client';
export function EmailPanel({
  files,
  onClose
}) {
  const [fromEmail, setFromEmail] = useState('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const handleSendEmail = async () => {
    if (!fromEmail) {
      toast.danger('Please fill in your email address');
      return;
    }
    if (!recipientEmails.trim()) {
      toast.danger('Please fill in recipient email addresses');
      return;
    }
    if (!title) {
      toast.danger('Please fill in the title');
      return;
    }
    setSending(true);
    try {
      // Parse recipient emails (split by comma, semicolon, or space)
      const recipientList = recipientEmails.split(/[,;\s]+/).map(email => email.trim()).filter(email => email);
      
      const response = await apiClient.post('guest-uploads/send-email', {
        sender_email: fromEmail,
        recipient_emails: recipientList,
        title: title,
        message: message,
        share_url: files[0]?.share_url,
        files: files.map(file => ({
          filename: file.filename,
          size: file.size
        }))
      });
      toast.positive('Email sent successfully!');
      onClose();
    } catch (error) {
      toast.danger('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const prettyBytes = bytes => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  return <Dialog size="md">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <EmailIcon />
          <Trans message="Email transfer" />
        </div>
      </DialogHeader>
      
      <DialogBody>
        <div className="space-y-6">
          {/* Transfer Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">
              <Trans message="Transfer summary" />
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <Trans message=":count files (:size)" values={{
                count: files.length,
                size: prettyBytes(totalSize)
              }} />
              </div>
              <div className="font-mono text-xs break-all">
                {files[0]?.share_url}
              </div>
            </div>
          </div>

          {/* From Email */}
          <FormTextField name="fromEmail" label={<Trans message="Your email" />} type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="your@email.com" required />

          {/* Recipient Emails */}
          <FormTextField name="recipientEmails" label={<Trans message="Recipient emails" />} type="email" value={recipientEmails} onChange={e => setRecipientEmails(e.target.value)} placeholder="recipient1@example.com, recipient2@example.com" description={<Trans message="Separate multiple emails with commas, semicolons, or spaces" />} required />

          {/* Title */}
          <FormTextField name="title" label={<Trans message="Title" />} value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter email title" required />

          {/* Message */}
          <FormTextField name="message" inputElementType="textarea" label={<Trans message="Message (optional)" />} value={message} onChange={e => setMessage(e.target.value)} placeholder="Add a personal message..." rows={4} />
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="text" onClick={onClose} disabled={sending}>
          <Trans message="Cancel" />
        </Button>
        <Button variant="flat" color="primary" onClick={handleSendEmail} disabled={sending || !fromEmail || !recipientEmails.trim() || !title} startIcon={sending ? undefined : <EmailIcon />}>
          {sending ? <Trans message="Sending..." /> : <Trans message="Send email" />}
        </Button>
      </DialogFooter>
    </Dialog>;
}