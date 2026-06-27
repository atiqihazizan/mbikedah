import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'

const financeOnly = requireRole('finance_hod', 'finance')
import {
  listLayouts, getLayout, createLayout, updateLayout, deleteLayout,
  addSection, updateSection, deleteSection, reorderSections,
  addItem, updateItem, deleteItem, reorderItems, bulkSaveItems,
} from '../controllers/reportLayout.controller.js'

const router = Router()
router.use(authenticate, financeOnly)

// Layouts
router.get('/',        listLayouts)
router.post('/',       createLayout)
router.get('/:id',     getLayout)
router.put('/:id',     updateLayout)
router.delete('/:id',  deleteLayout)

// Sections
router.post('/:id/sections',              addSection)
router.put('/:id/sections/reorder',       reorderSections)
router.put('/:id/sections/:sid',          updateSection)
router.delete('/:id/sections/:sid',       deleteSection)

// Items
router.post('/:id/sections/:sid/items',          addItem)
router.put('/:id/sections/:sid/items/reorder',   reorderItems)
router.put('/:id/sections/:sid/items/bulk',      bulkSaveItems)
router.put('/:id/sections/:sid/items/:iid',      updateItem)
router.delete('/:id/sections/:sid/items/:iid',   deleteItem)

export default router
