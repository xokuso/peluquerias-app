/**
 * Email Queue Management System
 * Handles failed emails and retry logic with exponential backoff
 */

import { sendOrderConfirmationEmail, OrderConfirmationData, EmailResult } from './resend';

interface QueuedEmail {
  id: string;
  type: 'order_confirmation' | 'welcome' | 'subscription_reminder';
  data: unknown;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  createdAt: Date;
  status: 'pending' | 'processing' | 'failed' | 'sent';
  error?: string;
}

// In-memory queue for development
// In production, this should be backed by a database or queue service (Redis, SQS, etc.)
const emailQueue: Map<string, QueuedEmail> = new Map();

/**
 * Add an email to the queue
 */
export function queueEmail(
  type: QueuedEmail['type'],
  data: unknown,
  maxAttempts: number = 3
): string {
  const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const queuedEmail: QueuedEmail = {
    id,
    type,
    data,
    attempts: 0,
    maxAttempts,
    createdAt: new Date(),
    status: 'pending'
  };

  emailQueue.set(id, queuedEmail);

  // Trigger processing
  processEmailQueue();

  return id;
}

/**
 * Process pending emails in the queue
 */
export async function processEmailQueue() {
  const pendingEmails = Array.from(emailQueue.values())
    .filter(email => email.status === 'pending' && email.attempts < email.maxAttempts);

  for (const email of pendingEmails) {
    await processQueuedEmail(email);
  }
}

/**
 * Process a single queued email
 */
async function processQueuedEmail(email: QueuedEmail) {
  // Update status
  email.status = 'processing';
  email.lastAttemptAt = new Date();
  email.attempts++;

  try {
    let result: EmailResult;

    switch (email.type) {
      case 'order_confirmation':
        result = await sendOrderConfirmationEmail(email.data as OrderConfirmationData);
        break;
      // Add other email types as needed
      default:
        throw new Error(`Unknown email type: ${email.type}`);
    }

    if (result.success) {
      email.status = 'sent';
      console.log(`Email sent successfully: ${email.id}`);

      // Remove from queue after successful send
      setTimeout(() => {
        emailQueue.delete(email.id);
      }, 60000); // Keep for 1 minute for debugging
    } else {
      throw new Error(result.error || 'Email send failed');
    }
  } catch (error) {
    console.error(`Failed to send email ${email.id}:`, error);

    email.error = error instanceof Error ? error.message : 'Unknown error';

    if (email.attempts >= email.maxAttempts) {
      email.status = 'failed';

      // Log permanently failed email
      await logPermanentlyFailedEmail(email);

      // Keep in queue for manual inspection
      // In production, move to dead letter queue
    } else {
      email.status = 'pending';

      // Schedule retry with exponential backoff
      const delay = calculateBackoffDelay(email.attempts);
      setTimeout(() => {
        if (email.status === 'pending') {
          processQueuedEmail(email);
        }
      }, delay);
    }
  }
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(attempts: number): number {
  // Base delay of 5 seconds, exponentially increasing
  const baseDelay = 5000;
  const maxDelay = 300000; // 5 minutes max

  const delay = Math.min(baseDelay * Math.pow(2, attempts - 1), maxDelay);

  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 1000;

  return delay + jitter;
}

/**
 * Log permanently failed emails for manual intervention
 */
async function logPermanentlyFailedEmail(email: QueuedEmail) {
  const logEntry = {
    emailId: email.id,
    type: email.type,
    data: email.data,
    attempts: email.attempts,
    error: email.error,
    createdAt: email.createdAt,
    lastAttemptAt: email.lastAttemptAt,
    failedAt: new Date()
  };

  console.error('PERMANENTLY FAILED EMAIL:', logEntry);

  // In production:
  // 1. Save to database for manual review
  // 2. Send alert to admin team
  // 3. Log to monitoring service

  if (process.env.NODE_ENV === 'production') {
    // Send critical alert
    try {
      await fetch(process.env.ADMIN_ALERT_WEBHOOK || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'critical_email_failure',
          data: logEntry,
          message: `Email permanently failed after ${email.attempts} attempts`,
          severity: 'critical'
        })
      });
    } catch (alertError) {
      console.error('Failed to send alert:', alertError);
    }
  }
}

/**
 * Get queue status
 */
export function getQueueStatus() {
  const emails = Array.from(emailQueue.values());

  return {
    total: emails.length,
    pending: emails.filter(e => e.status === 'pending').length,
    processing: emails.filter(e => e.status === 'processing').length,
    failed: emails.filter(e => e.status === 'failed').length,
    sent: emails.filter(e => e.status === 'sent').length,
    emails: emails.map(e => ({
      id: e.id,
      type: e.type,
      status: e.status,
      attempts: e.attempts,
      createdAt: e.createdAt,
      error: e.error
    }))
  };
}

/**
 * Retry a failed email
 */
export function retryFailedEmail(emailId: string): boolean {
  const email = emailQueue.get(emailId);

  if (!email) {
    return false;
  }

  if (email.status === 'failed') {
    email.status = 'pending';
    email.attempts = 0;
    delete email.error;

    processQueuedEmail(email);
    return true;
  }

  return false;
}

/**
 * Clear sent emails from queue
 */
export function clearSentEmails() {
  const sentEmails = Array.from(emailQueue.entries())
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, email]) => email.status === 'sent');

  sentEmails.forEach(([id]) => emailQueue.delete(id));

  return sentEmails.length;
}

/**
 * Initialize queue processor
 * Run this on application startup
 */
export function initializeEmailQueueProcessor() {
  // Process queue every 30 seconds
  setInterval(() => {
    processEmailQueue();
  }, 30000);

  // Clear sent emails every 5 minutes
  setInterval(() => {
    clearSentEmails();
  }, 300000);

  console.log('Email queue processor initialized');
}

// Export for debugging
export { emailQueue };