const asyncHandler = require("../middlewares/asyncHandler");
const Package = require("../models/package.model");
const path = require("path");
const fs = require("fs");

const createPackage = asyncHandler(async (req, res, next) => {
  const { name, admin, capacity, price } = req.body;

  const existingPackage = await Package.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });
  if (existingPackage) {
    if (req.file) {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "packages",
        req.file.filename
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err}`);
        }
      });
    }

    return res.status(400).json({
      message: `package already exists`,
    });
  }

  const data = { name, admin, capacity, price };

  if (req.file) {
    const newFileName = `${name}---${req.file.filename}`;
    data.file = newFileName;

    const oldFilePath = req.file.path; 
    const newFilePath = path.join(
      __dirname,
      "..",
      "uploads",
      "packages",
      newFileName
    );

    fs.rename(oldFilePath, newFilePath, (err) => {
      if (err) {
        console.error("Failed to rename new file:", err);
      }
    });
  }

  let newPackage = new Package(data);
  await newPackage.save();

  res.status(201).json({ status: "success", package: newPackage });
});


const listPackages = asyncHandler(async (req, res, next) => {
  const packages = await Package.find().populate({
    path: "admin",
    select: "name email",
  });

  res.status(200).json({
    status: "success",
    packages,
  });
});


const getOnePackage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find the package by ID
  const package = await Package.findById(id).populate({
    path: "admin",
    select: "name email",
  });

  if (!package) {
    return res.status(404).json({
      message: "Package not found.",
    });
  }

  res.status(200).json({
    status: "success",
    package,
  });
});


const updatePackage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // check if updated package name already used
  if(req.body.name){
    const existingPackage = await Package.findOne({
      name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
      _id: { $ne: id } 
    });

    if (existingPackage) {
      return res.status(400).json({
        message: `package already exists`, 
      });
    }
  }

  // Find the existing package
  const existingPackage = await Package.findById(id);
  if (!existingPackage) {
    return res.status(404).json({
      message: "Package not found",
    });
  }

  const updates = req.body;

  // Check if a new file is being uploaded
  if (req.file) {
    // Build the path for the old file
    const oldFilePath = path.join(
      __dirname,
      "..",
      "uploads",
      "packages",
      existingPackage.file
    );

    // Check if the old file exists and delete it
    if (fs.existsSync(oldFilePath)) {
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Failed to delete old file:", err);
        }
      });
    }

    const newFileName = `${existingPackage.name}---${req.file.filename}`;
    updates.file = newFileName;

    const newFilePath = path.join(
      __dirname,
      "..",
      "uploads",
      "packages",
      newFileName
    );
    fs.rename(req.file.path, newFilePath, (err) => {
      if (err) {
        console.error("Failed to rename new file:", err);
        return res.status(500).json({
          message: "Failed to rename new file.",
        });
      }
    });
  } else if (updates.name) {
    // If only the package name is updated, update the file name accordingly
    const newFileName = `${updates.name}---${existingPackage.file.split('---')[1]}`;
    updates.file = newFileName;

    // Rename the existing file to the new file name
    const oldFilePath = path.join(
      __dirname,
      "..",
      "uploads",
      "packages",
      existingPackage.file
    );
    const newFilePath = path.join(
      __dirname,
      "..",
      "uploads",
      "packages",
      newFileName
    );

    // Check if the old file exists and rename it
    if (fs.existsSync(oldFilePath)) {
      fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
          console.error("Failed to rename old file:", err);
        }
      });
    }
  }

  // Update the package in the database
  const updatedPackage = await Package.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).populate({
    path: "admin",
    select: "name email",
  });

  res.status(200).json({
    status: "success",
    package: updatedPackage,
  });
});


const deletePackage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find the package by ID
  const package = await Package.findById(id);
  if (!package) {
    return res.status(404).json({
      message: "Package not found.",
    });
  }

  // Remove the file associated with the package if it exists
  if (package.file) {
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      "packages",
      package.file
    );

    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err}`);
      }
    });
  }

  // Delete the package from the database
  await Package.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    message: "Package deleted successfully.",
  });
});




module.exports = {
  createPackage,
  listPackages,
  getOnePackage,
  updatePackage,
  deletePackage
};
