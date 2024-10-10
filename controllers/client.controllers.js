const Client = require("../models/client.model");
const asyncHandler = require("../middlewares/asyncHandler");
const Pagination = require("../utils/Pagination");

const getClients = asyncHandler(async (req, res, next) => {
  const { search, page, limit, sort } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // Create an instance of Pagination class
  const pagination = new Pagination(
    "clients",
    Client,
    query,
    page,
    limit,
    sort
  );

  // Get paginated results
  const results = await pagination.paginate();

  // Send response with the paginated results
  res.status(200).json(results);
});

module.exports = {
  getClients,
};
