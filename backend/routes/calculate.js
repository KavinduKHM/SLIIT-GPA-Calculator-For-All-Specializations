const express = require('express');
const Specialization = require('../models/Specialization');
const Module = require('../models/Module');

const router = express.Router();

const gradePointMap = {
	'A+': 4,
	A: 4,
	'A-': 3.7,
	'B+': 3.3,
	B: 3,
	'B-': 2.7,
	'C+': 2.3,
	C: 2,
	'C-': 1.7,
	'D+': 1.3,
	D: 1,
	E: 0,
	F: 0
};

// Retrieve available specializations.
router.get('/', async (req, res, next) => {
	try {
		const specializations = await Specialization.find().sort({ specializationNamme: 1 });
		res.json(specializations);
	} catch (error) {
		next(error);
	}
});

// Calculate GPA for the provided modules and optional specialization context.
router.post('/gpa', async (req, res, next) => {
	try {
		const { specializationId, modules = [] } = req.body;

		if (!Array.isArray(modules) || modules.length === 0) {
			return res.status(400).json({ message: 'modules array with at least one entry is required' });
		}

		let specialization = null;

		if (specializationId) {
			specialization = await Specialization.findById(specializationId);

			if (!specialization) {
				return res.status(404).json({ message: 'Specialization not found' });
			}
		}

		let totalCredits = 0;
		let totalPoints = 0;

		for (const entry of modules) {
			const { moduleId, credits, grade, gradePoint } = entry;

			let resolvedCredits = credits;

			if (!resolvedCredits && moduleId) {
				const moduleDoc = await Module.findById(moduleId).select('credits');

				if (!moduleDoc) {
					return res.status(404).json({ message: `Module ${moduleId} not found` });
				}

				resolvedCredits = moduleDoc.credits;
			}

			if (!resolvedCredits || resolvedCredits <= 0) {
				return res.status(400).json({ message: 'Each module requires a positive credit value' });
			}

			const resolvedGradePoint = typeof gradePoint === 'number' ? gradePoint : gradePointMap[grade];

			if (typeof resolvedGradePoint !== 'number') {
				return res.status(400).json({ message: `Unsupported grade provided for module ${moduleId || 'entry'}` });
			}

			totalCredits += resolvedCredits;
			totalPoints += resolvedCredits * resolvedGradePoint;
		}

		const gpa = totalCredits ? totalPoints / totalCredits : 0;

		res.json({
			specialization: specialization
				? {
					  id: specialization._id,
					  name: specialization.specializationNamme,
					  minCreditsYear3: specialization.minCreditsYear3,
					  minCreditsYear4: specialization.minCreditsYear4
				  }
				: null,
			totalCredits,
			totalPoints,
			gpa: Number(gpa.toFixed(3))
		});
	} catch (error) {
		next(error);
	}
});

module.exports = router;
