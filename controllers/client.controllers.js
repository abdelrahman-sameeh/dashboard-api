const Client = require("../models/client.model");
const asyncHandler = require("../middlewares/asyncHandler");
const Pagination = require("../utils/Pagination");
const Mail = require("../models/mail.model");

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


const deleteClient = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const client = await Client.findById(id);
  if (!client) {
    return next(new ApiError('Client not found', 404));
  }
  await Client.findByIdAndDelete(id);

  await Mail.deleteMany({ client: id });

  return res.status(204).send();
});


module.exports = {
  getClients,
  deleteClient
};
