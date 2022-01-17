const createTokenUser = user => {
  return {
    username: user.username,
    userId: user._id,
    email: user.email,
    slug: user.slug,
    role: user.role,
  }
}

module.exports = createTokenUser
