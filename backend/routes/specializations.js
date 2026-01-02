const express = require('express');
const mongoose = require('mongoose');
const Module = require('../models/Module');
const Specialization = require('../models/Specialization');

const router = express.Router();

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeCodeValue = (value = '') => value && typeof value === 'string'
  ? value.trim().toUpperCase()
  : '';
const toComparable = (value = '') => value
  ? value.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  : '';

const normalizeCodes = (codes) => {
  if (!codes) return [];

  let list = [];
  if (Array.isArray(codes)) {
    list = codes;
  } else if (typeof codes === 'string') {
    list = [codes];
  } else {
    return [];
  }

  return list
    .flatMap((value) => {
      if (!value && value !== 0) return [];
      return value
        .toString()
        .split(',')
        .map(piece => piece.trim())
        .filter(Boolean);
    })
    .map(code => normalizeCodeValue(code))
    .filter(Boolean);
};

const buildSpecializationCode = (payload = {}) => {
  if (payload.specializationCode) {
    return normalizeCodeValue(payload.specializationCode);
  }

  const source = payload.name || payload.specializationNamme;
  if (!source) return undefined;

  const letters = source
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  return letters || undefined;
};

const sanitizeSpecializationPayload = (payload = {}) => {
  const sanitized = { ...payload };
  const derivedName = payload.name || payload.specializationNamme;

  if (derivedName && !payload.name) {
    sanitized.name = derivedName.trim();
  }

  if (!payload.specializationNamme && derivedName) {
    sanitized.specializationNamme = derivedName.trim();
  }

  const code = buildSpecializationCode({
    specializationCode: payload.specializationCode,
    name: sanitized.name,
    specializationNamme: sanitized.specializationNamme
  });

  if (code) {
    sanitized.specializationCode = code;
  }

  sanitized.year3Modules = normalizeCodes(payload.year3Modules);
  sanitized.year4Modules = normalizeCodes(payload.year4Modules);

  return sanitized;
};

const transformSpecialization = (doc) => {
  if (!doc) return null;
  const plain = doc.toObject ? doc.toObject() : doc;
  const name = plain.name || plain.specializationNamme || plain.specializationCode || 'Unnamed Specialization';
  const code = plain.specializationCode || buildSpecializationCode(plain) || plain._id?.toString();

  return {
    ...plain,
    name,
    specializationNamme: plain.specializationNamme || name,
    specializationCode: code,
    year3Modules: normalizeCodes(plain.year3Modules),
    year4Modules: normalizeCodes(plain.year4Modules)
  };
};

const findSpecializationByIdentifier = async (identifierRaw = '') => {
  const trimmed = identifierRaw.trim();
  if (!trimmed) return null;

  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    const byId = await Specialization.findById(trimmed).lean();
    if (byId) return byId;
  }

  const normalizedCode = normalizeCodeValue(trimmed);
  if (normalizedCode) {
    const byCode = await Specialization.findOne({
      $or: [
        { specializationCode: normalizedCode },
        { specializationCode: trimmed }
      ]
    }).lean();
    if (byCode) return byCode;
  }

  const escaped = escapeRegex(trimmed);
  const condensed = trimmed.replace(/\s+/g, '');
  const regexCandidates = [
    new RegExp(escaped, 'i'),
    condensed ? new RegExp(escapeRegex(condensed), 'i') : null
  ].filter(Boolean);

  for (const regex of regexCandidates) {
    const byName = await Specialization.findOne({
      $or: [
        { name: regex },
        { specializationNamme: regex }
      ]
    }).lean();

    if (byName) {
      return byName;
    }
  }

  const allSpecs = await Specialization.find().lean();
  const comparableIdentifier = toComparable(trimmed);

  return allSpecs.find(spec => {
    return [spec.specializationCode, spec.name, spec.specializationNamme]
      .some(value => toComparable(value) === comparableIdentifier);
  }) || null;
};

const fetchModulesByCodes = async (codes = [], year) => {
  const normalizedCodes = normalizeCodes(codes);
  if (!normalizedCodes.length) return [];

  const uniqueCodes = [...new Set(normalizedCodes)];
  const codeQuery = {
    $or: uniqueCodes.map(code => ({
      moduleCode: new RegExp(`^${escapeRegex(code)}$`, 'i')
    }))
  };

  const modules = await Module.find(codeQuery).lean();
  const moduleMap = modules.reduce((acc, module) => {
    acc[normalizeCodeValue(module.moduleCode)] = module;
    return acc;
  }, {});

  return normalizedCodes.map(code => {
    if (moduleMap[code]) {
      return moduleMap[code];
    }

    return {
      moduleCode: code,
      moduleName: `Module ${code}`,
      credits: 0,
      year,
      semester: null,
      placeholder: true
    };
  });
};

// Get all specializations
router.get('/', async (req, res) => {
  try {
    const specializations = await Specialization.find().select('-__v').lean();
    const normalized = specializations.map(transformSpecialization);
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get modules for a specific specialization
router.get('/:identifier/modules', async (req, res) => {
  try {
    const identifierRaw = req.params.identifier?.trim();
    if (!identifierRaw) {
      return res.status(400).json({ error: 'Specialization identifier is required' });
    }

    const specialization = await findSpecializationByIdentifier(identifierRaw);

    if (!specialization) {
      return res.status(404).json({ error: 'Specialization not found' });
    }

    const normalizedSpec = transformSpecialization(specialization);

    const [year3Modules, year4Modules] = await Promise.all([
      fetchModulesByCodes(normalizedSpec.year3Modules, 3),
      fetchModulesByCodes(normalizedSpec.year4Modules, 4)
    ]);

    res.json({
      year3Modules,
      year4Modules
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new specialization document
router.post('/', async (req, res, next) => {
  try {
    const payload = sanitizeSpecializationPayload(req.body);
    const specDoc = await Specialization.create(payload);
    res.status(201).json(specDoc);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
