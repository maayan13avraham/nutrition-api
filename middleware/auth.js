function authorize(...roles) {
  return (req, res, next) => {
    const role = req.headers['x-user-role'];
    if (!role || !roles.includes(role)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          details: {}
        }
      });
    }
    next();
  };
}

module.exports = authorize;
