export const healthCheck = (req, res) => {
    res.status(200).json({ message: "Server is Up and Running, friend." });
};
