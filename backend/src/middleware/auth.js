// Simple authentication middleware
// This is a placeholder for future JWT-based authentication

const auth = (req, res, next) => {
  // For now, we'll skip authentication
  // In production, implement JWT token verification here

  // Example JWT implementation:
  /*
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
  */

  next();
};

module.exports = auth;
