function authorize(...roles) {
  // Return the actual Express middleware function
  return (req, res, next) => {
    // Extract the client's role from the custom request header
    const role = req.headers['x-user-role'];
    // Block access if the role is missing or not included in the allowed roles
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
    // Proceed to the controller if the user role is authorized
    next();
  };
}

module.exports = authorize;
