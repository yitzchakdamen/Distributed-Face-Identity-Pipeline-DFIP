export const rootController = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to FaceAlert Server!",
  });
};
