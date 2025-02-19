const { pool } = require('../config/database');

class BudgetMaster {
    static async create(data) {
        const {
            code,
            name,
            parent_id,
            department_id,
            type,
            amount,
            year,
            description,
            created_by
        } = data;

        try {
            const [result] = await pool.execute(
                `INSERT INTO budget_master (
                    code, name, parent_id, department_id, type,
                    amount, year, description, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [code, name, parent_id, department_id, type, amount, year, description, created_by]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating budget:', error);
            throw error;
        }
    }

    static async findAll({ department_id, year, type }) {
        try {
            let sql = `
                SELECT bm.*,
                       d.name as department_name,
                       u1.username as creator_name,
                       u2.username as updater_name,
                       p.name as parent_name
                FROM budget_master bm
                LEFT JOIN departments d ON bm.department_id = d.id
                LEFT JOIN users u1 ON bm.created_by = u1.id
                LEFT JOIN users u2 ON bm.updated_by = u2.id
                LEFT JOIN budget_master p ON bm.parent_id = p.id
                WHERE 1=1
            `;
            const params = [];

            if (department_id) {
                sql += ' AND bm.department_id = ?';
                params.push(department_id);
            }
            if (year) {
                sql += ' AND bm.year = ?';
                params.push(year);
            }
            if (type) {
                sql += ' AND bm.type = ?';
                params.push(type);
            }

            sql += ' ORDER BY bm.code';

            const [rows] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Error finding budgets:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT bm.*,
                        d.name as department_name,
                        u1.username as creator_name,
                        u2.username as updater_name,
                        p.name as parent_name
                 FROM budget_master bm
                 LEFT JOIN departments d ON bm.department_id = d.id
                 LEFT JOIN users u1 ON bm.created_by = u1.id
                 LEFT JOIN users u2 ON bm.updated_by = u2.id
                 LEFT JOIN budget_master p ON bm.parent_id = p.id
                 WHERE bm.id = ?`,
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('Error finding budget:', error);
            throw error;
        }
    }

    static async update(id, data, updated_by) {
        const {
            code,
            name,
            parent_id,
            department_id,
            type,
            amount,
            year,
            description,
            status
        } = data;

        try {
            await pool.execute(
                `UPDATE budget_master 
                 SET code = ?, name = ?, parent_id = ?, department_id = ?,
                     type = ?, amount = ?, year = ?, description = ?,
                     status = ?, updated_by = ?
                 WHERE id = ?`,
                [code, name, parent_id, department_id, type, amount, year, 
                 description, status, updated_by, id]
            );
            return true;
        } catch (error) {
            console.error('Error updating budget:', error);
            throw error;
        }
    }

    static async getHierarchy(year, department_id) {
        try {
            // First get all categories
            const [categories] = await pool.execute(
                `SELECT * FROM budget_master 
                 WHERE type = 'category' AND year = ? 
                 AND (department_id = ? OR department_id IS NULL)
                 ORDER BY code`,
                [year, department_id]
            );

            // For each category, get its subcategories and items
            const hierarchy = await Promise.all(categories.map(async (category) => {
                const [subcategories] = await pool.execute(
                    `SELECT * FROM budget_master 
                     WHERE type = 'subcategory' AND parent_id = ?
                     ORDER BY code`,
                    [category.id]
                );

                const subWithItems = await Promise.all(subcategories.map(async (sub) => {
                    const [items] = await pool.execute(
                        `SELECT * FROM budget_master 
                         WHERE type = 'item' AND parent_id = ?
                         ORDER BY code`,
                        [sub.id]
                    );
                    return { ...sub, items };
                }));

                return { ...category, subcategories: subWithItems };
            }));

            return hierarchy;
        } catch (error) {
            console.error('Error getting budget hierarchy:', error);
            throw error;
        }
    }

    static async validateBudgetCode(code, year, excludeId = null) {
        try {
            let sql = 'SELECT id FROM budget_master WHERE code = ? AND year = ?';
            const params = [code, year];

            if (excludeId) {
                sql += ' AND id != ?';
                params.push(excludeId);
            }

            const [rows] = await pool.execute(sql, params);
            return rows.length === 0;
        } catch (error) {
            console.error('Error validating budget code:', error);
            throw error;
        }
    }
}

module.exports = { BudgetMaster };
