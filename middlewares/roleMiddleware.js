const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // req.user.role, token'dan gelen role

    if (!requiredRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Bu işlemi yapmaya yetkiniz yok." });
    }

    next(); // Eğer kullanıcı gerekli role sahipse işlemi devam ettir
  };
};

module.exports = roleMiddleware;
