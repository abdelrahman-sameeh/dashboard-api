const express = require("express");
const upload = require("../utils/uploadFiles");
const {
  createPackage,
  listPackages,
  updatePackage,
  deletePackage,
  getOnePackage,
} = require("../controllers/package.controllers");
const {
  createPackageValidator,
  updatePackageValidator,
  getDeletePackageValidator,
} = require("../validators/package.validator");
const { isAuth, allowTo } = require("../controllers/auth.controllers");
const router = express.Router();
const app = express();

app.use(express.urlencoded({ extended: true }));
router
  .route("/packages")
  .post(
    isAuth,
    allowTo("admin"),
    upload('packages').single("file"),
    createPackageValidator,
    createPackage
  )
  .get(isAuth, allowTo("admin"), listPackages);

router
  .route("/package/:id")
  .get(isAuth, allowTo("admin"), getDeletePackageValidator, getOnePackage)
  .patch(
    isAuth,
    allowTo("admin"),
    upload('packages').single("file"),
    updatePackageValidator,
    updatePackage
  )
  .delete(isAuth, allowTo("admin"), getDeletePackageValidator, deletePackage);

module.exports = router;
