import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "secret");
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authorize = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }

  next();
};
