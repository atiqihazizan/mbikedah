const nodemailer = require('nodemailer');
const { User } = require('../models');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendStatusChangeEmail(billing, oldStatus, newStatus, changedBy, recipients) {
    const emailContent = `
      <h2>Billing Status Update</h2>
      <p>Project: ${billing.no_project}</p>
      <p>Status changed from ${oldStatus} to ${newStatus}</p>
      <p>Changed by: ${changedBy}</p>
      <p>Amount: RM ${billing.amount}</p>
      <p>Due Date: ${billing.due_date}</p>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: recipients.join(','),
      subject: `Billing Status Update - ${billing.no_project}`,
      html: emailContent
    };

    return this.transporter.sendMail(mailOptions);
  }

  async notifyStatusChange(billing, oldStatusId, newStatusId, changedBy) {
    try {
      // Get status names
      const oldStatus = await this.getStatusName(oldStatusId);
      const newStatus = await this.getStatusName(newStatusId);

      // Get users to notify based on billing access
      const accessUsers = await this.getUsersToNotify(billing.id);
      
      // Send email notification
      if (accessUsers.length > 0) {
        await this.sendStatusChangeEmail(
          billing,
          oldStatus,
          newStatus,
          changedBy,
          accessUsers.map(u => u.email)
        );
      }

      // Could add more notification methods here (SMS, Slack, etc.)
    } catch (error) {
      console.error('Notification error:', error);
      // Don't throw error as notification failure shouldn't break the main flow
    }
  }

  async getStatusName(statusId) {
    // This should be replaced with actual status name lookup
    const statuses = {
      1: 'Draft',
      2: 'Pending Approval',
      3: 'Approved',
      4: 'Rejected',
      5: 'Completed',
      6: 'Cancelled'
    };
    return statuses[statusId] || 'Unknown';
  }

  async getUsersToNotify(billingId) {
    // Get users with access to this billing
    const [rows] = await pool.execute(
      `SELECT DISTINCT u.email 
       FROM billing_access ba 
       JOIN users u ON ba.user_id = u.id 
       WHERE ba.billing_id = ? 
       AND u.notification_enabled = true`,
      [billingId]
    );
    return rows;
  }
}

module.exports = new NotificationService();
