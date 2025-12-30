const express = require('express');
const Module = require('../models/Module');

const router = express.Router();

// Fetch modules with optional filtering by year, semester, specialization, or GPA flag.
router.get('/', async (req, res, next) => {
	try {
		const { year, semester, specialization, gpaOnly } = req.query;
		const filter = {};

		if (year) {
			filter.year = Number(year);
		}

		if (semester) {
			filter.semester = Number(semester);
		}

		if (specialization) {
			filter.specialization = specialization;
		}

		if (gpaOnly === 'true') {
			filter.GPA = true;
		}

		const modules = await Module.find(filter).sort({ year: 1, semester: 1, moduleCode: 1 });
		res.json(modules);
	} catch (error) {
		next(error);
	}
});

// Create a new module document.
router.post('/', async (req, res, next) => {
	try {
		const moduleDoc = await Module.create(req.body);
		res.status(201).json(moduleDoc);
	} catch (error) {
		next(error);
	}
});

// Update an existing module.
router.put('/:id', async (req, res, next) => {
	try {
		const updatedModule = await Module.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		});

		if (!updatedModule) {
			return res.status(404).json({ message: 'Module not found' });
		}

		res.json(updatedModule);
	} catch (error) {
		next(error);
	}
});

// Remove a module.
router.delete('/:id', async (req, res, next) => {
	try {
		const deletedModule = await Module.findByIdAndDelete(req.params.id);

		if (!deletedModule) {
			return res.status(404).json({ message: 'Module not found' });
		}

		res.status(204).end();
	} catch (error) {
		next(error);
	}
});

module.exports = router;
