export const authMiddleware = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  res.redirect('/login'); // Redirect if not authenticated
};
