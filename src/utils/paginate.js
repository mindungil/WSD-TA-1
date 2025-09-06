export function getPagination(req) {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
  const skip = (page - 1) * limit;

  const sortBy = req.query.sortBy || "createdAt";  
  const order = req.query.order === "asc" ? 1 : -1;

  const sort = { [sortBy]: order };

  return { page, limit, skip, sort };
}
