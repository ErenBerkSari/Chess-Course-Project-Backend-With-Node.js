const Category = require("../models/Category");

const createCategory = async (req, res) => {
  const { name } = req.body;
  const category = await Category.findOne({ name });
  try {
    if (category) {
      return res.status(400).json({ message: "Kategori zaten var." });
    }
    const newCategory = await Category.create({
      name,
    });
    return res
      .status(201)
      .json({ message: "Kategori oluşturuldu.", newCategory });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Kategori oluşturulurken bir hata oluştu: ${error}` });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params._id });
    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı." });
    }
    return res.status(200).json({ message: "Kategori silindi" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Kategori silinirken bir hata oluştu: ${error}` });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json(categories);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Kategoriler getirilirken bir hata oluştu: ${error}` });
  }
};
module.exports = {
  createCategory,
  deleteCategory,
  getAllCategories,
};
