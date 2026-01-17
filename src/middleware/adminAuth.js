function adminAuth(req, res, next) {
  const token = req.headers["x-admin-token"];

  if (!token || token !== process.env.PAYLITE_ADMIN_SECRET) {
    return res.status(403).json({
      success: false,
      error: "Unauthorized admin access"
    });
  }

  next();
}

module.exports = adminAuth;
