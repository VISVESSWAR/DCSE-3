const DropdownOption = require("../models/DropdownOption");

const getAllOptions = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category, isActive: true } : { isActive: true };
    const options = await DropdownOption.find(query).sort({ order: 1, value: 1 });
    res.json(options);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOptionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const options = await DropdownOption.find({
      category,
      isActive: true,
    }).sort({ order: 1, value: 1 });
    res.json(options);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addOption = async (req, res) => {
  try {
    const { category, value, order } = req.body;

    if (!category || !value) {
      return res
        .status(400)
        .json({ message: "Category and value are required" });
    }

    // Check if option already exists
    const existing = await DropdownOption.findOne({ category, value });
    if (existing) {
      return res.status(400).json({
        message: `Option "${value}" already exists in category "${category}"`,
      });
    }

    const option = new DropdownOption({
      category,
      value: value.trim(),
      order: order || 0,
    });

    const saved = await option.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate option detected",
      });
    }
    res.status(400).json({ message: err.message });
  }
};

const updateOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { value, isActive, order } = req.body;

    const option = await DropdownOption.findById(id);
    if (!option) {
      return res.status(404).json({ message: "Option not found" });
    }

    // Check for duplicate if value is being changed
    if (value && value !== option.value) {
      const existing = await DropdownOption.findOne({
        category: option.category,
        value: value.trim(),
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({
          message: `Option "${value}" already exists in this category`,
        });
      }
    }

    if (value !== undefined) option.value = value.trim();
    if (isActive !== undefined) option.isActive = isActive;
    if (order !== undefined) option.order = order;

    const updated = await option.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteOption = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DropdownOption.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Option not found" });
    }
    res.json({ message: "Option deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const bulkAddOptions = async (req, res) => {
  try {
    const { category, values } = req.body;

    if (!category || !Array.isArray(values) || values.length === 0) {
      return res
        .status(400)
        .json({ message: "Category and values array are required" });
    }

    const optionsToAdd = values.map((value, index) => ({
      category,
      value: value.trim(),
      order: index,
    }));

    // Filter out duplicates
    const existingOptions = await DropdownOption.find({ category });
    const existingValues = new Set(
      existingOptions.map((opt) => opt.value.toLowerCase())
    );

    const newOptions = optionsToAdd.filter(
      (opt) => !existingValues.has(opt.value.toLowerCase())
    );

    if (newOptions.length === 0) {
      return res.status(400).json({
        message: "All options already exist in this category",
      });
    }

    const saved = await DropdownOption.insertMany(newOptions);
    res.status(201).json({
      message: `${saved.length} options added successfully`,
      options: saved,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllOptions,
  getOptionsByCategory,
  addOption,
  updateOption,
  deleteOption,
  bulkAddOptions,
};

