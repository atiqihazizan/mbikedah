const { pool } = require('../config/database');

class BillingRecipient {
    static async create(data) {
        const {
            name,
            address,
            phone,
            email,
            company_name,
            company_registration_no,
            attention_to,
            department_id,
            created_by
        } = data;

        try {
            const [result] = await pool.execute(
                `INSERT INTO billing_recipients (
                    name, address, phone, email, company_name,
                    company_registration_no, attention_to, department_id, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, address, phone, email, company_name,
                 company_registration_no, attention_to, department_id, created_by]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating billing recipient:', error);
            throw error;
        }
    }

    static async findAll({ department_id, status = 1 }) {
        try {
            let sql = `
                SELECT br.*,
                       d.name as department_name,
                       u1.username as creator_name,
                       u2.username as updater_name
                FROM billing_recipients br
                LEFT JOIN departments d ON br.department_id = d.id
                LEFT JOIN users u1 ON br.created_by = u1.id
                LEFT JOIN users u2 ON br.updated_by = u2.id
                WHERE br.status = ?
            `;
            const params = [status];

            if (department_id) {
                sql += ' AND br.department_id = ?';
                params.push(department_id);
            }

            sql += ' ORDER BY br.name';

            const [rows] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Error finding billing recipients:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT br.*,
                        d.name as department_name,
                        u1.username as creator_name,
                        u2.username as updater_name
                 FROM billing_recipients br
                 LEFT JOIN departments d ON br.department_id = d.id
                 LEFT JOIN users u1 ON br.created_by = u1.id
                 LEFT JOIN users u2 ON br.updated_by = u2.id
                 WHERE br.id = ?`,
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('Error finding billing recipient:', error);
            throw error;
        }
    }

    static async update(id, data, updated_by) {
        const {
            name,
            address,
            phone,
            email,
            company_name,
            company_registration_no,
            attention_to,
            department_id,
            status
        } = data;

        try {
            await pool.execute(
                `UPDATE billing_recipients 
                 SET name = ?, address = ?, phone = ?, email = ?,
                     company_name = ?, company_registration_no = ?,
                     attention_to = ?, department_id = ?,
                     status = ?, updated_by = ?
                 WHERE id = ?`,
                [name, address, phone, email, company_name,
                 company_registration_no, attention_to, department_id,
                 status, updated_by, id]
            );
            return true;
        } catch (error) {
            console.error('Error updating billing recipient:', error);
            throw error;
        }
    }

    static async search(query) {
        try {
            const searchTerm = `%${query}%`;
            const [rows] = await pool.execute(
                `SELECT br.*,
                        d.name as department_name
                 FROM billing_recipients br
                 LEFT JOIN departments d ON br.department_id = d.id
                 WHERE br.status = 1
                 AND (
                     br.name LIKE ? OR
                     br.company_name LIKE ? OR
                     br.attention_to LIKE ? OR
                     br.email LIKE ?
                 )
                 ORDER BY br.name
                 LIMIT 10`,
                [searchTerm, searchTerm, searchTerm, searchTerm]
            );
            return rows;
        } catch (error) {
            console.error('Error searching billing recipients:', error);
            throw error;
        }
    }
}

module.exports = { BillingRecipient };
